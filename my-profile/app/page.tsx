export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans p-8">
      <main className="flex flex-col items-center max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            안재연
          </h1>
          <p className="text-xl font-medium text-zinc-600 dark:text-zinc-400">
            상명대학교 정보보안공학과
          </p>
        </div>

        <div className="h-px w-16 bg-zinc-300 dark:bg-zinc-800" />

        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 max-w-md">
          안녕하세요 바이브 코딩을 배우고 있는 대학생입니다.
        </p>

        <div className="flex gap-4 pt-4">
          <button className="px-6 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400 text-sm font-medium">
            Contact
          </button>
          <button className="px-6 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity text-sm font-medium">
            Projects
          </button>
        </div>
      </main>
    </div>
  );
}
