import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Globe, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption, languageCodeToName } from '../i18n';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  onLanguageChanged?: (code: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  patientId = DEMO_PATIENT_ID,
  onLanguageChanged,
}) => {
  const { i18n, t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const currentLang = i18n.language || 'en';

  if (!isOpen) return null;

  const handleSelectLanguage = async (lang: LanguageOption) => {
    // 1. Immediately change language in i18next instance (instant zero-reload UI re-render)
    await i18n.changeLanguage(lang.code);
    onLanguageChanged?.(lang.code);

    // 2. Persist to patient record in database asynchronously
    setIsSaving(true);
    try {
      const preferredLanguage = languageCodeToName(lang.code);
      await fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage }),
      });
    } catch (err) {
      console.warn('[LanguageSelector] Could not persist preferredLanguage to backend:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F3] text-[#0D5C4D] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {t('select_language', 'Choose Language')}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('select_language_sub', 'Select your preferred language')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Options List */}
        <div className="space-y-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#EAF6F3] border-[#0D5C4D] shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Short badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isSelected
                        ? 'bg-[#0D5C4D] text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    {lang.shortLabel}
                  </div>

                  {/* Native + English Labels */}
                  <div className="flex flex-col">
                    <span
                      className={`text-base font-bold leading-tight ${
                        isSelected ? 'text-[#0D5C4D]' : 'text-slate-900'
                      }`}
                    >
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                      {lang.englishName}
                    </span>
                  </div>
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#0D5C4D] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-1 text-center">
          <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t('modal_footer_note', 'Instant voice and script adaptation across NER languages')}
          </span>
        </div>
      </div>
    </div>
  );
};
