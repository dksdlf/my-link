"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { type Link } from "@/data/links";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  clicks: {
    label: "클릭 수",
    color: "#9333ea",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "users", user.uid, "links"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Link[];
    },
    enabled: !!user,
  });

  const totalClicks = useMemo(() => {
    return links.reduce((acc, link) => acc + (link.clickCount || 0), 0);
  }, [links]);

  const chartData = useMemo(() => {
    return links
      .map(link => ({
        title: link.title,
        clicks: link.clickCount || 0,
        createdAt: link.createdAt
      }))
      // 클릭수 내림차순, 같으면 최신순(createdAt 내림차순) 정렬
      .sort((a, b) => {
        if (b.clicks !== a.clicks) {
          return b.clicks - a.clicks;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [links]);

  const activeLinksCount = links.length;
  const mostPopularLink = chartData.length > 0 && chartData[0].clicks > 0 ? chartData[0] : null;

  if (authLoading || (user && isLinksLoading)) {
    return (
      <div className="relative min-h-svh w-full flex items-center justify-center bg-slate-950 text-white">
        <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-svh w-full bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-4 px-6 md:px-12 backdrop-blur-md bg-white/5 border-b border-white/10 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="sr-only">뒤로가기</span>
          </Button>
          <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            링크 통계
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 sm:p-12 max-w-5xl mx-auto w-full gap-8">
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Total Clicks Card */}
          <Card className="w-full bg-white/5 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-300 font-medium text-sm">총 클릭 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">
                {totalClicks.toLocaleString()} <span className="text-sm text-purple-500 font-bold ml-1">회</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Links Card */}
          <Card className="w-full bg-white/5 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-300 font-medium text-sm">활성 링크 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">
                {activeLinksCount.toLocaleString()} <span className="text-sm text-purple-500 font-bold ml-1">개</span>
              </div>
            </CardContent>
          </Card>

          {/* Most Popular Link Card */}
          <Card className="w-full bg-white/5 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-300 font-medium text-sm">최고 인기 링크</CardTitle>
            </CardHeader>
            <CardContent>
              {mostPopularLink ? (
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold text-white truncate" title={mostPopularLink.title}>
                    {mostPopularLink.title}
                  </div>
                  <div className="text-sm text-zinc-400 font-medium">
                    {mostPopularLink.clicks.toLocaleString()} 클릭
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-500 mt-2 font-medium">
                  데이터 없음
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clicks by Link Chart */}
        <Card className="w-full bg-white/5 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-zinc-300 font-medium">링크별 성과</CardTitle>
            <CardDescription className="text-zinc-500">각 링크의 누적 클릭 수 비교</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full mt-4">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="title" 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <ChartTooltip 
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar 
                    dataKey="clicks" 
                    fill="#9333ea"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
                <p>아직 등록된 링크가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
