import React, { useState } from 'react';
import { Volume2, VolumeX, Wifi, WifiOff, RefreshCw, Globe, Sparkles, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../utils/networkStatus';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface MobileContainerProps {
  children: React.ReactNode;
  headerTitle?: string;
  onVoiceClick?: () => void;
  showTopBar?: boolean;
  bottomNav?: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  headerTitle,
  onVoiceClick,
  showTopBar = true,
  bottomNav,
}) => {
  const { t, i18n } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const { isOnline, isBackendReachable, pendingCount } = useNetworkStatus();
  const { easyMode, voiceGuidance, isSpeaking, speakText, stopSpeaking } = useAccessibility();
  const fullyConnected = isOnline && isBackendReachable;

  const currentLangCode = i18n.language || 'en';
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const displayTitle = headerTitle || t('home_header', 'Home');

  // Handle Voice Assistance click on top bar
  const handleVoiceAssist = () => {
    if (onVoiceClick) {
      onVoiceClick();
      return;
    }
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const pageInfo = `${displayTitle}. ${
        displayTitle.toLowerCase().includes('home')
          ? 'Welcome home. You have two out of three cognitive activities completed today.'
          : displayTitle.toLowerCase().includes('games')
          ? 'Cognitive Games catalog. Choose from family photo recall, memory match, festival sequences, and voice story recall.'
          : displayTitle.toLowerCase().includes('memories')
          ? 'My Memories album. Explore your family milestones, photos and playable videos.'
          : displayTitle.toLowerCase().includes('reminders')
          ? 'Daily routine and medication schedule.'
          : 'You are on the ' + displayTitle + ' screen of SmritiSetu.'
      }`;
      speakText(pageInfo);
    }
  };

  // Automatically extract BottomNavBar if passed as child, keeping it pinned at bottom
  const childArray = React.Children.toArray(children);
  let contentChildren: React.ReactNode = children;
  let activeBottomNav: React.ReactNode = bottomNav;

  if (!activeBottomNav && childArray.length > 1) {
    const lastChild = childArray[childArray.length - 1];
    if (
      React.isValidElement(lastChild) &&
      ((lastChild.type as any)?.name === 'BottomNavBar' || (lastChild.props as any)?.activeTab !== undefined)
    ) {
      contentChildren = childArray.slice(0, -1);
      activeBottomNav = lastChild;
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#FAF7F2] flex flex-col justify-start items-center p-0 sm:p-4 md:p-6 lg:p-8">
      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Responsive App Shell: Fluid on mobile, comfortably proportioned on tablet & laptop */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white sm:rounded-3xl shadow-none sm:shadow-lg sm:border border-slate-200/80 overflow-hidden flex flex-col min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-6rem)] sm:max-h-[calc(100dvh-4rem)] relative transition-all">
        
        {/* Responsive Status & Connectivity Header */}
        <div className="bg-white px-4 sm:px-6 pt-2 pb-2 flex items-center justify-between text-xs font-semibold text-slate-700 select-none border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 tracking-tight">SmritiSetu</span>
            <span className="hidden sm:inline text-slate-400 font-normal">• Cognitive Care Companion</span>
            {easyMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] animate-fadeIn">
                <Eye className="w-3 h-3" />
                <span>Easy Mode</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                !fullyConnected
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : pendingCount > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-[#0D5C4D] border border-emerald-200/60'
              }`}
              title={
                !fullyConnected
                  ? 'Offline mode active'
                  : pendingCount > 0
                  ? `${pendingCount} activities waiting to sync`
                  : 'Online and connected'
              }
            >
              {!fullyConnected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Offline {pendingCount > 0 && `(${pendingCount})`}</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>Sync ({pendingCount})</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t('voice_enabled', 'Online & Voice Enabled')}</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-slate-500">
              {!fullyConnected ? (
                <WifiOff className="w-4 h-4 text-red-500" />
              ) : (
                <Wifi className="w-4 h-4 text-slate-600" />
              )}
            </div>
          </div>
        </div>

        {/* Top App Header if enabled */}
        {showTopBar && (
          <div className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100 select-none flex-shrink-0">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700 truncate">
              {displayTitle}
            </span>

            <div className="flex items-center space-x-2">
              {/* Language Selector Trigger Button */}
              <button
                type="button"
                onClick={() => setIsLangModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-[#EAF6F3] border border-slate-200 hover:border-[#0D5C4D]/30 text-slate-700 hover:text-[#0D5C4D] text-xs font-bold transition-all shadow-2xs"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-[#0D5C4D]" />
                <span>{currentLang.nativeName}</span>
              </button>

              <button
                type="button"
                onClick={handleVoiceAssist}
                className={`p-2 rounded-full transition-all ${
                  isSpeaking
                    ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500 animate-pulse'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-[#0D5C4D]'
                }`}
                title={isSpeaking ? 'Stop speech' : 'Hear page aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#0D5C4D]" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Screen Content Scrollable Area: Expands smoothly on tablet and desktop */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#FAF7F2] flex flex-col">
          {contentChildren}
        </div>

        {/* Fixed Pinned Bottom Navigation */}
        {activeBottomNav}
      </div>
    </div>
  );
};

