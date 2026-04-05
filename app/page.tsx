import { dummyLinks } from "@/data/links";
import { Card } from "@/components/ui/card";

export default function Page() {
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
              {/* Profile Avatar Placeholder (will be replaced by Firebase User Image) */}
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
          {dummyLinks.map((link) => {
            let domain = "";
            try {
              domain = new URL(link.url).hostname;
            } catch (e) {
              domain = "";
            }
            
            return (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block w-full outline-none"
              >
                <Card className="relative flex flex-row items-center gap-0 p-4 py-4 h-16 bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(79,70,229,0.15)] group-focus-visible:ring-2 group-focus-visible:ring-indigo-500 rounded-2xl">
                  
                  {/* Subtle Gradient Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {domain && (
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/5 shadow-inner mr-4">
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
                  
                  <div className="relative z-10 flex-1 text-center font-semibold tracking-wide text-zinc-100 pr-14">
                    {link.title}
                  </div>

                  {/* Hover Arrow Icon */}
                  <div className="absolute right-5 flex items-center justify-center text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
