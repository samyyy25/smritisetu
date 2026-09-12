import React from 'react';

interface LanguageChipProps {
  nativeName: string;
  englishName?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const LanguageChip: React.FC<LanguageChipProps> = ({
  nativeName,
  englishName,
  isSelected = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl border transition-all text-center select-none ${
        isSelected
          ? 'bg-[#0D5C4D] text-white border-[#0D5C4D] shadow-sm'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
      }`}
    >
      <span className="text-xs font-bold leading-tight">{nativeName}</span>
      {englishName && (
        <span
          className={`text-[9px] mt-0.5 leading-tight ${
            isSelected ? 'text-teal-100' : 'text-slate-400'
          }`}
        >
          {englishName}
        </span>
      )}
    </button>
  );
};
