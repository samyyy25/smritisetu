import React from 'react';

interface ProgressRingProps {
  progress?: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  value?: string | number;
  label?: string;
  color?: string; // hex or Tailwind color
  trackColor?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress = 65,
  size = 64,
  strokeWidth = 5,
  value = '2',
  label = 'Day Streak',
  color = '#0D5C4D',
  trackColor = '#E6F3F0',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label & Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-bold text-slate-800 leading-none">
          {value}
        </span>
        {label && (
          <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
