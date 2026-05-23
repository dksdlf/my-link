"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Link } from "@/data/links";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc, writeBatch } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { signInWithGoogle, logout } from "@/lib/auth-service";
import { toast } from "sonner";

// Zod 스키마 정의
const linkSchema = z.object({
  title: z.string()
    .min(2, { message: "제목은 최소 2자 이상 입력해주세요." })
    .max(20, { message: "제목은 20자 이내로 입력해주세요." }),
  url: z.string()
    .min(1, { message: "URL을 입력해주세요." })
    .url({ message: "올바른 URL 형식이 아닙니다. (http:// 또는 https:// 포함)" }),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // TanStack Query: Profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    },
    enabled: !!user,
  });

  // TanStack Query: Links
  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "users", user.uid, "links"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          clickCount: data.clickCount || 0,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        } as Link;
      });
    },
    enabled: !!user,
  });

  // Mutations
  const addLinkMutation = useMutation({
    mutationFn: async (data: LinkFormValues) => {
      if (!user) throw new Error("Not logged in");
      const linksRef = collection(db, "users", user.uid, "links");
      await addDoc(linksRef, {
        title: data.title,
        url: data.url,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.uid] });
      setIsDialogOpen(false);
      reset();
      toast.success("링크가 추가되었습니다.");
    },
    onError: (error) => {
      console.error("Error adding document: ", error);
      toast.error("링크 추가 중 오류가 발생했습니다.");
    }
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: LinkFormValues }) => {
      if (!user) throw new Error("Not logged in");
      const linkRef = doc(db, "users", user.uid, "links", id);
      await updateDoc(linkRef, {
        title: data.title,
        url: data.url,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.uid] });
      setEditingLinkId(null);
      resetEdit({ title: "", url: "" });
      toast.success("링크가 수정되었습니다.");
    },
    onError: (error) => {
      console.error("Error updating document: ", error);
      toast.error("링크 수정 중 오류가 발생했습니다.");
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not logged in");
      const linkRef = doc(db, "users", user.uid, "links", id);
      await deleteDoc(linkRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.uid] });
      setDeletingLink(null);
      toast.success("링크가 삭제되었습니다.");
    },
    onError: (error) => {
      console.error("Error deleting document: ", error);
      toast.error("링크 삭제 중 오류가 발생했습니다.");
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ field, newValue, oldValue }: { field: "username" | "nickname" | "bio", newValue: string, oldValue: string }) => {
      if (!user) throw new Error("Not logged in");
      if (field === "nickname") {
        const newNicknameRef = doc(db, "nicknames", newValue);
        const newNicknameSnap = await getDoc(newNicknameRef);

        if (newNicknameSnap.exists()) {
          throw new Error("ALREADY_EXISTS");
        }

        const batch = writeBatch(db);
        const userRef = doc(db, "users", user.uid);
        const oldNicknameRef = doc(db, "nicknames", oldValue);

        batch.set(newNicknameRef, { uid: user.uid, createdAt: serverTimestamp() });
        batch.update(userRef, { nickname: newValue, updatedAt: serverTimestamp() });
        batch.delete(oldNicknameRef);

        await batch.commit();
        return field;
      } else {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [field]: newValue,
          updatedAt: serverTimestamp(),
        });
        return field;
      }
    },
    onSuccess: (field) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.uid] });
      setEditingProfileField(null);
      if (field === "nickname") toast.success("닉네임이 변경되었습니다.");
      else if (field === "username") toast.success("유저네임이 변경되었습니다.");
      else toast.success("소개글이 변경되었습니다.");
    },
    onError: (error: any) => {
      if (error.message === "ALREADY_EXISTS") {
        toast.error("이미 사용 중인 닉네임입니다.");
      } else {
        console.error("Error updating profile:", error);
        toast.error("프로필 수정 중 오류가 발생했습니다.");
      }
    }
  });

  // 수정(Edit) 상태 및 React Hook Form
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrorsForm },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  // 삭제(Delete) 상태
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  // Profile Edit State
  const [editingProfileField, setEditingProfileField] = useState<"username" | "nickname" | "bio" | null>(null);
  const [profileFormData, setProfileFormData] = useState({ username: "", nickname: "", bio: "" });

  const handleProfileEditStart = (field: "username" | "nickname" | "bio", currentValue: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: currentValue }));
    setEditingProfileField(field);
  };

  const handleProfileSave = (field: "username" | "nickname" | "bio") => {
    if (!user || !profile) return;
    const newValue = profileFormData[field].trim();
    const oldValue = profile[field];

    if (newValue === oldValue) {
      setEditingProfileField(null);
      return;
    }

    if (field !== "bio" && newValue === "") {
      toast.error(field === "username" ? "유저네임을 입력해주세요." : "닉네임을 입력해주세요.");
      setEditingProfileField(null);
      return;
    }

    if (field === "nickname") {
      const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!nicknameRegex.test(newValue)) {
        toast.error("닉네임은 3~20자의 영문, 숫자, 밑줄(_)만 가능합니다.");
        return;
      }
    }

    updateProfileMutation.mutate({ field, newValue, oldValue });
  };

  // React Hook Form 설정 (Add Link)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = (data: LinkFormValues) => {
    addLinkMutation.mutate(data);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset(); 
    }
  };

  const handleEditClick = (link: Link) => {
    setEditingLinkId(link.id);
    resetEdit({ title: link.title, url: link.url });
  };

  const handleEditCancel = () => {
    setEditingLinkId(null);
    resetEdit({ title: "", url: "" });
  };

  const onEditSubmit = (data: LinkFormValues, id: string) => {
    updateLinkMutation.mutate({ id, data });
  };

  const handleDeleteConfirm = () => {
    if (!deletingLink) return;
    deleteLinkMutation.mutate(deletingLink.id);
  };

  // 로딩 화면
  if (authLoading || (user && isProfileLoading)) {
    return (
      <div className="relative min-h-svh w-full flex items-center justify-center bg-slate-950 text-white">
        <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // 뷰 1: 메인 방문 & 랜딩 화면 (로그아웃 상태)
  if (!user) {
    return (
      <div className="relative min-h-svh w-full bg-slate-950 text-slate-50 flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex items-center justify-between p-4 px-6 md:px-12 max-w-7xl mx-auto border-b border-slate-800">
          <div className="font-extrabold text-xl tracking-tight text-purple-500">
            MyLink
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-none px-6"
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (e) {
                toast.error("로그인에 실패했습니다.");
              }
            }}
          >
            로그인
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 py-12 gap-10">
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Development in <span className="text-purple-500">One<br/>Link.</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-400 leading-relaxed pt-2">
              GitHub, 블로그, 포트폴리오까지.<br/>개발자를 위한 모든 링크를 한 페이지에 담아보세요.
            </p>
            <Button 
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (e) {
                  toast.error("로그인에 실패했습니다.");
                }
              }}
              className="h-12 px-10 mt-6 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm md:text-base rounded-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/>
              </svg>
              Google로 시작하기
            </Button>
          </div>

          {/* Mockup Card */}
          <div className="relative mt-8 w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            {/* The tilted card */}
            <div className="bg-slate-900 rounded-2xl p-6 pb-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform -rotate-[2deg] hover:rotate-0 transition-transform duration-500 border border-slate-800 mx-auto w-11/12 sm:w-full">
              {/* Skeleton UI Header */}
              <div className="flex items-center gap-4 mb-6 ml-2">
                <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                <div className="space-y-2.5">
                  <div className="h-3.5 w-28 bg-slate-700 rounded-sm"></div>
                  <div className="h-2.5 w-40 bg-slate-800 rounded-sm"></div>
                </div>
              </div>
              
              {/* Skeleton UI Links */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 w-full h-14 bg-purple-900/20 rounded-xl p-4 border border-purple-600/20">
                  <div className="w-5 h-5 rounded-full bg-purple-600/40"></div>
                  <div className="h-2.5 w-full bg-purple-500/30 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-4 w-full h-14 bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                  <div className="h-2.5 w-full bg-slate-700/50 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Background decorative shadow */}
            <div className="absolute -z-10 bottom-[-20px] left-1/2 -translate-x-1/2 w-[80%] h-[40px] bg-purple-700/20 blur-[30px] rounded-[100%]"></div>
          </div>
        </main>
      </div>
    );
  }

  // 뷰 3: 마이페이지 (로그인 상태)
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* 마이페이지 헤더 */}
      <header className="w-full flex items-center justify-between p-4 px-6 md:px-12 backdrop-blur-md bg-white/5 border-b border-white/10 z-20 sticky top-0">
        <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          MyLink 홈
        </div>
        <div className="flex items-center gap-4 relative">
          <a
            href={`/${profile?.nickname || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
          >
            내 페이지 보기
          </a>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-white/20 transition-all focus:outline-none"
          >
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="profile" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-sm font-mono text-slate-400">{profile?.username?.charAt(0).toUpperCase() || "M"}</span>
              </div>
            )}
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-40 py-1">
                <a
                  href={`/${profile?.nickname || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  내 페이지 보기
                </a>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(`mylink.com/${profile?.nickname || ''}`);
                    toast.success("내 URL이 복사되었습니다.");
                    setIsMenuOpen(false);
                  }}
                >
                  내 URL 복사
                </button>
                <div className="h-px bg-slate-800 mx-2" />
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Dynamic Background Effects */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col items-center p-6 sm:p-12">
        {/* Profile Section */}
        <div className="mt-4 mb-12 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative group cursor-default mx-auto w-fit">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 opacity-50 blur-md group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-28 w-28 rounded-full bg-zinc-900 overflow-hidden border-2 border-zinc-800 shadow-2xl">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="profile" className="w-full h-full object-cover object-center block" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-mono text-zinc-500">{profile?.username?.charAt(0).toUpperCase() || "M"}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-center space-y-2">
            {editingProfileField === "username" ? (
              <div className="flex justify-center relative">
                <Input
                  autoFocus
                  value={profileFormData.username}
                  onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })}
                  onBlur={() => handleProfileSave("username")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                      setEditingProfileField(null);
                    }
                  }}
                  disabled={updateProfileMutation.isPending}
                  className="h-10 text-2xl font-extrabold tracking-tight sm:text-3xl text-center bg-transparent border-b-2 border-purple-500 rounded-none focus-visible:ring-0 px-2 py-1 min-w-[200px]"
                />
                {updateProfileMutation.isPending && editingProfileField === "username" && (
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}
              </div>
            ) : (
              <h1 
                onClick={() => handleProfileEditStart("username", profile?.username || "")}
                className="group relative text-2xl font-extrabold tracking-tight sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-fit mx-auto"
              >
                {profile?.username || "유저네임"}
                <span className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-sm text-purple-500 transition-opacity">✎</span>
              </h1>
            )}

            {editingProfileField === "nickname" ? (
              <div className="flex items-center justify-center text-sm font-medium text-zinc-500 relative w-fit mx-auto">
                <span>mylink.com/</span>
                <Input
                  autoFocus
                  value={profileFormData.nickname}
                  onChange={(e) => setProfileFormData({ ...profileFormData, nickname: e.target.value.toLowerCase() })}
                  onBlur={() => handleProfileSave("nickname")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                      setEditingProfileField(null);
                    }
                  }}
                  disabled={updateProfileMutation.isPending}
                  className="h-6 text-sm font-medium p-0 bg-transparent border-b border-purple-500 rounded-none focus-visible:ring-0 w-[120px] text-zinc-300 ml-0.5"
                />
                {updateProfileMutation.isPending && editingProfileField === "nickname" && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}
              </div>
            ) : (
              <p 
                onClick={() => handleProfileEditStart("nickname", profile?.nickname || "")}
                className="group relative text-sm font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors flex items-center justify-center w-fit mx-auto"
              >
                mylink.com/{profile?.nickname || "nickname"}
                <span className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-purple-500 transition-opacity">✎</span>
              </p>
            )}

            {editingProfileField === "bio" ? (
              <div className="flex justify-center relative mt-2 w-fit mx-auto">
                <Input
                  autoFocus
                  value={profileFormData.bio}
                  onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                  onBlur={() => handleProfileSave("bio")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                      setEditingProfileField(null);
                    }
                  }}
                  disabled={updateProfileMutation.isPending}
                  className="h-8 text-sm font-medium text-center bg-transparent border-b border-purple-500 rounded-none focus-visible:ring-0 px-2 py-1 min-w-[280px] text-zinc-300"
                />
                {updateProfileMutation.isPending && editingProfileField === "bio" && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}
              </div>
            ) : (
              <p 
                onClick={() => handleProfileEditStart("bio", profile?.bio || "")}
                className="group relative text-sm font-medium text-zinc-400 max-w-[280px] leading-relaxed mt-2 mx-auto flex items-center justify-center text-center cursor-pointer hover:text-zinc-300 transition-colors w-fit"
              >
                {profile?.bio || "소개글이 없습니다."}
                <span className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-purple-500 transition-opacity">✎</span>
              </p>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="flex w-full max-w-md flex-col gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          {/* Add New Link Button */}
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-dashed border-white/20 bg-white/5 font-semibold text-zinc-300 transition-all hover:border-purple-600/50 hover:bg-white/10 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:rotate-90"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                새 링크 추가하기
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-900/90 text-zinc-100 backdrop-blur-xl sm:max-w-[425px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    방문자에게 보여줄 새로운 링크 정보를 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-zinc-300">제목</Label>
                    <Input
                      id="title"
                      placeholder="예: 나의 깃허브"
                      className={`border-white/10 bg-white/5 text-zinc-100 focus:border-purple-600/50 ${errors.title ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-xs font-medium text-red-400">{errors.title.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url" className="text-zinc-300">URL 주소</Label>
                    <Input
                      id="url"
                      placeholder="https://github.com/username"
                      className={`border-white/10 bg-white/5 text-zinc-100 focus:border-purple-600/50 ${errors.url ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                      {...register("url")}
                    />
                    {errors.url && (
                      <p className="text-xs font-medium text-red-400">{errors.url.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addLinkMutation.isPending} className="w-full bg-purple-600 font-bold text-white hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {addLinkMutation.isPending && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                    {addLinkMutation.isPending ? "추가 중..." : "추가 완료"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
            <DialogContent className="border-white/10 bg-zinc-900/90 text-zinc-100 backdrop-blur-xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">정말 삭제하시겠습니까?</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <span className="text-base text-zinc-200 block mt-2 mb-4 font-semibold">{deletingLink?.title}</span>
                  <span className="text-red-500 font-medium block">이 작업은 되돌릴 수 없습니다</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button variant="outline" disabled={deleteLinkMutation.isPending} onClick={() => setDeletingLink(null)} className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white">
                  취소
                </Button>
                <Button variant="destructive" disabled={deleteLinkMutation.isPending} onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 min-w-[80px] flex items-center justify-center">
                  {deleteLinkMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "삭제하기"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isLinksLoading ? (
            <div className="flex justify-center py-10">
               <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : links.map((link) => {
            let domain = "";
            try {
              domain = new URL(link.url).hostname;
            } catch (e) {
              domain = "";
            }
            
            const isEditing = editingLinkId === link.id;

            return (
              <div 
                key={link.id} 
                className="group relative block w-full outline-none"
              >
                {/* 1. Card 컨테이너 */}
                <Card className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 py-0 gap-0 ${!isEditing ? "group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(147,51,234,0.15)] group-focus-within:ring-2 group-focus-within:ring-purple-600" : ""}`}>
                  
                  {/* Subtle Gradient Hover Overlay */}
                  {!isEditing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  )}

                  {/* 2. CardContent 컨테이너 */}
                  <CardContent className={`relative z-10 flex flex-col justify-center p-4 w-full ${isEditing ? "" : "min-h-[4rem]"}`}>
                    {isEditing ? (
                      <form onSubmit={handleSubmitEdit((data) => onEditSubmit(data, link.id))} className="flex flex-col gap-3 w-full">
                        <div className="space-y-1">
                          <Input
                            placeholder="제목 (예: 나의 깃허브)"
                            className={`h-10 border-white/10 bg-white/5 text-zinc-100 focus:border-purple-600/50 ${editErrorsForm.title ? "border-red-500/50" : ""}`}
                            {...registerEdit("title")}
                          />
                          {editErrorsForm.title && <p className="text-[11px] font-medium text-red-400 pl-1">{editErrorsForm.title.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input
                            placeholder="URL (https://...)"
                            className={`h-10 border-white/10 bg-white/5 text-zinc-100 focus:border-purple-600/50 ${editErrorsForm.url ? "border-red-500/50" : ""}`}
                            {...registerEdit("url")}
                          />
                          {editErrorsForm.url && <p className="text-[11px] font-medium text-red-400 pl-1">{editErrorsForm.url.message}</p>}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button type="button" size="sm" variant="ghost" disabled={updateLinkMutation.isPending} onClick={handleEditCancel} className="h-9 px-4 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">취소</Button>
                          <Button type="submit" size="sm" disabled={updateLinkMutation.isPending} className="h-9 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 min-w-[60px] flex items-center justify-center">
                            {updateLinkMutation.isPending ? (
                              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                              "저장"
                            )}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-row items-center w-full relative">
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-row items-center w-full outline-none"
                        >
                          {domain && (
                            <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/5 shadow-inner">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`} 
                                alt="" 
                                width={24} 
                                height={24}
                                className="rounded-sm drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 text-center font-semibold tracking-wide text-zinc-100 px-14 truncate">
                            {link.title}
                          </div>
                        </a>

                        {/* Action Buttons Container */}
                        <div className="absolute right-0 flex items-center gap-1">
                          <div className="mr-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-semibold text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>{link.clickCount || 0}</span>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-purple-500 hover:bg-white/10 transition-colors"
                            onClick={(e) => { e.preventDefault(); handleEditClick(link); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            <span className="sr-only">수정</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                            onClick={(e) => { e.preventDefault(); setDeletingLink(link); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            <span className="sr-only">삭제</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
