import React from 'react';
import { ArrowLeft, MoreHorizontal, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MiniTrendChart } from './MiniTrendChart';

export interface AlertMetric {
  label: string;
  change: string; // e.g. "+40%", "-12%"
  direction: 'up' | 'down';
  isNegativeConcern?: boolean; // usually true for increased latency/hesitation or decreased accuracy
}

interface AlertCardProps {
  patientName?: string;
  detectedDate?: string;
  title?: string;
  metrics?: AlertMetric[];
  onViewDetails?: () => void;
  onAddNote?: () => void;
}

const defaultMetrics: AlertMetric[] = [
  { label: 'Reaction time increased', change: '+40%', direction: 'up', isNegativeConcern: true },
  { label: 'Accuracy decreased', change: '-12%', direction: 'down', isNegativeConcern: true },
  { label: 'Hesitation increased', change: '+18%', direction: 'up', isNegativeConcern: true },
  { label: 'Hints used increased', change: '+16%', direction: 'up', isNegativeConcern: true },
];

export const AlertCard: React.FC<AlertCardProps> = ({
  patientName = 'Anita Devi',
  detectedDate = 'Detected on 22 Jan 2026',
  title = 'Possible Cognitive Change',
  metrics = defaultMetrics,
  onViewDetails,
  onAddNote,
}) => {
  return (
    <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-soft-card border border-slate-100 flex flex-col space-y-4 select-none animate-alert-appear">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <button
          type="button"
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-800">{patientName}</span>
        <button
          type="button"
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Alert Title Banner */}
      <div className="flex items-start space-x-3 bg-[#FDECEC] border border-[#F9BFC1] rounded-2xl p-3">
        <div className="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-[#991B1B] leading-tight">
            {title}
          </h4>
          <span className="text-[10px] text-[#DC2626] mt-0.5 font-medium">
            {detectedDate}
          </span>
        </div>
      </div>

      {/* "Why we're showing this?" Metric List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-600 block">
          Why we're showing this?
        </span>
        <div className="space-y-1.5">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none"
            >
              <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                {m.direction === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-[#DC2626]" />
                )}
                <span>{m.label}</span>
              </div>
              <span className="font-bold text-[#DC2626] font-mono text-[11px]">
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Overview Mini Chart */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-600">
            Trend Overview
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Last 30 Days</span>
        </div>
        <MiniTrendChart height={75} />
      </div>

      {/* Fixed Disclaimer Banner */}
      <div className="bg-[#FAF4ED] rounded-xl px-3 py-2 text-center border border-[#F3E5D4]">
        <p className="text-[11px] font-medium text-slate-600">
          This is a monitoring signal, not a diagnosis.
        </p>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full py-2.5 px-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-sm transition-all"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onAddNote}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
        >
          Add Note
        </button>
      </div>
    </div>
  );
};
