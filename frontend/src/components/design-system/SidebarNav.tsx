import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Bell,
  HeartHandshake,
  FileText,
  Settings,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { LogoLockup } from './LogoLockup';

export type SidebarNavItemId =
  | 'overview'
  | 'patients'
  | 'location'
  | 'cognitive-trends'
  | 'alerts'
  | 'memory-library'
  | 'reminders'
  | 'asha-network'
  | 'reports'
  | 'settings';

interface SidebarNavProps {
  activeId?: SidebarNavItemId;
  onSelect?: (id: SidebarNavItemId) => void;
  doctorName?: string;
  doctorRole?: string;
  alertsCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeId = 'overview',
  onSelect,
  doctorName = 'Dr. Mehta',
  doctorRole = 'Clinician & Care Lead',
  alertsCount,
}) => {
  const navItems: {
    id: SidebarNavItemId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'cognitive-trends', label: 'Cognitive Trends', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertsCount !== undefined ? alertsCount : 3 },
    { id: 'memory-library', label: 'Memory Library', icon: BookOpen },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'asha-network', label: 'ASHA Network', icon: HeartHandshake },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <aside className="w-64 bg-[#07382E] text-white flex flex-col justify-between py-5 px-3.5 rounded-3xl shadow-xl select-none min-h-[640px]">
      {/* Top Logo */}
      <div>
        <div className="px-2 pb-6 pt-1 border-b border-white/10">
          <LogoLockup size="sm" theme="dark" showTagline={false} />
        </div>

        {/* Nav Items List */}
        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect?.(item.id)}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#147260] text-white font-semibold shadow-inner'
                    : 'text-teal-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-teal-300/60'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Clinician Profile Card */}
      <div className="pt-4 border-t border-white/10 px-2">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-200/20 border border-teal-300/30 flex items-center justify-center text-teal-200 font-bold text-xs overflow-hidden">
              <span className="text-white">👨‍⚕️</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {doctorName}
              </span>
              <span className="text-[10px] text-teal-200/60 leading-tight">
                {doctorRole}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-teal-200/60" />
        </div>
      </div>
    </aside>
  );
};
