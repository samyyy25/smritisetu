import React, { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Server } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  database: {
    status: 'connected' | 'disconnected' | string;
    type: string;
    latencyMs?: number;
    error?: string;
  };
  serverUptimeSeconds?: number;
  timestamp: string;
}

export const HealthStatusCard: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // First attempt relative proxy URL, fallback to localhost:5000 if not running behind Vite proxy
      let response: Response;
      try {
        response = await fetch('/api/health');
      } catch {
        response = await fetch('http://localhost:5000/api/health');
      }

      const data = await response.json();
      setHealth(data);
      if (!response.ok && data.database?.status !== 'connected') {
        setError(data.database?.error || 'Database is unreachable');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not connect to Express API server at :5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isDbAlive = health?.database?.status === 'connected';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/80 p-6 backdrop-blur-md shadow-xl transition-all hover:border-slate-600">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isDbAlive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              System & Database Health Probe
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                GET /api/health
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Active PostgreSQL query verification via Prisma ORM
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all disabled:opacity-50"
          title="Re-run health check"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          {loading ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* PostgreSQL Database Status */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Database Connection</span>
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            {isDbAlive ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">PostgreSQL Alive</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">
                  {loading ? 'Probing...' : 'Disconnected / Standby'}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            {isDbAlive
              ? `Query Latency: ${health?.database?.latencyMs ?? 0}ms`
              : error
              ? 'Check DATABASE_URL in /backend/.env'
              : 'Verifying DB query...'}
          </div>
        </div>

        {/* Express Server Status */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Backend API Server</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            {health ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-slate-200">Express (Port 5000)</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold text-slate-300">
                  {loading ? 'Connecting...' : 'API Offline'}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Uptime: {health?.serverUptimeSeconds !== undefined ? `${health.serverUptimeSeconds}s` : '—'}
          </div>
        </div>

        {/* Live Diagnostics */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Probe Verified At</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-mono text-slate-300 truncate">
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Awaiting check'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {isDbAlive
              ? 'Prisma $queryRaw probe passed'
              : 'Start backend: npm run dev in /backend'}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200/90 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Health Probe Notice: </span>
            {error}
            <div className="mt-1 text-slate-400">
              Ensure PostgreSQL is running and <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200 font-mono">DATABASE_URL</code> in <code className="bg-slate-900 px-1 py-0.5 rounded font-mono">/backend/.env</code> points to your database instance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
