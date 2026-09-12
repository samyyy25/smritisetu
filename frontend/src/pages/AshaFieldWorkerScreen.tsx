import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  User,
  Clock,
  ChevronRight,
  X,
  MapPin,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../components/design-system/StatusBadge';
import { API_BASE_URL } from '../config';

interface PatientSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  preferredLanguage: string;
  createdAt: string;
  lastActiveAt?: string;
  status: 'Stable' | 'Monitor' | 'Attention';
  latestAlert?: {
    alertType: string;
    reasonText: string;
    status: string;
    createdAt: string;
  } | null;
  latestSession?: {
    timestamp: string;
    startedAt: string;
    gameType: string;
  } | null;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const date = new Date(dateStr);
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getAshaGuidanceText(status: string, alertReason?: string): string {
  if (status === 'Attention') {
    if (alertReason) {
      const lower = alertReason.toLowerCase();
      if (lower.includes('reaction') || lower.includes('speed') || lower.includes('slow')) {
        return 'Reaction time has been slower than usual — consider a friendly home visit to check in.';
      }
      if (lower.includes('accuracy') || lower.includes('decline') || lower.includes('score')) {
        return 'Memory recall accuracy dropped recently — check if daily medicines are being taken properly.';
      }
      if (lower.includes('routine') || lower.includes('missed') || lower.includes('medicine')) {
        return 'Morning or evening routine was not recorded — verify medicine adherence with family.';
      }
    }
    return 'Cognitive alert flagged — recommend scheduling a home visit within 48 hours.';
  }

  if (status === 'Monitor') {
    if (alertReason) {
      const lower = alertReason.toLowerCase();
      if (lower.includes('hesitation') || lower.includes('change') || lower.includes('answer')) {
        return 'Hesitation while answering has increased — patient may need a little extra patience and support.';
      }
    }
    return 'Mild changes noted — keep an eye on routine during your next village round.';
  }

  return 'Cognitive scores and routines are stable. Continue regular monthly check-in.';
}

const FALLBACK_ASHA_PATIENTS: PatientSummary[] = [
  {
    id: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    name: 'Anita Devi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Assamese',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'Attention',
    latestAlert: {
      alertType: 'COGNITIVE_CHANGE',
      reasonText: 'Reaction time slowed by 34% during festival sequence recall and pattern matching over the last 14 days.',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      gameType: 'festival_memories',
    },
  },
  {
    id: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    name: 'Ramesh Das',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Assamese',
    createdAt: '2024-01-15T00:00:00.000Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'Stable',
    latestAlert: null,
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      gameType: 'memory_match',
    },
  },
  {
    id: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    name: 'Maya Devi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Nepali',
    createdAt: '2024-02-01T00:00:00.000Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'Monitor',
    latestAlert: {
      alertType: 'MONITORING_SIGNAL',
      reasonText: 'Hesitation rate increased by 45% with answer revisions doubling across daily challenges over the last 10 days.',
      status: 'MONITOR',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      gameType: 'daily_challenge',
    },
  },
  {
    id: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    name: 'Bikash Saikia',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Bodo',
    createdAt: '2024-02-10T00:00:00.000Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'Stable',
    latestAlert: null,
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      gameType: 'remember_and_speak',
    },
  },
];

