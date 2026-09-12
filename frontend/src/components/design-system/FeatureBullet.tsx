import React from 'react';

interface FeatureBulletProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const FeatureBullet: React.FC<FeatureBulletProps> = ({
  icon,
  title,
  subtitle,
  iconBgColor = 'bg-[#0D5C4D]',
  iconColor = 'text-white',
}) => {
  return (
    <div className="flex items-start space-x-3.5 group">
      <div
        className={`w-9 h-9 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 group-hover:scale-105 transition-transform`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <h4 className="text-[13px] font-bold text-slate-800 leading-tight">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
