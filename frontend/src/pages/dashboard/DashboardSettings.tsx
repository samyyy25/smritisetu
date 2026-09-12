import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Bell,
  Globe,
  HeartHandshake,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface DashboardSettingsProps {
  onBackToOverview: () => void;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  onBackToOverview,
}) => {
  // Sensitivity Settings
  const [latencyThreshold, setLatencyThreshold] = useState(25);
  const [accuracyDropThreshold, setAccuracyDropThreshold] = useState(15);
  const [minSessions, setMinSessions] = useState(3);
  const [autoAshaDispatch, setAutoAshaDispatch] = useState(true);

  // Notification Settings
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210');
  const [caregiverEmail, setCaregiverEmail] = useState('priya.sharma@example.com');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');

  // Cultural & Language Settings
  const [primaryLang, setPrimaryLang] = useState('en');
  const [enableAssamCues, setEnableAssamCues] = useState(true);
  const [enableBihuFestival, setEnableBihuFestival] = useState(true);
  const [enableGangaAarti, setEnableGangaAarti] = useState(true);

  // ASHA Linkage
  const [subCentreName, setSubCentreName] = useState('Dispur Health Sub-Centre, Ward 4');
  const [ashaWorkerName, setAshaWorkerName] = useState('Sunita Gogoi (ASHA Lead)');

  // Save Feedback
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-teal-700" />
            <span>Clinic Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Clinical & System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure AI decline detection thresholds, caregiver SMS routing, ASHA dispatch triggers, and regional cultural models.
          </p>
        </div>

        {isSaved ? (
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Cognitive Decline Thresholds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
                AI Cognitive Decline Drift Thresholds
              </h2>
              <p className="text-xs text-slate-400">Controls sensitivity for flagging Attention & Monitor alerts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
            {/* Latency Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Reaction Time Slowdown Trigger</span>
                <span className="font-bold text-[#0D5C4D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  +{latencyThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                className="w-full accent-[#0D5C4D] cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Triggers cognitive alert when 14-day mean reaction latency increases by {latencyThreshold}% or more.
              </p>
            </div>

            {/* Accuracy Drop Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Accuracy Drop Alert Sensitivity</span>
                <span className="font-bold text-[#0D5C4D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  -{accuracyDropThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="5"
                value={accuracyDropThreshold}
                onChange={(e) => setAccuracyDropThreshold(Number(e.target.value))}
                className="w-full accent-[#0D5C4D] cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Flags potential memory changes when game recall drops by {accuracyDropThreshold}% from patient baseline.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Minimum Consecutive Sessions Before Flagging</span>
            <select
              value={minSessions}
              onChange={(e) => setMinSessions(Number(e.target.value))}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="2">2 Completed Sessions</option>
              <option value="3">3 Completed Sessions (Recommended)</option>
              <option value="5">5 Completed Sessions</option>
            </select>
          </div>
        </div>

        {/* Section 2: Caregiver Alert Routing & Channels */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Caregiver Emergency Alert Channels
              </h2>
              <p className="text-xs text-slate-400">Route cognitive anomalies and missed routine notifications to family members.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Caregiver WhatsApp / Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Caregiver Email Address</label>
              <input
                type="email"
                value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-[#0D5C4D] rounded accent-[#0D5C4D]"
              />
              <span className="font-semibold text-slate-700">WhatsApp Instant Alerts</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-[#0D5C4D] rounded accent-[#0D5C4D]"
              />
              <span className="font-semibold text-slate-700">SMS Fallback for Offline Areas</span>
            </label>
          </div>
        </div>

        {/* Section 3: Cultural Models & Regional Language */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Cultural Cue Packs & Regional Dialects
              </h2>
              <p className="text-xs text-slate-400">Activate localized prompts familiar to the patient's upbringing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Interface & Speech Language</label>
              <select
                value={primaryLang}
                onChange={(e) => setPrimaryLang(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
              >
                <option value="en">English (Indian English)</option>
                <option value="as">অসমীয়া (Assamese)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ne">नेपाली (Nepali)</option>
                <option value="kha">Khasi (Meghalaya)</option>
                <option value="miz">Mizo (Mizoram)</option>
              </select>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Active Cultural Memory Packs</span>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBihuFestival}
                    onChange={(e) => setEnableBihuFestival(e.target.checked)}
                    className="w-4 h-4 text-[#0D5C4D] rounded accent-[#0D5C4D]"
                  />
                  <span className="text-slate-700 font-medium">Bihu & Assam Heritage Pack</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGangaAarti}
                    onChange={(e) => setEnableGangaAarti(e.target.checked)}
                    className="w-4 h-4 text-[#0D5C4D] rounded accent-[#0D5C4D]"
                  />
                  <span className="text-slate-700 font-medium">Varanasi & Ganga Aarti Pack</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: ASHA Field Worker Sub-Centre Linking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
                ASHA Community Health Sub-Centre Integration
              </h2>
              <p className="text-xs text-slate-400">Link patient records to local sub-centre for home visit dispatches.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Health Sub-Centre</label>
              <input
                type="text"
                value={subCentreName}
                onChange={(e) => setSubCentreName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lead ASHA Worker Contact</label>
              <input
                type="text"
                value={ashaWorkerName}
                onChange={(e) => setAshaWorkerName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={autoAshaDispatch}
                onChange={(e) => setAutoAshaDispatch(e.target.checked)}
                className="w-4 h-4 text-[#0D5C4D] rounded accent-[#0D5C4D]"
              />
              <span className="font-semibold text-slate-800">
                Automatically schedule ASHA home visit notice upon 2 consecutive Attention alerts
              </span>
            </label>
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Clinical Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardSettings;
