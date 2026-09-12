import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Globe,
  Mic,
  Eye,
  Volume2,
  ChevronRight,
  Sparkles,
  Settings,
  Play,
  MapPin
} from 'lucide-react';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const MoreMenuScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const { easyMode, setEasyMode, voiceGuidance, setVoiceGuidance } = useAccessibility();

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-slate-800">
      {/* Top Header */}
      <div className="bg-[#07382E] text-white pt-8 pb-6 px-4 sm:px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            SmritiSetu Platform
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
            {t('more_title', 'More & Settings')}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            {t('more_subtitle', 'Access patient settings, games setup, and accessibility')}
          </p>
        </div>
      </div>

      <div className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
        {/* Section 1: Patient Profile & Language */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
            {t('sec_personal_lang', 'Personal & Language')}
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            <button
              onClick={() => navigate('/profile')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF6F3] text-[#0D5C4D] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('profile_title', 'Patient Profile')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asha Devi • 72 {t('years_old', 'years old')} • {t('emergency_contact', 'Emergency Contact')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsLangModalOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF5E7] text-[#D97706] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('select_language', 'Choose Language')}
                  </h3>
                  <p className="text-xs text-slate-500">Assamese, Hindi, Nepali, Khasi, Mizo, English</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF6F3] text-[#0D5C4D]">
                {i18n.language.toUpperCase()}
              </span>
            </button>

            <button
              onClick={() => navigate('/talk')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F3EEF9] text-[#7C3AED] flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('card_talk_title', 'Voice Assistant')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('card_talk_subtitle', 'Voice companion & memory queries')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section: My Places Setup (Safe Locations & Navigation) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1 flex items-center justify-between">
            <span>{t('sec_places_management', 'MY PLACES SETUP')}</span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
              SAFE LOCATIONS & HOME
            </span>
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/setup/my-places')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF6F4] text-[#0D5C4D] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#0D5C4D]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('places_setup_title', 'My Places')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    {t('places_setup_subtitle', 'Manage saved locations & Home address')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/setup/my-places')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/places')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Preview map"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cognitive Games Setup (Dedicated Configuration Pages) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1 flex items-center justify-between">
            <span>{t('sec_games_management', 'Cognitive Games Setup (6 Activities)')}</span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
              Setup & Packs
            </span>
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            {/* Game 1: Who Is This Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/who-is-this/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FDEEE9] text-[#E05345] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_who_title', 'Who Is This? (Family Face Match)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Manage real memory photos & family pool
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/who-is-this/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/who-is-this')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Game 2: Memory Match Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/memory-match/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF6F4] text-[#0D5C4D] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_match_title', 'Memory Match (Card Pair Grid)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Card themes & grid sizes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/memory-match/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/memory-match')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Game 3: Festival Memories Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/festival-memories/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FEF5E7] text-[#D97706] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_festival_title', 'Festival Memories (Cultural Sequence)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Select active Bihu / Hornbill / Chapchar pack
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/festival-memories/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/festival-memories')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Game 4: Remember & Speak Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/remember-speak/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F3EEF9] text-[#7C3AED] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  4
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_speak_title', 'Remember & Speak (Voice Story Recall)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Speech prompt & entity recall focus
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/remember-speak/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/remember-speak')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Game 5: Daily Life Challenge Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/daily-life/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EDF5FE] text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  5
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_daily_title', 'Daily Life Challenge (Routine Scenarios)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Sync routine times & target schedules
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/daily-life/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/daily-life')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Game 6: My Life Story Setup */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div
                onClick={() => navigate('/more/games/life-story/setup')}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FDEEF1] text-[#E11D48] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  6
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {t('game_life_title', 'My Life Story (Narrative Timeline)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Personal narrative chapters & timeline
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => navigate('/more/games/life-story/setup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games/life-story')}
                  className="p-1 rounded-lg text-[#0D5C4D] hover:bg-[#EAF6F4]"
                  title="Play game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Accessibility & Easy Mode */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
            {t('sec_accessibility', 'Accessibility')}
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t('easy_mode', 'Easy Mode (Large Text & High Contrast)')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t('easy_mode_desc', 'Increases touch targets and font contrast')}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={easyMode}
                onChange={(e) => setEasyMode(e.target.checked)}
                className="w-6 h-6 text-[#0D5C4D] rounded-md border-slate-300 focus:ring-[#0D5C4D]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t('voice_guidance', 'Voice Guidance')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t('voice_guidance_desc', 'Reads instructions aloud automatically')}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceGuidance}
                onChange={(e) => setVoiceGuidance(e.target.checked)}
                className="w-6 h-6 text-[#0D5C4D] rounded-md border-slate-300 focus:ring-[#0D5C4D]"
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 text-xs font-semibold">
            <span>SmritiSetu v1.0</span>
            <span>•</span>
            <span>SIH26003</span>
            <span>•</span>
            <span>MDoNER</span>
          </div>
        </div>
      </div>

      {/* Language Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Bottom Nav */}
      <BottomNavBar activeTab="more" onTabChange={handleTabChange} />
    </div>
  );
};

export default MoreMenuScreen;
