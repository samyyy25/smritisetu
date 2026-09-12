import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, HeartHandshake, ArrowRight, Sparkles, Wrench } from 'lucide-react';
import { LogoLockup } from '../components/design-system/LogoLockup';

export const RoleSelectorScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showCaregiverChooser, setShowCaregiverChooser] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Brand Header */}
      <header className="max-w-xl mx-auto w-full text-center pt-6 sm:pt-12">
        <div className="flex justify-center mb-3">
          <LogoLockup size="lg" theme="light" showTagline={false} />
        </div>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto mt-2">
          AI-Powered Cognitive Care, Memory Bridge & Community Health Platform
        </p>
      </header>

      {/* Main Role Selection Area */}
      <main className="max-w-xl mx-auto w-full my-auto py-8 space-y-6 animate-fadeIn">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Select Your Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose your role to enter the dedicated interface
          </p>
        </div>

        {!showCaregiverChooser ? (
          <div className="grid grid-cols-1 gap-5">
            {/* Button 1: Patient Experience */}
            <button
              type="button"
              onClick={() => navigate('/patient/home')}
              className="group relative w-full p-6 sm:p-7 rounded-[2rem] bg-white border-2 border-emerald-800/15 hover:border-[#0D5C4D] shadow-sm hover:shadow-xl transition-all duration-300 text-left flex items-center justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center space-x-5 relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-[#EAF6F3] text-[#0D5C4D] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#0D5C4D] group-hover:text-white transition-all shadow-inner">
                  <User className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-[#0D5C4D] text-[11px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Elderly & Patient Portal</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#0D5C4D] transition-colors">
                    I'm a Patient
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs sm:max-w-sm leading-relaxed">
                    Voice companion, daily memory games, family photo album & gentle reminders.
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#0D5C4D] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 ml-3 transition-all relative z-10">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Button 2: Caregiver / ASHA Experience */}
            <button
              type="button"
              onClick={() => setShowCaregiverChooser(true)}
              className="group relative w-full p-6 sm:p-7 rounded-[2rem] bg-white border-2 border-slate-200 hover:border-teal-700 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex items-center justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center space-x-5 relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-[#E6F4F1] text-[#07382E] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#07382E] group-hover:text-white transition-all shadow-inner">
                  <Stethoscope className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100/70 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <HeartHandshake className="w-3 h-3" />
                    <span>Clinical & Community Care</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#07382E] transition-colors">
                    I'm a Caregiver / ASHA Worker
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs sm:max-w-sm leading-relaxed">
                    Cognitive analytics, decline alerts, family memory uploads & field visits.
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#07382E] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 ml-3 transition-all relative z-10">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        ) : (
          /* Second Chooser for Caregiver vs ASHA Field Worker */
          <div className="bg-white p-6 sm:p-7 rounded-[2rem] border-2 border-teal-700/30 shadow-lg space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Professional Portal</h3>
                <p className="text-xs text-slate-500">Choose your caregiver or field health view</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCaregiverChooser(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="p-4 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 text-left transition-all group flex flex-col justify-between min-h-[130px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-teal-950 group-hover:text-teal-800">
                      Caregiver Dashboard
                    </h4>
                    <span className="text-[10px] text-teal-700 font-semibold">Clinician & Family Lead</span>
                  </div>
                </div>
                <p className="text-xs text-teal-900/80 mt-2">
                  Cognitive trends, alert triage, memory library & patient overview.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/asha')}
                className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-left transition-all group flex flex-col justify-between min-h-[130px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D5C4D] text-white flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 group-hover:text-[#0D5C4D]">
                      ASHA Field View
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-semibold">Community Health Worker</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-900/80 mt-2">
                  Field visit logs, village patient list & priority home checks.
                </p>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Small Developer / Testing Tools link */}
      <footer className="max-w-xl mx-auto w-full text-center pt-6 pb-2">
        <button
          type="button"
          onClick={() => navigate('/dev-tools')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium hover:underline cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Developer / Testing Tools</span>
        </button>
      </footer>
    </div>
  );
};

export default RoleSelectorScreen;
