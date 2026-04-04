

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen overflow-hidden filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen overflow-hidden filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen overflow-hidden filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glassmorphism Profile Card */}
      <main className="relative w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl overflow-hidden group">
        
        {/* Subtle moving glow inside the card on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          
          {/* Avatar Section */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl group-hover:scale-105 transition-transform duration-500 hover:shadow-indigo-500/50">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
               {/* Initial Placeholder */}
               <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-indigo-300 to-purple-300">
                 AJY
               </span>
            </div>
            {/* Online Status Dot */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full shadow-sm animate-pulse"></div>
          </div>
          
          {/* Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              안재연
            </h1>
            <p className="text-lg sm:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              상명대학교 정보보안공학과
            </p>
          </div>

          <div className="w-16 sm:w-24 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-80" />

          {/* Bio */}
          <p className="text-sm sm:text-base leading-relaxed text-slate-300/90 max-w-md font-light tracking-wide">
            안녕하세요 바이브 코딩을 배우고 있는 대학생입니다. 
            정보보안에 관심이 많으며 문제 해결을 즐기는 개발자를 꿈꿉니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg hover:shadow-white/5 hover:-translate-y-1">
              Contact Me
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 text-white text-sm font-semibold tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 flex items-center justify-center gap-2">
              View Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10 w-full justify-center">
            {/* Github */}
            <a href="#" className="p-3.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5 hover:border-white/10 hover:-translate-y-1 duration-300">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="p-3.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5 hover:border-white/10 hover:-translate-y-1 duration-300">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            {/* Email */}
            <a href="#" className="p-3.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5 hover:border-white/10 hover:-translate-y-1 duration-300">
              <span className="sr-only">Email</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
