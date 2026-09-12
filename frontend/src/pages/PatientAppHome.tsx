import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { defaultPatient } from '../data/mockPatient';
import { ProgressRing } from '../components/design-system/ProgressRing';
import { BigActionCard } from '../components/design-system/BigActionCard';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { MobileContainer } from '../components/MobileContainer';
import { Brain, Mic, BookOpen, Bell, Heart, MapPin } from 'lucide-react';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';
import { normalizeLanguageCode } from '../i18n';

export const PatientAppHome: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [patient, setPatient] = useState(defaultPatient);

  // Load patient data and sync preferredLanguage on initial mount
  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPatient((prev) => ({
              ...prev,
              name: data.name ? data.name.split(' ')[0] : prev.name,
              fullName: data.name || prev.fullName,
              avatarUrl: data.avatarUrl || prev.avatarUrl,
            }));

            if (data.preferredLanguage) {
              const langCode = normalizeLanguageCode(data.preferredLanguage);
              if (i18n.language !== langCode) {
                i18n.changeLanguage(langCode);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[PatientAppHome] Using local mock patient defaults:', err);
      }
    }
    loadPatient();
  }, [i18n]);

  // Determine time of day greeting
  const hour = new Date().getHours();
  const greetingText =
    hour < 12
      ? t('greeting_morning', 'Good morning,')
      : hour < 17
      ? t('greeting_afternoon', 'Good afternoon,')
      : t('greeting_evening', 'Good evening,');

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  return (
    <MobileContainer headerTitle={t('home_header', 'Home')}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
        {/* Top Section: Greeting & Today's Journey Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Top Greeting & Patient Avatar */}
          <div className="bg-white/90 rounded-3xl p-4 sm:p-5 shadow-soft-card border border-slate-100/80 flex items-center justify-between">
            <div className="flex-1 pr-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {greetingText} <br />
                <span className="text-[#0D5C4D]">{patient.name}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {t('home_subtitle', patient.subtext)}
              </p>
            </div>

            {/* Circular Patient Avatar Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-teal-500 to-amber-300 shadow-md">
                <img
                  src={patient.avatarUrl}
                  alt={patient.fullName}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </div>

          {/* "Today's Memory Journey" Progress Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft-card border border-slate-100/80 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-3.5 z-10">
              <ProgressRing
                progress={66}
                size={68}
                strokeWidth={6}
                value="2/3"
                label=""
                color="#0D5C4D"
                trackColor="#E6F3F0"
              />

              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {t('todays_memory_journey', "Today's Memory Journey")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#0D5C4D] mt-0.5">
                  2/3 {t('activities_completed', 'activities completed')}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {t('streak_encouragement', 'A calm & joyful memory workout')}
                </span>
              </div>
            </div>

            <div className="w-12 h-16 flex items-center justify-center flex-shrink-0 z-10 pl-2">
              <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M24 60C24 45 23 30 24 16" stroke="#0D5C4D" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 46C18 44 14 38 12 30C18 32 23 38 24 46Z" fill="#10B981" />
                <path d="M24 38C30 36 34 30 36 22C30 24 25 30 24 38Z" fill="#34D399" />
                <path d="M24 26C19 24 16 20 15 14C20 16 23 21 24 26Z" fill="#059669" />
                <circle cx="24" cy="14" r="8" fill="#F59E0B" />
                <circle cx="24" cy="14" r="5.5" fill="#FBBF24" />
                <circle cx="24" cy="14" r="3" fill="#D97706" />
              </svg>
            </div>
          </div>
        </div>

        {/* 5 Big Action Cards: Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <BigActionCard
            theme="pink"
            icon={<Brain />}
            title={t('card_memory_game_title', 'Play Memory Game')}
            subtitle={t('card_memory_game_subtitle', 'Engage & recall')}
            onClick={() => navigate('/games')}
          />

          <BigActionCard
            theme="mint"
            icon={<Mic />}
            title={t('card_talk_title', 'Talk to SmritiSetu')}
            subtitle={t('card_talk_subtitle', 'Voice companion')}
            onClick={() => navigate('/talk')}
          />

          <BigActionCard
            theme="peach"
            icon={<Bell />}
            title={t('card_reminders_title', "Today's Reminders")}
            subtitle={t('card_reminders_subtitle', 'Medicines & routines')}
            onClick={() => navigate('/reminders')}
          />

          <BigActionCard
            theme="rose"
            icon={<Heart />}
            title={t('card_memories_title', 'My Memories')}
            subtitle={t('card_memories_subtitle', 'Your special moments')}
            onClick={() => navigate('/memories')}
          />

          <BigActionCard
            theme="lavender"
            icon={<MapPin />}
            title={t('card_places_title', 'My Places')}
            subtitle={t('card_places_subtitle', 'Find your way')}
            onClick={() => navigate('/places')}
          />
        </div>

        {/* Bottom Full-Width "Tap & Speak" Voice Button Matching Image 5 */}
        <div
          onClick={() => navigate('/talk')}
          className="bg-white hover:bg-emerald-50/40 rounded-3xl p-4 border border-emerald-100 shadow-soft-card flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group"
        >
          {/* Left simulated audio wave */}
          <div className="flex items-center space-x-1 pl-2">
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-emerald-500 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-7 bg-[#0D5C4D] rounded-full animate-pulse delay-150" />
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-100" />
          </div>

          {/* Central Circular Mic & Label */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              {t('tap_and_speak', 'Tap & Speak')}
            </span>
          </div>

          {/* Right simulated audio wave */}
          <div className="flex items-center space-x-1 pr-2">
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-100" />
            <span className="w-1 h-7 bg-[#0D5C4D] rounded-full animate-pulse delay-150" />
            <span className="w-1 h-5 bg-emerald-500 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>

      </div>

      {/* Bottom 5-Icon Navigation Bar */}
      <BottomNavBar activeTab="home" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};
