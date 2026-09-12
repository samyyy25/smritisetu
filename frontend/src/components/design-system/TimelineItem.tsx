import React from 'react';

export type TimelineColor = 'purple' | 'amber' | 'orange' | 'teal' | 'rose';

interface TimelineItemProps {
  year: string;
  title: string;
  subtitle?: string;
  color?: TimelineColor;
  thumbnailUrl?: string;
  isActive?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

const colorStyles: Record<
  TimelineColor,
  {
    badgeBg: string;
    badgeText: string;
    lineColor: string;
  }
> = {
  purple: {
    badgeBg: 'bg-[#7C3AED]',
    badgeText: 'text-white',
    lineColor: 'border-purple-200',
  },
  amber: {
    badgeBg: 'bg-[#F59E0B]',
    badgeText: 'text-white',
    lineColor: 'border-amber-200',
  },
  orange: {
    badgeBg: 'bg-[#EA580C]',
    badgeText: 'text-white',
    lineColor: 'border-orange-200',
  },
  teal: {
    badgeBg: 'bg-[#0D5C4D]',
    badgeText: 'text-white',
    lineColor: 'border-teal-200',
  },
  rose: {
    badgeBg: 'bg-[#E11D48]',
    badgeText: 'text-white',
    lineColor: 'border-rose-200',
  },
};

export const TimelineItem: React.FC<TimelineItemProps> = ({
  year,
  title,
  subtitle,
  color = 'purple',
  thumbnailUrl,
  isActive = false,
  isLast = false,
  onClick,
}) => {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center space-x-3.5 pb-5 group cursor-pointer select-none ${
        isActive ? 'opacity-100' : 'opacity-85 hover:opacity-100'
      }`}
    >
      {/* Connecting Vertical Line */}
      {!isLast && (
        <span
          className={`absolute left-5 top-10 bottom-0 w-0.5 border-l-2 border-dashed ${styles.lineColor}`}
        />
      )}

      {/* Year / Event Circle Badge */}
      <div
        className={`w-10 h-10 rounded-full ${styles.badgeBg} ${styles.badgeText} flex items-center justify-center font-bold text-[11px] shadow-sm flex-shrink-0 z-10`}
      >
        {year}
      </div>

      {/* Item Body / Card */}
      <div
        className={`flex-1 flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
          isActive
            ? 'bg-white shadow-soft-card border-teal-500/30'
            : 'bg-white/60 hover:bg-white border-transparent hover:border-slate-100'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 leading-tight">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {subtitle}
            </span>
          )}
        </div>

        {/* Thumbnail preview */}
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center text-slate-400 text-xs">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>📷</span>
          )}
        </div>
      </div>
    </div>
  );
};
