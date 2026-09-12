import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  PhoneCall,
  Volume2,
  Type,
  Globe,
  ShieldCheck,
  Heart,
  ChevronRight,
  Wifi,
  Sparkles,
  Edit2,
  Check
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';
import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from '../i18n';
import { useNetworkStatus } from '../utils/networkStatus';

export const PatientProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isOnline, isBackendReachable, pendingCount } = useNetworkStatus();

  const [patientData, setPatientData] = useState({
    name: 'Asha Devi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    age: 72,
    emergencyContactName: 'Priya Sharma (Daughter)',
    emergencyContactPhone: '+91 98765 43210',
    preferredLanguage: 'English',
  });

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactNameInput, setContactNameInput] = useState('');
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}`);
        if (res.ok) {
          const data = await res.json();
          setPatientData({
            name: data.name || 'Asha Devi',
            avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
            age: data.age || 72,
            emergencyContactName: data.emergencyContactName || 'Priya Sharma (Daughter)',
            emergencyContactPhone: data.emergencyContactPhone || '+91 98765 43210',
            preferredLanguage: data.preferredLanguage || 'English',
          });
          setContactNameInput(data.emergencyContactName || 'Priya Sharma (Daughter)');
          setContactPhoneInput(data.emergencyContactPhone || '+91 98765 43210');
        }
      } catch (err) {
        console.warn('Using local patient data in profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSaveContact = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyContactName: contactNameInput,
          emergencyContactPhone: contactPhoneInput,
        }),
      });
      setPatientData((prev) => ({
        ...prev,
        emergencyContactName: contactNameInput,
        emergencyContactPhone: contactPhoneInput,
      }));
      setIsEditingContact(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update emergency contact:', err);
    }
  };

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === (i18n.language || 'en')) ||
    SUPPORTED_LANGUAGES[0];

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  return (
    <MobileContainer showTopBar={false}>
      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/patient/home')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Go to Home"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            {t('profile_title', 'Patient Profile')}
          </span>

          <div className="w-7 h-7" />
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Patient Identity Card with Fixed Contained Avatar Frame */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card flex items-center space-x-4 relative overflow-hidden">
              <div className="w-20 h-20 min-w-[5rem] min-h-[5rem] max-w-[5rem] max-h-[5rem] rounded-full overflow-hidden p-1 bg-gradient-to-tr from-teal-500 to-amber-300 shadow-md flex-shrink-0">
                <img
                  src={patientData.avatarUrl}
                  alt={patientData.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">
                  {patientData.name}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {patientData.age} {t('years_old', 'years old')} • Mild Cognitive Support
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Enrolled in SmritiSetu</span>
                </span>
              </div>
            </div>

            {/* Language Selection Card */}
            <div
              onClick={() => setIsLangModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft-card flex items-center justify-between cursor-pointer hover:border-teal-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6F4] text-[#0D5C4D] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('select_language', 'Choose Language')}
                  </span>
                  <span className="text-xs font-semibold text-[#0D5C4D] mt-0.5 block">
                    {currentLang.nativeName} ({currentLang.englishName})
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#0D5C4D]">
                <span>Change</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t('emergency_contact', 'Emergency Contact')}
                  </span>
                </div>
                {!isEditingContact ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(true)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition"
                    title={t('edit_contact', 'Edit Contact')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveContact}
                    className="flex items-center space-x-1 text-xs font-bold text-emerald-600"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('save_changes', 'Save')}</span>
                  </button>
                )}
              </div>

              {isEditingContact ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={contactNameInput}
                    onChange={(e) => setContactNameInput(e.target.value)}
                    placeholder="Contact Name (e.g. Priya - Daughter)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  <input
                    type="tel"
                    value={contactPhoneInput}
                    onChange={(e) => setContactPhoneInput(e.target.value)}
                    placeholder="Phone Number (e.g. +91 98765 43210)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 font-semibold hover:bg-slate-100 rounded-lg"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveContact}
                      className="px-3 py-1.5 text-xs bg-[#0D5C4D] text-white font-bold rounded-lg shadow-2xs"
                    >
                      {t('save_changes', 'Save')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {patientData.emergencyContactName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {patientData.emergencyContactPhone}
                    </p>
                  </div>

                  <a
                    href={`tel:${patientData.emergencyContactPhone}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('call_contact', 'Call')}</span>
                  </a>
                </div>
              )}

              {savedSuccess && (
                <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                  ✓ Emergency contact details updated!
                </p>
              )}
            </div>

            {/* Accessibility & Device Settings */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {t('accessibility_settings', 'Accessibility & Voice')}
              </span>

              {/* Voice Guidance Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {t('voice_guidance', 'Voice Guidance')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('voice_guidance_desc', 'Reads instructions aloud automatically')}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceGuidanceEnabled}
                  onChange={(e) => setVoiceGuidanceEnabled(e.target.checked)}
                  className="w-5 h-5 text-[#0D5C4D] rounded-md border-slate-300 focus:ring-[#0D5C4D]"
                />
              </div>

              {/* Large Text Mode Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {t('easy_mode', 'Easy Mode (Large Text)')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('easy_mode_desc', 'Increases touch targets and readability')}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isLargeText}
                  onChange={(e) => setIsLargeText(e.target.checked)}
                  className="w-5 h-5 text-[#0D5C4D] rounded-md border-slate-300 focus:ring-[#0D5C4D]"
                />
              </div>
            </div>

            {/* Offline Sync Status Link */}
            <div
              onClick={() => navigate('/offline')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft-card flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('offline_sync', 'Offline Sync Status')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isOnline && isBackendReachable
                      ? '🟢 Connected to server'
                      : `🔴 ${pendingCount} activities waiting to sync`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Footer App Info */}
          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              SmritiSetu Cognitive Care • SIH 2026
            </span>
          </div>
        </div>
      </div>

      <BottomNavBar activeTab="more" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default PatientProfileScreen;
