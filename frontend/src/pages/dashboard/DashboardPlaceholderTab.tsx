import React from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Construction, 
  BookOpen, 
  Bell, 
  HeartHandshake, 
  FileText, 
  Settings,
  TrendingUp
} from 'lucide-react';

interface DashboardPlaceholderTabProps {
  title: string;
  tabId: string;
  onBackToOverview: () => void;
  onUploadMemory?: () => void;
}

const tabDescriptions: Record<string, { desc: string; icon: React.FC<{ className?: string }> }> = {
  'cognitive-trends': {
    desc: 'Longitudinal population-level analytics, demographic baseline comparisons, and cohort drift velocity charts.',
    icon: TrendingUp,
  },
  'memory-library': {
    desc: 'Manage family photo albums, voice stories, and culturally localized memory cues uploaded for patient recall exercises.',
    icon: BookOpen,
  },
  'reminders': {
    desc: 'Schedule automated voice reminder routines for morning/evening medicines, puja timings, and hydration cues.',
    icon: Bell,
  },
  'asha-network': {
    desc: 'Field coordination and escalation bridge for accredited social health activists (ASHA) and rural community health workers.',
    icon: HeartHandshake,
  },
  'reports': {
    desc: 'Generate printable clinical summaries, neurologist export dossiers, and MoCA-aligned longitudinal progression reports.',
    icon: FileText,
  },
  'settings': {
    desc: 'Configure clinic thresholds, AI engine sensitivity thresholds, SMS caregiver alerts, and regional language preferences.',
    icon: Settings,
  },
};

export const DashboardPlaceholderTab: React.FC<DashboardPlaceholderTabProps> = ({
  title,
  tabId,
  onBackToOverview,
  onUploadMemory,
}) => {
  const config = tabDescriptions[tabId] || {
    desc: 'This module is scheduled for the next deployment phase.',
    icon: Construction,
  };
  const Icon = config.icon;

  return (
    <div className="space-y-6 max-w-3xl pb-16">
      <button
        onClick={onBackToOverview}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-teal-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Overview</span>
      </button>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Roadmap Module • Coming Soon</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">{title}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{config.desc}</p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onBackToOverview}
            className="px-4 py-2.5 rounded-xl bg-[#0D5C4D] hover:bg-[#07382E] text-white text-xs font-semibold shadow-xs transition"
          >
            Return to Dashboard Overview
          </button>
          {tabId === 'memory-library' && onUploadMemory && (
            <button
              onClick={onUploadMemory}
              className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition"
            >
              Upload New Memory Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
