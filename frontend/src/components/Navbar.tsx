import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, WifiOff, Cloud, HeartHandshake } from 'lucide-react';
import { LogoLockup } from './design-system/LogoLockup';
import { useNetworkStatus } from '../utils/networkStatus';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isOnline, isBackendReachable, pendingCount } = useNetworkStatus();
  const fullyConnected = isOnline && isBackendReachable;

  const isPatientApp = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isAsha = location.pathname === '/asha';
  const isOfflineScreen = location.pathname === '/offline' || location.pathname === '/sync';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with exact reference lockup */}
          <Link to="/" className="flex items-center group">
            <LogoLockup size="sm" theme="light" showTagline={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/offline"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isOfflineScreen
                  ? 'bg-[#0D5C4D] text-white shadow-md shadow-[#0D5C4D]/20'
                  : !fullyConnected
                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  : pendingCount > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-slate-600 hover:text-[#0D5C4D] hover:bg-[#EAF6F3]'
              }`}
              title={
                !fullyConnected
                  ? 'SmritiSetu Offline Mode'
                  : pendingCount > 0
                  ? `${pendingCount} activities waiting to sync`
                  : 'Sync and Connectivity'
              }
            >
              {!fullyConnected ? (
                <WifiOff className="w-4 h-4 text-red-600" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {!fullyConnected ? 'Offline' : pendingCount > 0 ? `Sync (${pendingCount})` : 'Offline Sync'}
              </span>
            </Link>

            <Link
              to="/asha"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isAsha
                  ? 'bg-[#0D5C4D] text-white shadow-md shadow-[#0D5C4D]/20'
                  : 'text-slate-600 hover:text-[#0D5C4D] hover:bg-[#EAF6F3]'
              }`}
              title="Simplified ASHA Community Health Worker Field Portal"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">ASHA</span>
            </Link>

            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isPatientApp
                  ? 'bg-[#0D5C4D] text-white shadow-md shadow-[#0D5C4D]/20'
                  : 'text-slate-600 hover:text-[#0D5C4D] hover:bg-[#EAF6F3]'
              }`}
              title="Patient Mobile App"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Patient App</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isDashboard
                  ? 'bg-[#0D5C4D] text-white shadow-md shadow-[#0D5C4D]/20'
                  : 'text-slate-600 hover:text-[#0D5C4D] hover:bg-[#EAF6F3]'
              }`}
              title="Caregiver & Clinician Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
