import React from 'react';

export type StatusType = 'stable' | 'monitor' | 'attention';

interface StatusBadgeProps {
  status: StatusType | 'Stable' | 'Monitor' | 'Attention';
  showDot?: boolean;
  size?: 'sm' | 'md';
}

const statusConfigs: Record<
  string,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    dot: string;
  }
> = {
  stable: {
    label: 'Stable',
    bg: 'bg-[#EAF8F1]',
    border: 'border-[#A7E8C7]',
    text: 'text-[#065F46]',
    dot: 'bg-[#10B981]',
  },
  monitor: {
    label: 'Monitor',
    bg: 'bg-[#FEF7E6]',
    border: 'border-[#FDE29A]',
    text: 'text-[#92400E]',
    dot: 'bg-[#F59E0B]',
  },
  attention: {
    label: 'Attention',
    bg: 'bg-[#FDECEC]',
    border: 'border-[#F9BFC1]',
    text: 'text-[#991B1B]',
    dot: 'bg-[#EF4444]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = false,
  size = 'sm',
}) => {
  const normalizedKey = status.toLowerCase();
  const config = statusConfigs[normalizedKey] || statusConfigs.stable;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-semibold rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]} select-none`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
