import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Sparkles,
  Layers,
  Users,
  PartyPopper,
  Mic,
  Home,
  BookOpen,
  Send,
  Database,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import {
  getQueuedActivities,
  syncQueuedActivities,
  removeQueuedActivity,
  clearAllQueuedActivities,
  QueuedActivity,
  SyncResult
} from '../utils/offlineQueue';
import { useNetworkStatus } from '../utils/networkStatus';
import { saveGameSession } from '../utils/gameSessionSync';
import { DEMO_PATIENT_ID } from '../config';

export const OfflineSyncScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, isBackendReachable, isChecking, checkHealth, pendingCount } = useNetworkStatus();

  const [queue, setQueue] = useState<QueuedActivity[]>(() => getQueuedActivities());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Refresh queue from local storage
  const refreshQueue = () => {
    setQueue(getQueuedActivities());
  };

  useEffect(() => {
    refreshQueue();
    const handleQueueChange = () => refreshQueue();
    window.addEventListener('smritisetu_offline_queue_changed', handleQueueChange);
    return () => {
      window.removeEventListener('smritisetu_offline_queue_changed', handleQueueChange);
    };
  }, []);

  // Sync Now handler
  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    // Re-verify network health
    await checkHealth();

    try {
      const result = await syncQueuedActivities();
      setLastSyncResult(result);
      refreshQueue();

      if (result.total === 0) {
        setSyncFeedback('All activities are already synced! ✓');
      } else if (result.failed === 0) {
        setSyncFeedback(`${result.succeeded}/${result.total} activities synced successfully! ✓`);
      } else if (result.succeeded > 0) {
        setSyncFeedback(`${result.succeeded}/${result.total} synced. ${result.failed} items failed and will retry.`);
      } else {
        setSyncFeedback(`Sync failed: Backend is currently unreachable. Items remain safe in offline queue.`);
      }
    } catch (err: any) {
      setSyncFeedback(`Sync encountered an error: ${err.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete single item
  const handleDeleteItem = (id: string) => {
    removeQueuedActivity(id);
    refreshQueue();
  };

  // Add dummy offline test item for instant demonstration
  const handleCreateTestOfflineSession = async () => {
    await saveGameSession(
      {
        patientId: DEMO_PATIENT_ID,
        gameType: 'memory_match',
        responseTimeMs: 3200,
        sessionDurationMs: 28000,
        correct: true,
        hintUsed: false,
        answerChanges: 1,
        difficultyLevel: 'medium',
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        metadataJson: JSON.stringify({
          accuracyPct: 92,
          totalAttempts: 6,
          correctMatches: 4,
          pairsTotal: 4,
          testNote: 'Simulated offline game session',
        }),
      },
      'Memory Match (Test)'
    );
    refreshQueue();
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // Format date helper
  const formatActivityTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Activity icon helper
  const getActivityIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('match')) return <Layers className="w-4 h-4 text-amber-600" />;
    if (l.includes('who')) return <Users className="w-4 h-4 text-rose-600" />;
    if (l.includes('festival')) return <PartyPopper className="w-4 h-4 text-orange-600" />;
    if (l.includes('speak') || l.includes('voice')) return <Mic className="w-4 h-4 text-teal-600" />;
    if (l.includes('daily') || l.includes('life')) return <Home className="w-4 h-4 text-blue-600" />;
    if (l.includes('story')) return <BookOpen className="w-4 h-4 text-purple-600" />;
    return <Sparkles className="w-4 h-4 text-slate-600" />;
  };

  const isFullyConnected = isOnline && isBackendReachable;

  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Offline Mode & Sync
          </span>
          <button
            type="button"
            onClick={() => checkHealth()}
            className={`p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors ${
              isChecking ? 'animate-spin text-teal-600' : ''
            }`}
            title="Check connection health"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {/* Connection Status Hero Card */}
          <div
            className={`rounded-3xl p-5 border shadow-xs transition-all ${
              isFullyConnected
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-100/50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                    isFullyConnected ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {isFullyConnected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold font-['Outfit']">
                      {isFullyConnected ? '🟢 Online & Connected' : '🔴 Offline Mode Active'}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-600 block">
                    {isFullyConnected
                      ? 'Backend server reachable and synced'
                      : 'Backend unreachable • Activities saved to local queue'}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  isFullyConnected
                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {isFullyConnected ? 'Live' : 'Cached'}
              </span>
            </div>

            {/* Offline Explanation Banner */}
            {!isFullyConnected && (
              <div className="mt-3.5 pt-3 border-t border-rose-200/60 text-xs text-rose-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <p>
                  You can play all six memory games normally. Your scores, answers, and clinical telemetry are
                  safely preserved on your device and will sync automatically when connectivity returns.
                </p>
              </div>
            )}
          </div>

          {/* Sync Stats & Quick Action */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Pending Activities
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {queue.length}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  {queue.length === 1 ? 'activity waiting to sync' : 'activities waiting to sync'}
                </span>
              </div>

              <button
                type="button"
                id="sync-now-button"
                disabled={isSyncing || queue.length === 0}
                onClick={handleSyncNow}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 ${
                  queue.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-[#0D5C4D] hover:bg-[#07382E] text-white shadow-[#0D5C4D]/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Sync Feedback Message Banner */}
            {syncFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn ${
                  syncFeedback.includes('✓') || syncFeedback.includes('success')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {syncFeedback.includes('✓') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <span>{syncFeedback}</span>
              </div>
            )}
          </div>

          {/* Activity Queue List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Queued Activity History ({queue.length})
              </h3>
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllQueuedActivities}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Queue is completely synced</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All your game sessions and memories are recorded in the central database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTestOfflineSession}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition mt-2"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Create Test Offline Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {queue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between space-x-3 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(item.label)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                          {item.difficultyLevel && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase">
                              {item.difficultyLevel}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatActivityTime(item.timestamp)}</span>
                          </span>
                          {typeof item.accuracyPct === 'number' && (
                            <span className="font-semibold text-emerald-700">
                              {item.accuracyPct}% score
                            </span>
                          )}
                        </div>

                        {item.lastError && (
                          <span className="text-[10px] text-rose-600 font-medium block truncate mt-0.5">
                            Last retry error: {item.lastError}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'syncing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : item.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status === 'syncing' ? 'Syncing' : item.status === 'failed' ? 'Pending Retry' : 'Queued'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 transition"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screen 15 Action Button */}
          <div className="pt-2 pb-1 space-y-2 text-center">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full py-4 px-6 bg-[#0D5C4D] hover:bg-[#09463A] active:scale-[0.99] text-white font-semibold rounded-2xl text-base shadow-lg shadow-[#0D5C4D]/25 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Try to sync'}</span>
            </button>
            <p className="text-xs text-slate-500 font-medium">
              Will sync automatically when you're online
            </p>
          </div>
        </div>

        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </div>
    </MobileContainer>
  );
};

export default OfflineSyncScreen;
