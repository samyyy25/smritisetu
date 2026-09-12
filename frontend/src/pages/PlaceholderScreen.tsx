import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { ArrowLeft, Sparkles, Clock, Compass } from 'lucide-react';

interface PlaceholderScreenProps {
  title?: string;
  subtitle?: string;
  tabId?: NavTabId;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  subtitle = 'This activity is being carefully designed for upcoming phases.',
  tabId = 'home',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive title from pathname if not provided
  const displayTitle =
    title ||
    location.pathname
      .replace('/', '')
      .replace('games/', '')
      .replace('-', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Feature';

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  return (
    <MobileContainer showTopBar={false}>
      {/* Header */}
      <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.5]" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {displayTitle}
        </span>

        <div className="w-7 h-7" />
      </div>

      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#EAF6F3] border border-[#ACDDCE] flex items-center justify-center text-[#0D5C4D] shadow-sm animate-bounce duration-1000">
          <Sparkles className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            Coming Soon • Phase 2
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft-card max-w-xs text-left space-y-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2 text-[#0D5C4D] font-bold">
            <Clock className="w-4 h-4" />
            <span>Planned in Next Phase</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Each cognitive game, voice interaction, and timeline will be implemented with full interactive states and data logging.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/patient/home')}
          className="px-6 py-2.5 rounded-2xl bg-[#0D5C4D] text-white text-xs font-bold shadow-md hover:bg-[#147260] transition-colors"
        >
          Return to Home
        </button>
      </div>

      <BottomNavBar activeTab={tabId} onTabChange={handleTabChange} />
    </MobileContainer>
  );
};
