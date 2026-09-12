import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Clock,
  Zap,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  ShieldCheck,
  User,
  RotateCcw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface CognitiveTrendsProps {
  onBackToOverview: () => void;
  onSelectPatient?: (patientId: string) => void;
}

interface PatientOption {
  id: string;
  name: string;
  status: string;
}

export const DashboardCognitiveTrends: React.FC<CognitiveTrendsProps> = ({
  onBackToOverview,
  onSelectPatient,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('14d');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch patients for selector
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients`);
        if (res.ok) {
          const data = await res.json();
          if (data.patients) {
            setPatients(data.patients);
          }
        }
      } catch (err) {
        console.warn('Could not load patient list for trends:', err);
      }
    };
    loadPatients();
  }, []);

  // Mock trend data points based on time range
  const trendPoints = [
    { day: 'Day 1', accuracy: 88, latency: 2.8, hesitation: 0.6, baselineAcc: 85 },
    { day: 'Day 3', accuracy: 86, latency: 2.9, hesitation: 0.7, baselineAcc: 85 },
    { day: 'Day 5', accuracy: 84, latency: 3.1, hesitation: 0.9, baselineAcc: 85 },
    { day: 'Day 7', accuracy: 85, latency: 3.2, hesitation: 0.8, baselineAcc: 85 },
    { day: 'Day 9', accuracy: 81, latency: 3.5, hesitation: 1.2, baselineAcc: 85 },
    { day: 'Day 11', accuracy: 79, latency: 3.7, hesitation: 1.4, baselineAcc: 85 },
    { day: 'Day 14', accuracy: 78, latency: 3.9, hesitation: 1.6, baselineAcc: 85 },
  ];

  const domainBreakdown = [
    { domain: 'Episodic Memory (Family Recall)', score: 76, change: -8, status: 'warning' },
    { domain: 'Temporal Orientation (Festivals/Seasons)', score: 82, change: -4, status: 'stable' },
    { domain: 'Semantic Recognition (Who is This)', score: 85, change: +2, status: 'good' },
    { domain: 'Processing Speed & Motor Latency', score: 68, change: -12, status: 'alert' },
    { domain: 'Voice Recall & Spoken Narrative', score: 84, change: +1, status: 'good' },
  ];

  const gameModalityStats = [
    { name: 'Festival Memories (Order Sequences)', sessions: 42, avgAcc: '74%', avgLatency: '4.1s', status: 'Attention' },
    { name: 'Who is This? (Family Face Recall)', sessions: 58, avgAcc: '86%', avgLatency: '2.9s', status: 'Stable' },
    { name: 'Memory Match (Cultural Pairs)', sessions: 65, avgAcc: '89%', avgLatency: '2.4s', status: 'Stable' },
    { name: 'Remember & Speak (Spoken Memory)', sessions: 38, avgAcc: '82%', avgLatency: '3.6s', status: 'Monitor' },
    { name: 'Daily Challenge (Combined Workout)', sessions: 49, avgAcc: '80%', avgLatency: '3.3s', status: 'Monitor' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-teal-700" />
            <span>Biomarker Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Cognitive Trends & Longitudinal Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical trajectory of response latencies, accuracy velocity, and hesitation drift across cohort sessions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Patient Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Assigned Patients (Cohort View)</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {(['7d', '14d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core Biomarker Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Reaction Time Drift */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.5% Slowdown
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">3.4s</span>
            <span className="text-xs text-slate-400 block font-medium">Mean Response Latency</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-amber-600 font-semibold">Flagged:</span> Slower on 3+ step sequences
          </div>
        </div>

        {/* Metric 2: Recall Accuracy Velocity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
              <ArrowDownRight className="w-3.5 h-3.5" /> -4.2% Change
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">82.4%</span>
            <span className="text-xs text-slate-400 block font-medium">14-Day Recall Accuracy</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-teal-700 font-semibold">Baseline:</span> 85.0% target norm
          </div>
        </div>

        {/* Metric 3: Hesitation & Reversal Index */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% Mid-choice
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">1.1 / session</span>
            <span className="text-xs text-slate-400 block font-medium">Answer Reversal Rate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-purple-700 font-semibold">Signal:</span> Increased deliberation
          </div>
        </div>

        {/* Metric 4: Hint Reliance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5" /> 15% Steady
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">15.0%</span>
            <span className="text-xs text-slate-400 block font-medium">Hint Assistance Used</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-blue-700 font-semibold">Level:</span> Low caregiver intervention needed
          </div>
        </div>
      </div>

      {/* Longitudinal Trajectory Chart & Domain Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visual Trajectory Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>Longitudinal Accuracy & Response Latency Curve</span>
                <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full font-bold">14-Day Trajectory</span>
              </h2>
              <p className="text-xs text-slate-400">Comparing active player accuracy against normative clinical threshold (85%).</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> Accuracy (%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Latency (sec)
              </span>
            </div>
          </div>

          {/* SVG Visual Graph */}
          <div className="h-64 w-full bg-slate-50/70 rounded-2xl p-4 flex flex-col justify-between border border-slate-100 relative">
            {/* Threshold Line */}
            <div className="absolute top-[28%] left-4 right-4 border-b-2 border-dashed border-teal-300 pointer-events-none flex justify-end">
              <span className="text-[10px] text-teal-700 bg-white px-1.5 py-0.5 rounded font-bold shadow-2xs -mt-2">Baseline 85%</span>
            </div>

            {/* Bars & Graph Visualization */}
            <div className="flex-1 flex items-end justify-between gap-2 px-2 pt-6 pb-2">
              {trendPoints.map((pt, idx) => {
                const heightPct = Math.min(Math.max((pt.accuracy / 100) * 100, 20), 100);
                const latencyHeight = Math.min(Math.max((pt.latency / 5) * 100, 15), 90);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] rounded-xl px-2.5 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                      <span className="font-bold">{pt.day}:</span> {pt.accuracy}% Acc • {pt.latency}s Latency
                    </div>

                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Accuracy Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-3.5 sm:w-5 rounded-t-lg transition-all ${
                          pt.accuracy < 80 ? 'bg-amber-400 group-hover:bg-amber-500' : 'bg-[#0D5C4D] group-hover:bg-[#07382E]'
                        }`}
                      />
                      {/* Latency Line Indicator */}
                      <div
                        style={{ height: `${latencyHeight}%` }}
                        className="w-1.5 sm:w-2 bg-amber-500/80 rounded-t-full"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">{pt.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#F3E5D4] flex items-start gap-2.5 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">AI Pattern Observation: </span>
              Cognitive recall for early childhood and hometown memories remains robust (&gt;90%), while recent calendar sequence ordering shows modest response latency drift (+32%).
            </div>
          </div>
        </div>

        {/* Cognitive Domain Breakdown (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Cognitive Domain Scorecard
            </h2>
            <Brain className="w-4 h-4 text-teal-700" />
          </div>

          <div className="space-y-4 pt-1">
            {domainBreakdown.map((d) => (
              <div key={d.domain} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate pr-2">{d.domain}</span>
                  <span className="font-bold tabular-nums text-slate-900">{d.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${d.score}%` }}
                    className={`h-full rounded-full ${
                      d.status === 'good'
                        ? 'bg-emerald-500'
                        : d.status === 'stable'
                        ? 'bg-teal-600'
                        : d.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Standardized against HMSE norms</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Game Modalities Performance Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Modality Performance & Reaction Latencies
            </h2>
            <p className="text-xs text-slate-500">Breakdown of patient engagement across all 6 cognitive stimulation exercise types.</p>
          </div>
          <button
            type="button"
            onClick={onBackToOverview}
            className="text-xs font-bold text-[#0D5C4D] hover:underline"
          >
            Return to Dashboard Overview &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Cognitive Exercise Modality</th>
                <th className="py-3 px-3">Completed Sessions</th>
                <th className="py-3 px-3">Mean Accuracy</th>
                <th className="py-3 px-3">Avg Latency</th>
                <th className="py-3 px-3 text-right">Drift Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
              {gameModalityStats.map((g) => (
                <tr key={g.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>{g.name}</span>
                  </td>
                  <td className="py-3.5 px-3">{g.sessions} plays</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{g.avgAcc}</td>
                  <td className="py-3.5 px-3 tabular-nums">{g.avgLatency}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        g.status === 'Stable'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : g.status === 'Monitor'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCognitiveTrends;
