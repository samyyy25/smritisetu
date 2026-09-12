import React from 'react';

interface LogoLockupProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark'; // dark for sidebar, light for default cream/white
  showTagline?: boolean;
}

export const LogoLockup: React.FC<LogoLockupProps> = ({
  size = 'md',
  theme = 'light',
  showTagline = true,
}) => {
  const isDark = theme === 'dark';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Visual Logo Emblem matching template */}
      <div className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-full border-2 ${isDark ? 'border-teal-400/40 bg-[#0A4B3E]' : 'border-[#0D5C4D]/30 bg-[#EAF6F3]'} p-1.5 shadow-sm`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer leaf arc */}
          <path
            d="M8 26C8 16 16 8 26 8C34 8 40 14 40 22C40 32 30 40 20 40C14 40 10 36 8 26Z"
            stroke={isDark ? '#5EEAD4' : '#0D5C4D'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Family figures: Left adult, middle small child, right adult */}
          {/* Left figure */}
          <circle cx="17" cy="20" r="3.5" fill={isDark ? '#E6FFFA' : '#0D5C4D'} />
          <path d="M11 32C11 27 14 25 17 25C20 25 23 27 23 32" stroke={isDark ? '#E6FFFA' : '#0D5C4D'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Right figure */}
          <circle cx="31" cy="20" r="3.5" fill={isDark ? '#E6FFFA' : '#0D5C4D'} />
          <path d="M25 32C25 27 28 25 31 25C34 25 37 27 37 32" stroke={isDark ? '#E6FFFA' : '#0D5C4D'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Middle child / connection leaf */}
          <circle cx="24" cy="23" r="2.5" fill={isDark ? '#5EEAD4' : '#147260'} />
          <path d="M21 32C21 29 22.5 28 24 28C25.5 28 27 29 27 32" stroke={isDark ? '#5EEAD4' : '#147260'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight font-sans ${titleSizes[size]} ${
            isDark ? 'text-white' : 'text-[#0D5C4D]'
          }`}
        >
          SmritiSetu
        </span>
        {showTagline && (
          <span
            className={`font-normal tracking-normal ${taglineSizes[size]} ${
              isDark ? 'text-teal-200/70' : 'text-slate-500'
            }`}
          >
            Bridging memories, people and care.
          </span>
        )}
      </div>
    </div>
  );
};
