import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, X, Zap } from 'lucide-react';
import { DifficultyLevel } from '../utils/adaptiveDifficulty';

interface AdaptiveDifficultyNoticeProps {
  change: 'increased' | 'decreased' | 'unchanged';
  message: string | null;
  level: DifficultyLevel;
}

export const AdaptiveDifficultyNotice: React.FC<AdaptiveDifficultyNoticeProps> = ({
  change,
  message,
  level,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message && (change === 'increased' || change === 'decreased')) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [change, message]);

  if (!visible || !message) return null;

  const isIncreased = change === 'increased';

  return (
    <div
      className={`mx-5 my-2 p-3.5 rounded-2xl border flex items-center justify-between shadow-sm animate-fadeIn transition-all ${
        isIncreased
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950'
          : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 text-teal-950'
      }`}
    >
      <div className="flex items-center space-x-2.5">
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isIncreased ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'
          }`}
        >
          {isIncreased ? <Sparkles className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
        </div>
        <div>
          <span className="text-xs font-bold block leading-tight">{message}</span>
          <span className="text-[10px] text-slate-500 capitalize">
            AI Adaptive Difficulty: <strong className="font-semibold text-slate-700">{level}</strong> mode
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
