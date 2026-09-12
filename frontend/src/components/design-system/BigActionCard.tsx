import React from 'react';

export type PastelTheme = 'pink' | 'mint' | 'lavender' | 'peach' | 'rose' | 'blue';

interface BigActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  theme?: PastelTheme;
  badgeText?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

const themeStyles: Record<
  PastelTheme,
  {
    bg: string;
    border: string;
    iconColor: string;
    hoverBg: string;
  }
> = {
  pink: {
    bg: 'bg-[#FDEEE9]',
    border: 'border-[#FBD8CE]',
    iconColor: 'text-[#E05345]',
    hoverBg: 'hover:bg-[#FCDFD7]',
  },
  mint: {
    bg: 'bg-[#EAF6F4]',
    border: 'border-[#CEEBE6]',
    iconColor: 'text-[#0D5C4D]',
    hoverBg: 'hover:bg-[#DDF0EC]',
  },
  lavender: {
    bg: 'bg-[#F3EEF9]',
    border: 'border-[#E1D5F2]',
    iconColor: 'text-[#7C3AED]',
    hoverBg: 'hover:bg-[#E9DFFA]',
  },
  peach: {
    bg: 'bg-[#FEF5E7]',
    border: 'border-[#FCE6C7]',
    iconColor: 'text-[#D97706]',
    hoverBg: 'hover:bg-[#FDECCE]',
  },
  rose: {
    bg: 'bg-[#FDEEF1]',
    border: 'border-[#F9D6DE]',
    iconColor: 'text-[#E11D48]',
    hoverBg: 'hover:bg-[#FCDDE4]',
  },
  blue: {
    bg: 'bg-[#EDF5FE]',
    border: 'border-[#D3E7FC]',
    iconColor: 'text-[#2563EB]',
    hoverBg: 'hover:bg-[#DCEBFD]',
  },
};

export const BigActionCard: React.FC<BigActionCardProps> = ({
  icon,
  title,
  subtitle,
  theme = 'mint',
  badgeText,
  onClick,
  fullWidth = false,
}) => {
  const styles = themeStyles[theme];

  return (
    <button
      onClick={onClick}
      type="button"
      className={`relative flex ${
        fullWidth ? 'flex-row items-center px-6 py-5 space-x-4' : 'flex-col items-center justify-center p-5 space-y-2.5 text-center'
      } ${styles.bg} ${styles.hoverBg} border border-transparent hover:border-black/5 rounded-3xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-left select-none w-full`}
    >
      {/* Optional New/Custom Badge */}
      {badgeText && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
          {badgeText}
        </span>
      )}

      {/* Large Icon Target */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconColor} flex-shrink-0`}
      >
        <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      </div>

      {/* Card Content */}
      <div className={fullWidth ? 'flex-1' : ''}>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
