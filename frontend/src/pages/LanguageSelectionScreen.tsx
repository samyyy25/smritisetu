import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption, languageCodeToName } from '../i18n';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';

export const LanguageSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [selectedLang, setSelectedLang] = useState<string>(currentLang);
  const [isSaving, setIsSaving] = useState(false);

  const getLanguageVisualIcon = (code: string) => {
    switch (code) {
      case 'as':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#E6F3EE] flex items-center justify-center text-2xl shadow-inner border border-[#A7E8C7]/50">
            🌾
          </div>
        );
      case 'ne':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#EDF5FE] flex items-center justify-center text-2xl shadow-inner border border-[#D3E7FC]/50">
            🏔️
          </div>
        );
      case 'kha':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#F3EEF9] flex items-center justify-center text-2xl shadow-inner border border-[#E1D5F2]/50">
            🌿
          </div>
        );
      case 'hi':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#FEF5E7] flex items-center justify-center text-2xl shadow-inner border border-[#FCE6C7]/50">
            🪔
          </div>
        );
      case 'miz':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#FDEEF1] flex items-center justify-center text-2xl shadow-inner border border-[#F9D6DE]/50">
            🌺
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner border border-slate-200">
            🌐
          </div>
        );
    }
  };

  const handleContinue = async () => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);
    if (!langObj) {
      navigate('/patient/home');
      return;
    }

    await i18n.changeLanguage(langObj.code);
    setIsSaving(true);
    try {
      const preferredLanguage = languageCodeToName(langObj.code);
      await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage }),
      });
    } catch (err) {
      console.warn('[LanguageScreen] Failed to save preferredLanguage to backend:', err);
    } finally {
      setIsSaving(false);
      navigate('/patient/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto font-sans">
      {/* Top Bar & Header */}
      <div>
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#07382E]">
            {t('choose_language_title', 'Choose your language')}
          </h1>
        </div>

        <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
          {t('choose_language_desc', 'Please select your preferred language. You can change it anytime.')}
        </p>

        {/* Responsive Language Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group shadow-xs ${
                  isSelected
                    ? 'bg-white border-[#0D5C4D] ring-4 ring-[#0D5C4D]/10'
                    : 'bg-white hover:bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getLanguageVisualIcon(lang.code)}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-[#07382E] leading-snug">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {lang.englishName}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-[#0D5C4D] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Continue Button */}
      <div className="pt-6 pb-2">
        <button
          onClick={handleContinue}
          disabled={isSaving}
          className="w-full py-4 px-6 bg-[#0D5C4D] hover:bg-[#09463A] active:scale-[0.99] disabled:opacity-70 text-white font-semibold rounded-2xl text-base shadow-lg shadow-[#0D5C4D]/25 transition-all flex items-center justify-center gap-2"
        >
          <span>{isSaving ? 'Saving...' : 'Continue'}</span>
        </button>

        <div className="pt-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Instant voice & script adaptation across North East India
          </span>
        </div>
      </div>
    </div>
  );
};
