import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-yellow-300 selection:text-black">
      
      {/* Navigation / Header bar - Neobrutalist style */}
      <nav className="p-4 sm:p-6 border-b-4 border-black flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="text-2xl font-black uppercase tracking-tighter">
          AJY<span className="text-blue-600">.PORTFOLIO</span>
        </div>
        <a 
          href="#contact" 
          className="px-5 py-2 bg-yellow-400 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          Contact
        </a>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-24 space-y-24">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              Student & Developer
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase leading-tight tracking-tighter">
              안재연
            </h1>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 leading-snug">
              상명대학교 <br className="hidden sm:block" /> 
              <span className="bg-yellow-300 px-2 inline-block border-2 border-black mt-2">정보보안공학과</span>
            </h2>
            <p className="text-lg sm:text-xl font-medium max-w-lg border-l-[6px] border-black pl-5 py-2">
              바이브 코딩을 배우고 있는 대학생입니다. 정보보안에 관심이 많으며 문제 해결을 즐기는 개발자를 꿈꿉니다.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#projects" 
                className="px-8 py-4 bg-purple-500 text-white text-lg font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
              >
                View Work
              </a>
              <a 
                href="https://github.com/dksdlf" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white text-black text-lg font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center gap-2"
              >
                 GitHub
              </a>
            </div>
          </div>

          {/* Decorative Elements for Hero (Replacement for Avatar) */}
          <div className="w-full lg:w-1/2 relative h-80 sm:h-96 lg:h-[500px] flex items-center justify-center">
             <div className="relative w-full max-w-[400px] h-full max-h-[400px]">
                {/* Spinning dashed circle */}
                <div className="absolute inset-0 bg-blue-500 border-4 border-black border-dashed rounded-full animate-[spin_20s_linear_infinite]"></div>
                {/* Yellow rectangle */}
                <div className="absolute inset-4 sm:inset-8 bg-yellow-400 border-4 border-black rotate-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"></div>
                {/* Purple rectangle with text */}
                <div className="absolute inset-12 sm:inset-16 bg-purple-500 border-4 border-black -rotate-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                   <div className="text-black font-black text-5xl sm:text-7xl uppercase transform -rotate-12 bg-white px-4 py-2 border-4 border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[80%] text-center">
                    DEV
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* SKILLS & INTERESTS SECTION */}
        <section className="space-y-12 bg-red-400 p-8 sm:p-16 border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)] lg:drop-shadow-[6px_6px_0_rgba(0,0,0,1)]">
            Interests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: "Info Security", color: "bg-yellow-300" },
              { title: "Vibe Coding", color: "bg-blue-300" },
              { title: "Problem Solving", color: "bg-white" },
              { title: "Web Architecture", color: "bg-pink-300" },
              { title: "Systems Dev", color: "bg-green-300" },
              { title: "AI Integration", color: "bg-purple-300" },
            ].map((skill, idx) => (
              <div 
                key={idx} 
                className={`${skill.color} p-6 sm:p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all`}
              >
                <div className="text-xl sm:text-2xl font-black uppercase text-center">{skill.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS PLACEHOLDER SECTION */}
        <section id="projects" className="space-y-12">
            <h2 className="text-5xl sm:text-7xl font-black uppercase inline-block border-b-8 border-black pb-2">
              Featured Work
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {[1, 2].map((item) => (
                 <div key={item} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 group">
                   <div className="w-full aspect-video bg-slate-200 border-4 border-black flex items-center justify-center relative overflow-hidden">
                      {/* Placeholder patterns */}
                      <div className="absolute inset-x-0 h-full w-full bg-repeating-linear-gradient-45 from-transparent to-transparent bg-[length:20px_20px] border-black/10 border-r border-b"></div>
                      <div className="relative text-4xl font-extrabold text-slate-400 transform -rotate-12 group-hover:scale-110 transition-transform">
                        IMAGE {item}
                      </div>
                      <div className="absolute bg-black text-white px-4 py-2 top-4 left-4 font-bold border-2 border-white transform -rotate-3 group-hover:rotate-0 transition-transform">Project {item}</div>
                   </div>
                   <div className="flex-grow">
                     <h3 className="text-3xl font-black mb-2">My Awesome Project {item}</h3>
                     <p className="text-lg font-medium text-slate-700">이 프로젝트는 정보보안과 웹 개발을 융합한 실험적인 프로젝트입니다. 네오브루탈리즘 레이아웃을 통해 강렬한 인상을 남깁니다.</p>
                   </div>
                   <button className="mt-auto self-start px-6 py-3 bg-black text-white text-lg font-bold uppercase border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(150,150,150,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     Read Case Study
                   </button>
                 </div>
               ))}
            </div>
        </section>

      </main>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="mt-24 border-t-8 border-black bg-blue-600 text-white p-8 sm:p-16 text-center lg:text-left shadow-[inset_0px_16px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4">
            <h2 className="text-6xl sm:text-8xl font-black uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,1)] lg:drop-shadow-[6px_6px_0_rgba(0,0,0,1)]">Let's Talk.</h2>
            <p className="text-xl sm:text-2xl font-bold max-w-md mx-auto lg:mx-0">빠르게 성장하는 개발자입니다. 의견이나 문의사항이 있으시면 언제든지 연락주세요.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
             <a href="mailto:contact@example.com" className="w-full sm:w-auto px-8 py-5 bg-yellow-400 text-black text-xl sm:text-2xl font-black uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
               Send Email
             </a>
             <a href="https://github.com/dksdlf" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-5 bg-white text-black text-xl sm:text-2xl font-black uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
               GitHub
             </a>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t-4 border-black/30 font-bold max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-center sm:text-left text-lg">© {new Date().getFullYear()} AHN JAEYEON. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="w-4 h-4 bg-red-400 rounded-full border-2 border-black inline-block"></span>
            <span className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-black inline-block"></span>
            <span className="w-4 h-4 bg-green-400 rounded-full border-2 border-black inline-block"></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
