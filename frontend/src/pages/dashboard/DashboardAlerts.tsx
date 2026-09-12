import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Clock, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { StatusBadge } from '../../components/design-system';
import { API_BASE_URL } from '../../config';

interface AlertItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string | null;
  preferredLanguage: string;
  alertType: string;
  reasonText: string;
  metricChanges: any;
  createdAt: string;
  status: string;
  badgeStatus: 'Attention' | 'Monitor' | 'Stable';
}

interface DashboardAlertsProps {
  onSelectPatient: (patientId: string) => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ onSelectPatient }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Attention' | 'Monitor' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/alerts`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err: any) {
      console.error('Failed to fetch alerts:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.reasonText.toLowerCase().includes(search.toLowerCase()) ||
      a.alertType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'RESOLVED'
        ? a.status === 'RESOLVED'
        : a.badgeStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-700/80 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Clinical Monitoring Signals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            Cognitive & Trend Alerts ({alerts.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical deviations flagged across 3+ consecutive sessions
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Signals</span>
        </button>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="bg-[#FAF4ED] rounded-2xl px-4 py-3.5 flex items-center space-x-3 border border-[#F3E5D4] shadow-xs">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <p className="text-xs font-medium text-amber-950">
          <strong className="font-semibold">Regulatory Notice: </strong>
          This is a monitoring signal, not a diagnosis. Alerts highlight longitudinal deviation patterns for clinical review and family context.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by patient name, reason, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Attention', 'Monitor'] as const).map((tab) => {
            const count =
              tab === 'ALL'
                ? alerts.length
                : alerts.filter((a) => a.badgeStatus === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                  statusFilter === tab
                    ? 'bg-[#0D5C4D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab === 'ALL' ? 'All Signals' : tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No matching alerts</h3>
          <p className="text-xs text-slate-400">
            All active patient signals are currently within normal baseline parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectPatient(alert.patientId)}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-slate-300 transition cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-50 to-slate-100 border border-red-100 text-red-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {alert.patientName}
                    </h3>
                    <StatusBadge status={alert.badgeStatus} showDot size="sm" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {alert.alertType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                    {alert.reasonText}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5 font-mono">
                    <span>
                      Detected:{' '}
                      {new Date(alert.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-teal-700 font-sans font-medium">
                      Language: {alert.preferredLanguage || 'Hindi'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pl-15 md:pl-0">
                <button
                  type="button"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-[#0D5C4D] group-hover:text-white text-slate-700 text-xs font-semibold shadow-2xs transition"
                >
                  <span>Inspect Patient</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
