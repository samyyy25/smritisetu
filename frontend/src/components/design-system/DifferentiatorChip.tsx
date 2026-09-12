import React from 'react';

interface DifferentiatorChipProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const DifferentiatorChip: React.FC<DifferentiatorChipProps> = ({
  icon,
  title,
  subtitle,
  iconBgColor = 'bg-teal-50',
  iconColor = 'text-[#0D5C4D]',
}) => {
  return (
    <div className="inline-flex items-center space-x-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-all select-none">
      <div
        className={`w-7 h-7 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center flex-shrink-0`}
      >
        <div className="w-3.5 h-3.5 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase leading-none">
          {title}
        </span>
        <span className="text-[9px] text-slate-500 mt-0.5 leading-none">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
