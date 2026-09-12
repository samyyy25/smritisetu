import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceWaveformProps {
  isListening?: boolean;
  statusText?: string;
  onToggle?: () => void;
  barCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isListening = true,
  statusText = 'Listening...',
  onToggle,
  barCount = 18,
}) => {
  // Height pattern for waveform
  const barHeights = [20, 35, 55, 75, 45, 85, 100, 60, 40, 70, 90, 50, 65, 80, 45, 30, 20, 15];

  return (
    <div className="flex flex-col items-center justify-center space-y-3 select-none">
      {/* Mic Button Target */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          isListening
            ? 'bg-[#0D5C4D] text-white ring-4 ring-teal-500/20 scale-105'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }`}
      >
        <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
      </button>

      {/* Waveform Visualization Bars */}
      <div className="flex items-center justify-center space-x-1 h-8 px-4">
        {Array.from({ length: barCount }).map((_, index) => {
          const heightPercent = barHeights[index % barHeights.length];
          return (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-gradient-to-t from-[#0D5C4D] to-[#2DD4BF]'
                  : 'bg-slate-200'
              }`}
              style={{
                height: isListening ? `${heightPercent}%` : '20%',
                animation: isListening
                  ? `waveAnim 1.2s ease-in-out infinite alternate ${index * 0.07}s`
                  : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Status indicator text */}
      {statusText && (
        <span
          className={`text-xs font-semibold ${
            isListening ? 'text-[#0D5C4D]' : 'text-slate-400'
          }`}
        >
          {statusText}
        </span>
      )}

      {/* Keyframe animation for inline waveform */}
      <style>{`
        @keyframes waveAnim {
          0% { height: 15%; opacity: 0.5; }
          50% { height: 95%; opacity: 1; }
          100% { height: 25%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
