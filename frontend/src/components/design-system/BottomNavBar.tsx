import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Gamepad2, Image, Bell, MoreHorizontal, MapPin } from 'lucide-react';

export type NavTabId = 'home' | 'games' | 'reminders' | 'memories' | 'places' | 'more' | 'profile';

interface BottomNavBarProps {
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
}

const navItems: { id: NavTabId; key: string; defaultLabel: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', key: 'nav_home', defaultLabel: 'Home', icon: Home },
  { id: 'games', key: 'nav_games', defaultLabel: 'Games', icon: Gamepad2 },
  { id: 'reminders', key: 'nav_reminders', defaultLabel: 'Reminders', icon: Bell },
  { id: 'memories', key: 'nav_memories', defaultLabel: 'Memories', icon: Image },
  { id: 'places', key: 'nav_places', defaultLabel: 'Places', icon: MapPin },
  { id: 'more', key: 'nav_more', defaultLabel: 'More', icon: MoreHorizontal },
];


export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <nav className="w-full bg-white border-t border-slate-100 px-1 sm:px-3 pt-2 pb-2 sm:pb-3 shadow-lg shadow-slate-900/5 rounded-none sm:rounded-b-[34px] flex-shrink-0 select-none pb-safe">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex-1 flex flex-col items-center justify-center space-y-0.5 py-1 px-1 rounded-xl transition-all select-none ${
                isActive
                  ? 'text-[#0D5C4D] font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0D5C4D]" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight truncate max-w-[54px]">
                {t(item.key, item.defaultLabel)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
