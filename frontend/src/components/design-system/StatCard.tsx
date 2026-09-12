import React from 'react';

export type StatVariant = 'blue' | 'stable' | 'monitor' | 'attention';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ReactNode;
  variant?: StatVariant;
}

const variantStyles: Record<
  StatVariant,
  {
    iconBg: string;
    iconColor: string;
    deltaColor: string;
  }
> = {
  blue: {
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#2563EB]',
    deltaColor: 'text-[#2563EB]',
  },
  stable: {
    iconBg: 'bg-[#EAF8F1]',
    iconColor: 'text-[#10B981]',
    deltaColor: 'text-[#059669]',
  },
  monitor: {
    iconBg: 'bg-[#FEF7E6]',
    iconColor: 'text-[#F59E0B]',
    deltaColor: 'text-[#D97706]',
  },
  attention: {
    iconBg: 'bg-[#FDECEC]',
    iconColor: 'text-[#EF4444]',
    deltaColor: 'text-[#DC2626]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  icon,
  variant = 'blue',
}) => {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 flex items-center justify-between min-w-[130px] flex-1">
      <div className="flex items-center space-x-3">
        {/* Icon Circle */}
        <div
          className={`w-9 h-9 rounded-full ${styles.iconBg} ${styles.iconColor} flex items-center justify-center flex-shrink-0`}
        >
          <div className="w-4 h-4 flex items-center justify-center">{icon}</div>
        </div>

        {/* Value and Label */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium leading-none">
            {label}
          </span>
          <span className="text-xl font-bold text-slate-800 tracking-tight mt-1 leading-none">
            {value}
          </span>
        </div>
      </div>

      {/* Delta indicator */}
      {delta && (
        <span className={`text-[11px] font-semibold ${styles.deltaColor} pl-2`}>
          {delta}
        </span>
      )}
    </div>
  );
};
