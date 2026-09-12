import React from 'react';
import { useNavigate } from 'react-router-dom';

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#FAF7F2] flex flex-col justify-between items-center px-6 py-5 sm:py-8 font-sans overflow-y-auto no-scrollbar pb-safe">
      {/* Top Header */}
      <div className="text-center mt-2 sm:mt-6 animate-fadeIn">
        <span className="text-xs sm:text-sm font-semibold text-[#0D5C4D] uppercase tracking-wider">
          Welcome to
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#07382E] tracking-tight mt-1 mb-1 sm:mb-2">
          Smriti<span className="text-[#0D5C4D]">Setu</span>
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
          A smarter way to support memory, health and well-being.
        </p>
      </div>

      {/* Hero Image Container */}
      <div className="w-full max-w-xs my-auto py-2 animate-fadeIn">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
          <img
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
            alt="Elderly mother with caring daughter"
            className="w-full aspect-[4/3] sm:aspect-square max-h-52 sm:max-h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] sm:text-xs font-medium leading-snug">
            Personalized cognitive exercises and joyful remembrance for North East families.
          </div>
        </div>
      </div>

      {/* Action Buttons & Footer */}
      <div className="w-full max-w-sm flex flex-col gap-3.5 mb-2 animate-fadeIn">
        <button
          onClick={() => navigate('/patient/home')}
          className="w-full py-4 px-6 bg-[#0D5C4D] hover:bg-[#09463A] active:scale-[0.99] text-white font-semibold rounded-2xl text-base shadow-lg shadow-[#0D5C4D]/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl text-sm transition-all"
        >
          I am a Clinician / Caregiver
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
