"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc, increment } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Link } from "@/data/links";
import { UserProfile } from "@/hooks/useAuth";
import NextLink from "next/link";

export default function PublicProfilePage() {
  const params = useParams();
  const nickname = params.nickname as string;

  // 1. 닉네임으로 UID 조회
  const { data: uid, isLoading: isUidLoading, isError: isUidError } = useQuery({
    queryKey: ["nickname", nickname],
    queryFn: async () => {
      const nicknameDoc = await getDoc(doc(db, "nicknames", nickname));
      if (!nicknameDoc.exists()) {
        return null;
      }
      return nicknameDoc.data().uid as string;
    },
    enabled: !!nickname,
    retry: false,
  });

  // 2. UID로 프로필 조회
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      if (!uid) return null;
      const docSnap = await getDoc(doc(db, "users", uid));
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    },
    enabled: !!uid,
  });

  // 3. UID로 링크 목록 조회
  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", uid],
    queryFn: async () => {
      if (!uid) return [];
      const q = query(
        collection(db, "users", uid, "links"),
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
    enabled: !!uid,
  });

  const isLoading = isUidLoading || isProfileLoading || isLinksLoading;

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="relative min-h-svh w-full flex items-center justify-center bg-slate-950 text-white">
        <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // 404 Not Found 화면
  if (isUidError || uid === null) {
    return (
      <div className="relative min-h-svh w-full bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-slate-400 mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            존재하지 않는 닉네임이거나 삭제된 페이지입니다.<br/>
            이 멋진 링크의 주인이 되어보시겠어요?
          </p>
          <NextLink href="/" passHref>
            <Button className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(147,51,234,0.6)]">
              내 MyLink 만들기
            </Button>
          </NextLink>
        </div>
      </div>
    );
  }

  // 퍼블릭 프로필 화면
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col items-center p-6 sm:p-12 pb-32">
        {/* Profile Section */}
        <div className="mt-8 mb-12 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative group cursor-default mx-auto w-fit">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 opacity-50 blur-md transition duration-500"></div>
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
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mx-auto">
              {profile?.username || nickname}
            </h1>
            <p className="text-sm font-medium text-zinc-500 mx-auto">
              mylink.com/{nickname}
            </p>
            {profile?.bio && (
              <p className="text-sm font-medium text-zinc-400 max-w-[280px] leading-relaxed mt-2 mx-auto text-center">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="flex w-full max-w-md flex-col gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          {links.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-zinc-500 font-medium">아직 등록된 링크가 없습니다.</p>
            </div>
          ) : links.map((link) => {
            let domain = "";
            try {
              domain = new URL(link.url).hostname;
            } catch (e) {
              domain = "";
            }

            return (
              <div 
                key={link.id} 
                className="group relative block w-full outline-none"
              >
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full outline-none"
                  onClick={() => {
                    if (uid) {
                      updateDoc(doc(db, "users", uid, "links", link.id), {
                        clickCount: increment(1)
                      }).catch(console.error);
                    }
                  }}
                >
                  <Card className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 py-0 gap-0 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(147,51,234,0.15)] group-focus-within:ring-2 group-focus-within:ring-purple-600">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <CardContent className="relative z-10 flex flex-col justify-center p-4 w-full min-h-[4rem]">
                      <div className="flex flex-row items-center w-full relative">
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
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-50 flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <NextLink href="/" passHref>
          <Button className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 font-semibold rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
            Make your own MyLink
          </Button>
        </NextLink>
      </div>
    </div>
  );
}
