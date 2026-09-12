import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, WifiOff, ArrowLeft, Wrench, Shield } from 'lucide-react';

export const DevToolsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 p-6 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Developer & Testing Tools</h1>
              <p className="text-xs text-slate-500">Internal testing screens and design system validation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Role Selector</span>
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            These screens are intended strictly for developers and automated verification during build. They are excluded from both the Patient App and Caregiver Dashboard navigations.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tool 1: Styleguide */}
          <button
            type="button"
            onClick={() => navigate('/styleguide')}
            className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Design System Styleguide</h2>
              <p className="text-xs text-slate-500 mt-1">
                Visual tokens, color swatches, typography scale, buttons, and component demos.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2">
              <span>Open Styleguide</span>
              <span>&rarr;</span>
            </div>
          </button>

          {/* Tool 2: Offline Sync */}
          <button
            type="button"
            onClick={() => navigate('/offline-sync')}
            className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D5C4D] flex items-center justify-center group-hover:scale-105 transition-transform">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Offline Sync Inspector</h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect IndexedDB / localStorage queue, network latency simulator, and manual flush.
              </p>
            </div>
            <div className="text-xs font-bold text-[#0D5C4D] flex items-center gap-1 pt-2">
              <span>Open Sync Screen</span>
              <span>&rarr;</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pt-8">
        SmritiSetu v1.0 • Internal Engineering Tools
      </div>
    </div>
  );
};

export default DevToolsScreen;
