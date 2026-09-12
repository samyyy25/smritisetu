import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#FAF7F2] flex flex-col justify-between items-center px-6 py-5 sm:py-8 relative overflow-y-auto no-scrollbar font-sans pb-safe">
      {/* Background Decorative Mountain / Valley SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full object-cover" viewBox="0 0 400 800" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="800" fill="url(#sky-grad)" />
          <path d="M-50 420 Q50 340 180 390 T450 350 L450 800 L-50 800 Z" fill="#C5DFD5" opacity="0.6" />
          <path d="M-20 480 Q100 400 240 460 T480 410 L480 800 L-20 800 Z" fill="#9FCAB9" opacity="0.7" />
          <path d="M120 460 C150 520 80 580 180 660 C260 720 190 780 220 800 L400 800 L400 460 Z" fill="#78B39F" opacity="0.5" />
          <path d="M-40 560 Q80 500 200 580 T440 520 L440 800 L-40 800 Z" fill="#3D7B69" opacity="0.85" />
          <path d="M0 640 Q140 590 280 680 T460 620 L460 800 L0 800 Z" fill="#1C5344" />
          <defs>
            <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FAF7F2" />
              <stop offset="60%" stopColor="#E6F2EC" />
              <stop offset="100%" stopColor="#CEE6DC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header & Logo Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center mt-2 sm:mt-6 animate-fadeIn">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0D5C4D] flex items-center justify-center shadow-xl shadow-[#0D5C4D]/20 mb-3 sm:mb-4 border-4 border-white">
          <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="4" fill="#A7E8C7" />
            <circle cx="30" cy="18" r="4" fill="#A7E8C7" />
            <path d="M12 32C12 26 16 23 18 23C20 23 21 24 24 24C27 24 28 23 30 23C32 23 36 26 36 32" stroke="#A7E8C7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 38C14 31 34 31 40 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M16 34V38M24 33V38M32 34V38" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 6C24 6 20 10 20 12C20 14.2 21.8 16 24 16C26.2 16 28 14.2 28 12C28 10 24 6 24 6Z" fill="#34D399" opacity="0.9" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#07382E] tracking-tight mb-1">
          Smriti<span className="text-[#0D5C4D]">Setu</span>
        </h1>
        <p className="text-[#3D6B5F] text-sm sm:text-base font-medium max-w-xs leading-relaxed">
          Bridging memories, people and care.
        </p>
      </div>

      {/* Serene Landscape Card Frame */}
      <div className="relative z-10 w-full max-w-xs my-auto py-2">
        <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white/80 bg-gradient-to-b from-[#E6F3EE] to-[#C9E5D9] p-3.5 text-center">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
            alt="Serene Assam tea valley and river"
            className="w-full aspect-[16/10] max-h-36 sm:max-h-44 object-cover rounded-2xl shadow-inner mb-2.5"
          />
          <p className="text-[11px] sm:text-xs font-medium text-[#0D5C4D]">
            Supporting cognitive health & elderly dignity across the North East.
          </p>
        </div>
      </div>

      {/* Actions & Footer */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 mb-4 animate-fadeIn">
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 px-6 bg-[#0D5C4D] hover:bg-[#09463A] active:scale-[0.99] text-white font-semibold rounded-2xl text-lg shadow-lg shadow-[#0D5C4D]/25 transition-all flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/patient/home')}
          className="text-xs font-semibold text-[#0D5C4D] hover:underline"
        >
          Skip to Patient App (Home) →
        </button>

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5A7B72] tracking-wider uppercase px-3 py-1 rounded-full bg-white/70 border border-[#0D5C4D]/10">
            <span>SIH 2026</span>
            <span>•</span>
            <span>MDoNER</span>
          </span>
        </div>
      </div>
    </div>
  );
};