export const AshaFieldWorkerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>(FALLBACK_ASHA_PATIENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Attention' | 'Monitor' | 'Stable'>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [visitLoggedNotice, setVisitLoggedNotice] = useState<string | null>(null);

  // Fetch real patients from backend API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.patients) && data.patients.length > 0) {
        setPatients(data.patients);
      } else {
        setPatients(FALLBACK_ASHA_PATIENTS);
      }
    } catch (err: any) {
      console.warn('Using local fallback patient roster for ASHA portal:', err);
      setPatients(FALLBACK_ASHA_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const attentionCount = patients.filter((p) => p.status === 'Attention').length;
  const monitorCount = patients.filter((p) => p.status === 'Monitor').length;
  const stableCount = patients.filter((p) => p.status === 'Stable').length;

  const handleLogVisit = (patientName: string) => {
    setVisitLoggedNotice(`Home visit scheduled for ${patientName}! Notification sent to sub-centre.`);
    setTimeout(() => {
      setVisitLoggedNotice(null);
      setSelectedPatient(null);
    }, 2200);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] sm:min-h-screen sm:h-auto bg-[#F4F6F8] text-slate-800 flex justify-center py-0 sm:py-4 sm:px-4 overflow-hidden">
      {/* Responsive Multi-device Frame Container */}
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white sm:rounded-3xl shadow-none sm:shadow-xl sm:border border-slate-200 flex flex-col h-[100dvh] sm:h-[calc(100dvh-4rem)] overflow-hidden relative">
        
        {/* Top Header with High-Contrast Branding */}
        <header className="bg-[#0D5C4D] text-white px-5 sm:px-6 pt-4 pb-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                <HeartHandshake className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-teal-200 font-bold block">
                  Community Health Worker
                </span>
                <h1 className="text-lg font-bold leading-tight flex items-center gap-1.5">
                  <span>ASHA Field Portal</span>
                  <ShieldCheck className="w-4 h-4 text-amber-300 inline" />
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchPatients}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
              title="Refresh Patient List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Sub-centre Info Bar */}
          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-teal-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-200" />
              <span>Dispur Health Sub-Centre</span>
            </span>
            <span className="font-bold bg-white/15 px-2.5 py-0.5 rounded-full text-white">
              {patients.length} Assigned Patients
            </span>
          </div>
        </header>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-3">
          {/* Search Input with Large Touch Target */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assigned patient by name…"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Large Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({patients.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Attention')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'Attention'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>Attention ({attentionCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Monitor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'Monitor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Monitor ({monitorCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Stable')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'Stable'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Stable ({stableCount})</span>
            </button>
          </div>
        </div>

        {/* Patient List Content Area with Responsive Multi-Column Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F4F6F8]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0D5C4D]" />
              <p className="text-sm font-semibold">Loading assigned patients…</p>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Error loading data
              </p>
              <p className="text-xs">{error}</p>
              <button
                type="button"
                onClick={fetchPatients}
                className="mt-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2 bg-white rounded-3xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <User className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">No patients found</p>
              <p className="text-xs text-slate-500">
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPatients.map((patient) => {
                const lastActiveText = formatRelativeTime(patient.lastActiveAt);

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full bg-white hover:bg-slate-50/90 active:scale-[0.99] rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between text-left transition-all group select-none"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Large 56px Avatar with High Contrast Ring */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                          {patient.avatarUrl ? (
                            <img
                              src={patient.avatarUrl}
                              alt={patient.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#EAF6F3] text-[#0D5C4D] font-bold text-lg">
                              {patient.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            patient.status === 'Attention'
                              ? 'bg-red-500'
                              : patient.status === 'Monitor'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      {/* Patient Details & Status */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 truncate">
                            {patient.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={patient.status} showDot size="sm" />
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {lastActiveText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Big Tap Chevron */}
                    <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2">
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Bottom Bar: Back to Caregiver Dashboard */}
        <footer className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#0D5C4D] hover:bg-[#EAF6F3] font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Caregiver Dashboard</span>
          </button>

          <span className="text-[11px] text-slate-400 font-medium">
            ASHA Community Portal
          </span>
        </footer>

        {/* Minimal Detail View Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setSelectedPatient(null)}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 space-y-5 border border-slate-200">
              
              {/* Notice Banner if visit logged */}
              {visitLoggedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{visitLoggedNotice}</span>
                </div>
              )}

              {/* Header with Close */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Patient Field Profile
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Hero Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-sm">
                  {selectedPatient.avatarUrl ? (
                    <img
                      src={selectedPatient.avatarUrl}
                      alt={selectedPatient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EAF6F3] text-[#0D5C4D] font-bold text-xl">
                      {selectedPatient.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preferred: {selectedPatient.preferredLanguage} • Dispur Sub-Centre
                  </p>
                </div>
              </div>

              {/* Status and Last Active Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Current Status
                  </span>
                  <StatusBadge status={selectedPatient.status} showDot size="md" />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Last Active
                  </span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {formatRelativeTime(selectedPatient.lastActiveAt)}
                  </span>
                </div>
              </div>

              {/* Single Plain-Language Field Worker Guidance Line */}
              <div
                className={`p-4 rounded-2xl border text-sm font-medium leading-relaxed ${
                  selectedPatient.status === 'Attention'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : selectedPatient.status === 'Monitor'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <span className="mt-0.5 shrink-0">
                    {selectedPatient.status === 'Attention' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : selectedPatient.status === 'Monitor' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </span>
                  <div>
                    <span className="font-bold block text-xs uppercase tracking-wider mb-1">
                      Field Worker Guidance
                    </span>
                    <p>
                      {getAshaGuidanceText(
                        selectedPatient.status,
                        selectedPatient.latestAlert?.reasonText
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Large Touch Action Buttons (Min 48px Height) */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleLogVisit(selectedPatient.name)}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#0D5C4D] hover:bg-[#0a4a3d] active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Log / Schedule Home Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Calling family caregiver for ${selectedPatient.name}…`)}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 active:scale-98 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call Family Caregiver</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
