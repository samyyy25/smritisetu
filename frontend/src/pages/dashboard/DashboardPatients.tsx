import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Gamepad2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Plus,
  MapPin
} from 'lucide-react';
import { StatusBadge } from '../../components/design-system';
import { API_BASE_URL } from '../../config';

interface PatientItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  preferredLanguage: string;
  createdAt: string;
  status: 'Stable' | 'Monitor' | 'Attention';
  latestAlert: {
    id: string;
    alertType: string;
    reasonText: string;
    status: string;
    createdAt: string;
  } | null;
  _count: {
    gameSessions: number;
    alerts: number;
    memories: number;
  };
}

interface DashboardPatientsProps {
  onSelectPatient: (patientId: string) => void;
  onSelectPatientLocation?: (patientId: string) => void;
  onAddMemory?: () => void;
}

export const DashboardPatients: React.FC<DashboardPatientsProps> = ({
  onSelectPatient,
  onSelectPatientLocation,
  onAddMemory,
}) => {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Attention' | 'Monitor' | 'Stable'>('ALL');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.preferredLanguage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800/80 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-teal-700" />
            <span>Patient Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            Enrolled Patients ({patients.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status badges derived from continuous gameplay and AI monitoring analysis
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchPatients}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onAddMemory && (
            <button
              onClick={onAddMemory}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0D5C4D] hover:bg-[#07382E] text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory Cue</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Status:
          </span>
          {(['ALL', 'Attention', 'Monitor', 'Stable'] as const).map((tab) => {
            const count =
              tab === 'ALL'
                ? patients.length
                : patients.filter((p) => p.status === tab).length;

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
                <span>{tab === 'ALL' ? 'All' : tab}</span>
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

      {/* Patient Cards / Table List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={fetchPatients}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No patients found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition cursor-pointer group"
            >
              {/* Left: Patient Avatar & Meta */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-slate-100 border border-teal-100 flex items-center justify-center font-bold text-teal-900 text-base overflow-hidden flex-shrink-0 shadow-xs">
                  {patient.avatarUrl ? (
                    <img
                      src={patient.avatarUrl}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{patient.name.charAt(0)}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {patient.name}
                    </h3>
                    <StatusBadge status={patient.status} showDot size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">
                      🗣️ {patient.preferredLanguage}
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Gamepad2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient._count.gameSessions} Sessions</span>
                    </span>
                    <span>•</span>
                    <span>
                      {patient._count.memories} Memory Cues
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Latest Signal Snippet & Action Button */}
              <div className="flex items-center justify-between md:justify-end space-x-4 pl-16 md:pl-0">
                {patient.latestAlert ? (
                  <div className="max-w-xs text-left md:text-right hidden sm:block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Latest Signal
                    </span>
                    <span className="text-xs text-slate-600 line-clamp-1">
                      {patient.latestAlert.reasonText}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium hidden sm:inline">
                    ✨ Baseline Performance Stable
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  {onSelectPatientLocation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatientLocation(patient.id);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition"
                      title={`View ${patient.name}'s location history & safe places`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-700" />
                      <span className="hidden sm:inline">Location</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 group-hover:bg-[#0D5C4D] group-hover:text-white text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    <span>View Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
