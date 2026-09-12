import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Activity, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { StatCard, StatusBadge } from '../../components/design-system';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../../config';

interface OverviewData {
  stats: {
    totalPatients: number;
    stable: number;
    monitor: number;
    attention: number;
  };
  cognitiveOverview: {
    timeframe: string;
    accuracyChangePct: number;
    reactionTimeChangePct: number;
    hesitationChangePct: number;
    hintsUsedChangePct: number;
    recentAvg: {
      accuracy: number;
      reactionTimeSec: number;
      hesitationRate: number;
      hintsUsedRate: number;
    };
  };
  recentAlerts: Array<{
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar: string | null;
    alertType: string;
    reasonText: string;
    metricChanges: any;
    createdAt: string;
    status: string;
    badgeStatus: 'Attention' | 'Monitor' | 'Stable';
  }>;
  disclaimer: string;
}

interface DashboardOverviewProps {
  onNavigateToPatient?: (patientId: string) => void;
  onNavigateToAlerts?: () => void;
  onNavigateToPatients?: () => void;
  onNavigateToLocation?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToPatient,
  onNavigateToAlerts,
  onNavigateToPatients,
  onNavigateToLocation,
}) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [placesCount, setPlacesCount] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, placesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/overview`),
        fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/places`),
      ]);

      if (!overviewRes.ok) throw new Error(`Server returned ${overviewRes.status}`);
      const json = await overviewRes.json();
      setData(json);

      if (placesRes.ok) {
        const places = await placesRes.json();
        if (Array.isArray(places)) {
          setPlacesCount(places.length);
        }
      }
    } catch (err: any) {
      console.error('Failed to load dashboard overview:', err);
      setError(err.message || 'Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const todayDateString = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const formatAlertTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200/70 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="h-44 bg-slate-200/70 rounded-3xl" />
        <div className="h-64 bg-slate-200/70 rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-900">Failed to load overview data</h3>
        <p className="text-sm text-red-700">{error || 'Server error'}</p>
        <button
          onClick={fetchOverview}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { stats, cognitiveOverview, recentAlerts, disclaimer } = data;

  return (
    <div className="space-y-7 pb-10">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800/80 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Clinical Monitoring Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            Good morning, Dr. Mehta 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayDateString}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOverview}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onNavigateToPatients}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0D5C4D] hover:bg-[#07382E] text-white text-xs font-semibold shadow-sm transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All Patients</span>
          </button>
        </div>
      </div>

      {/* Row of 5 StatCards: 3+2 wrap on smaller screens, 5 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="cursor-pointer" onClick={onNavigateToPatients}>
          <StatCard
            label="Total Patients"
            value={stats.totalPatients}
            delta="Enrolled"
            icon={<Users className="w-4 h-4" />}
            variant="blue"
          />
        </div>
        <StatCard
          label="Stable Cohort"
          value={stats.stable}
          delta={`${Math.round((stats.stable / Math.max(stats.totalPatients, 1)) * 100)}%`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="stable"
        />
        <StatCard
          label="Monitor"
          value={stats.monitor}
          delta="Hesitation/Mild"
          icon={<Eye className="w-4 h-4" />}
          variant="monitor"
        />
        <div className="cursor-pointer" onClick={onNavigateToAlerts}>
          <StatCard
            label="Needs Attention"
            value={stats.attention}
            delta="Sustained Change"
            icon={<AlertTriangle className="w-4 h-4" />}
            variant="attention"
          />
        </div>
        <div className="cursor-pointer" onClick={onNavigateToLocation}>
          <StatCard
            label="Places Tracked"
            value={placesCount}
            delta="Safe Zones"
            icon={<MapPin className="w-4 h-4" />}
            variant="stable"
          />
        </div>
      </div>

      {/* Cognitive Overview (Last 14 Days) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Cognitive Overview ({cognitiveOverview.timeframe})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregate performance metrics and trend signals across all active patient gameplay sessions
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 self-start sm:self-auto">
            Live AI Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Accuracy Change */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Avg. Accuracy</span>
              <span className="text-xs font-bold text-slate-800">{cognitiveOverview.recentAvg.accuracy}%</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-['Outfit'] text-slate-900">
                {cognitiveOverview.accuracyChangePct > 0 ? `+${cognitiveOverview.accuracyChangePct}%` : `${cognitiveOverview.accuracyChangePct}%`}
              </span>
              <div className="flex items-center text-xs font-semibold">
                {cognitiveOverview.accuracyChangePct >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Stable/Up
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Drift
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">vs. prior 14-day window</p>
          </div>

          {/* Reaction Time Change */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Reaction Latency</span>
              <span className="text-xs font-bold text-slate-800">{cognitiveOverview.recentAvg.reactionTimeSec}s</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-['Outfit'] text-slate-900">
                {cognitiveOverview.reactionTimeChangePct > 0 ? `+${cognitiveOverview.reactionTimeChangePct}%` : `${cognitiveOverview.reactionTimeChangePct}%`}
              </span>
              <div className="flex items-center text-xs font-semibold">
                {cognitiveOverview.reactionTimeChangePct <= 5 ? (
                  <span className="text-emerald-600 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-0.5" /> Expected
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Slower
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Average response time drift</p>
          </div>

          {/* Hesitation (Answer Changes) */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Hesitation (Swaps)</span>
              <span className="text-xs font-bold text-slate-800">{cognitiveOverview.recentAvg.hesitationRate}/game</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-['Outfit'] text-slate-900">
                {cognitiveOverview.hesitationChangePct > 0 ? `+${cognitiveOverview.hesitationChangePct}%` : `${cognitiveOverview.hesitationChangePct}%`}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                {cognitiveOverview.hesitationChangePct > 0 ? 'Trending' : 'Flat'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Answer corrections before pick</p>
          </div>

          {/* Hints Used */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Hints Reliance</span>
              <span className="text-xs font-bold text-slate-800">{cognitiveOverview.recentAvg.hintsUsedRate}%</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-['Outfit'] text-slate-900">
                {cognitiveOverview.hintsUsedChangePct > 0 ? `+${cognitiveOverview.hintsUsedChangePct}%` : `${cognitiveOverview.hintsUsedChangePct}%`}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-0.5" /> Cue rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Assistance requested during games</p>
          </div>
        </div>
      </div>

      {/* Recent Alerts Section with Disclaimer */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Recent Cognitive & Performance Alerts
              </h2>
              <p className="text-xs text-slate-500">
                Statistical deviations flagged across 3+ consecutive game sessions
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAlerts}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
          >
            <span>View All Alerts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fixed Disclaimer Banner */}
        <div className="bg-[#FAF4ED] rounded-2xl px-4 py-3 flex items-center space-x-3 border border-[#F3E5D4]">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <p className="text-xs font-medium text-amber-950">
            <strong className="font-semibold">Clinical Note: </strong>
            {disclaimer}
          </p>
        </div>

        {/* Alerts List */}
        {recentAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active cognitive decline alerts</p>
            <p className="text-xs text-slate-400 mt-0.5">All monitored patients are performing within expected baselines.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigateToPatient?.(alert.patientId)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-3 rounded-2xl transition cursor-pointer group"
              >
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden flex-shrink-0">
                    {alert.patientAvatar ? (
                      <img src={alert.patientAvatar} alt={alert.patientName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{alert.patientName.charAt(0)}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                        {alert.patientName}
                      </span>
                      <StatusBadge status={alert.badgeStatus} showDot size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      {alert.reasonText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-14 sm:pl-0">
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {formatAlertTime(alert.createdAt)}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-teal-700 group-hover:text-white text-slate-700 text-xs font-semibold transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
