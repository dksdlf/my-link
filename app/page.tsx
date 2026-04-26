"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Link } from "@/data/links";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  const [links, setLinks] = useState<Link[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 수정(Edit) 상태 및 React Hook Form
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrorsForm, isSubmitting: isEditSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  // 삭제(Delete) 상태
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      const q = query(
        collection(db, "users", "anonymous", "links"),
        orderBy("createdAt", "desc")
      );

      try {
        const querySnapshot = await getDocs(q);
        const fetchedLinks: Link[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            url: data.url,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          };
        });
        setLinks(fetchedLinks);
      } catch (error) {
        console.error("Error fetching links: ", error);
      }
    };

    fetchLinks();
  }, []);

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = async (data: LinkFormValues) => {
    try {
      const linksRef = collection(db, "users", "anonymous", "links");
      const docRef = await addDoc(linksRef, {
        title: data.title,
        url: data.url,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newLink: Link = {
        id: docRef.id,
        title: data.title,
        url: data.url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLinks((prev) => [newLink, ...prev]);
      setIsDialogOpen(false);
      reset(); // 폼 초기화
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset(); // 다이얼로그가 닫힐 때 폼과 오류 메시지 초기화
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

  const onEditSubmit = async (data: LinkFormValues, id: string) => {
    try {
      const linkRef = doc(db, "users", "anonymous", "links", id);
      await updateDoc(linkRef, {
        title: data.title,
        url: data.url,
        updatedAt: serverTimestamp(),
      });

      setLinks((prev) =>
        prev.map((link) =>
          link.id === id
            ? { ...link, title: data.title, url: data.url, updatedAt: new Date().toISOString() }
            : link
        )
      );
      setEditingLinkId(null);
      resetEdit({ title: "", url: "" });
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("링크 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLink) return;
    setIsDeleting(true);
    try {
      const linkRef = doc(db, "users", "anonymous", "links", deletingLink.id);
      await deleteDoc(linkRef);
      setLinks((prev) => prev.filter((link) => link.id !== deletingLink.id));
      setDeletingLink(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("링크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col items-center p-6 sm:p-12">
        {/* Profile Section */}
        <div className="mt-12 mb-12 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative group cursor-default">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-50 blur-md group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-28 w-28 rounded-full bg-zinc-900 overflow-hidden border-2 border-zinc-800 shadow-2xl flex items-center justify-center">
              <span className="text-4xl font-mono text-zinc-500">M</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              @MyLink
            </h1>
            <p className="text-sm font-medium text-zinc-400 max-w-[280px] leading-relaxed">
              코드를 예술로, 아이디어를 현실로 만드는 크리에이터입니다.
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex w-full max-w-md flex-col gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          {/* Add New Link Button */}
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-dashed border-white/20 bg-white/5 font-semibold text-zinc-300 transition-all hover:border-indigo-500/50 hover:bg-white/10 hover:text-white"
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
                      className={`border-white/10 bg-white/5 text-zinc-100 focus:border-indigo-500/50 ${errors.title ? "border-red-500/50 focus:border-red-500/50" : ""}`}
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
                      className={`border-white/10 bg-white/5 text-zinc-100 focus:border-indigo-500/50 ${errors.url ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                      {...register("url")}
                    />
                    {errors.url && (
                      <p className="text-xs font-medium text-red-400">{errors.url.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                    {isSubmitting ? "추가 중..." : "추가 완료"}
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
                <Button variant="outline" disabled={isDeleting} onClick={() => setDeletingLink(null)} className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white">
                  취소
                </Button>
                <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 min-w-[80px] flex items-center justify-center">
                  {isDeleting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "삭제하기"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {links.map((link) => {
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
                <Card className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 py-0 gap-0 ${!isEditing ? "group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(79,70,229,0.15)] group-focus-within:ring-2 group-focus-within:ring-indigo-500" : ""}`}>
                  
                  {/* Subtle Gradient Hover Overlay */}
                  {!isEditing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  )}

                  {/* 2. CardContent 컨테이너 */}
                  <CardContent className={`relative z-10 flex flex-col justify-center p-4 w-full ${isEditing ? "" : "min-h-[4rem]"}`}>
                    {isEditing ? (
                      <form onSubmit={handleSubmitEdit((data) => onEditSubmit(data, link.id))} className="flex flex-col gap-3 w-full">
                        <div className="space-y-1">
                          <Input
                            placeholder="제목 (예: 나의 깃허브)"
                            className={`h-10 border-white/10 bg-white/5 text-zinc-100 focus:border-indigo-500/50 ${editErrorsForm.title ? "border-red-500/50" : ""}`}
                            {...registerEdit("title")}
                          />
                          {editErrorsForm.title && <p className="text-[11px] font-medium text-red-400 pl-1">{editErrorsForm.title.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input
                            placeholder="URL (https://...)"
                            className={`h-10 border-white/10 bg-white/5 text-zinc-100 focus:border-indigo-500/50 ${editErrorsForm.url ? "border-red-500/50" : ""}`}
                            {...registerEdit("url")}
                          />
                          {editErrorsForm.url && <p className="text-[11px] font-medium text-red-400 pl-1">{editErrorsForm.url.message}</p>}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button type="button" size="sm" variant="ghost" disabled={isEditSubmitting} onClick={handleEditCancel} className="h-9 px-4 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">취소</Button>
                          <Button type="submit" size="sm" disabled={isEditSubmitting} className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 min-w-[60px] flex items-center justify-center">
                            {isEditSubmitting ? (
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-400 hover:bg-white/10 transition-colors"
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
