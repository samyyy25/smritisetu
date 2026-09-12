import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { MobileContainer } from '../components/MobileContainer';
import {
  ArrowLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  Volume2,
  Layers,
  Users,
  BookOpen,
  PartyPopper,
  Mic,
  Home,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { useNetworkStatus } from '../utils/networkStatus';

export const MemoryGamesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAdaptiveMode, setIsAdaptiveMode] = useState<boolean>(true);
  const { isOnline, isBackendReachable, pendingCount } = useNetworkStatus();
  const fullyConnected = isOnline && isBackendReachable;

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  const gamesList = [
    {
      id: 'who-is-this',
      title: t('game_who_title', 'Who Is This?'),
      subtitle: t('game_who_desc', 'Recognize familiar faces & family relations'),
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-[#FDEEE9]',
      iconColor: 'text-[#E05345]',
      route: '/games/who-is-this',
    },
    {
      id: 'memory-match',
      title: t('game_match_title', 'Memory Match'),
      subtitle: t('game_match_desc', 'Find matching pairs of family photos and items'),
      icon: <Layers className="w-5 h-5" />,
      iconBg: 'bg-[#FEF5E7]',
      iconColor: 'text-[#D97706]',
      route: '/games/memory-match',
    },
    {
      id: 'festival-memories',
      title: t('game_festival_title', 'Festival Memories'),
      subtitle: t('game_festival_desc', 'Cultural celebration sequence from NER'),
      icon: <PartyPopper className="w-5 h-5" />,
      iconBg: 'bg-[#FEF7E6]',
      iconColor: 'text-[#B45309]',
      route: '/games/festival-memories',
    },
    {
      id: 'remember-and-speak',
      title: t('game_speak_title', 'Remember & Speak'),
      subtitle: t('game_speak_desc', 'Speak and recall key details from memories'),
      icon: <Mic className="w-5 h-5" />,
      iconBg: 'bg-[#EAF6F4]',
      iconColor: 'text-[#0D5C4D]',
      route: '/games/remember-speak',
    },
    {
      id: 'daily-life-challenge',
      title: t('game_daily_title', 'Daily Life Challenge'),
      subtitle: t('game_daily_desc', 'Recall daily routines & time-of-day schedules'),
      icon: <Home className="w-5 h-5" />,
      iconBg: 'bg-[#EDF5FE]',
      iconColor: 'text-[#2563EB]',
      route: '/games/daily-life',
    },
    {
      id: 'my-life-story',
      title: t('game_life_title', 'My Life Story'),
      subtitle: t('game_life_desc', 'Revisit your personal journey & milestones'),
      badge: t('badge_new', 'New'),
      icon: <BookOpen className="w-5 h-5" />,
      iconBg: 'bg-[#F3EEF9]',
      iconColor: 'text-[#7C3AED]',
      route: '/games/life-story',
    },
  ];

  return (
    <MobileContainer showTopBar={false}>
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* Custom Header Matching Image 5 Mockup */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/patient/home')}
            className="p-1 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Go to Home"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.5]" />
          </button>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            {t('games_header', 'Cognitive Games')}
          </span>

          <div className="w-7 h-7" />
        </div>

        {/* Offline Warning Banner if applicable */}
        {(!fullyConnected || pendingCount > 0) && (
          <div
            onClick={() => navigate('/offline')}
            className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
              !fullyConnected
                ? 'bg-red-50/90 border-red-200 text-red-900'
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {!fullyConnected ? (
                <CloudOff className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
              )}
              <div>
                <span className="font-bold block">
                  {!fullyConnected ? 'Offline Mode Active' : `${pendingCount} session(s) pending sync`}
                </span>
                <span className="text-[11px] opacity-80">
                  {!fullyConnected
                    ? 'Games save locally and sync when connection returns'
                    : 'Tap to view queued activities and sync now'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </div>
        )}

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('games_header', 'Choose a Game')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('games_subtitle', 'Choose an activity for your memory workout!')}
          </p>
        </div>

        {/* Game Option Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {gamesList.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => navigate(game.route)}
              className="w-full bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/90 shadow-soft-card flex items-center justify-between transition-all hover:-translate-y-0.5 active:translate-y-0 text-left group"
            >
              <div className="flex items-center space-x-3.5">
                {/* Game Icon Circle Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl ${game.iconBg} ${game.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {game.icon}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 leading-tight">
                      {game.title}
                    </span>
                    {game.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-600 text-white">
                        {game.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {game.subtitle}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>
          ))}
        </div>

        {/* Adaptive Mode Toggle Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft-card flex items-center justify-between mt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#0D5C4D] flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {t('adaptive_mode', 'Adaptive Mode')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {t('adaptive_mode_desc', 'AI adjusts difficulty for you')}
              </span>
            </div>
          </div>

          {/* Interactive Toggle Switch */}
          <button
            type="button"
            onClick={() => setIsAdaptiveMode(!isAdaptiveMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              isAdaptiveMode ? 'bg-[#0D5C4D]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isAdaptiveMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bottom 5-Icon Navigation Bar */}
      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default MemoryGamesList;
