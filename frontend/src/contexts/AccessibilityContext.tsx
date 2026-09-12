import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface AccessibilityContextType {
  easyMode: boolean;
  voiceGuidance: boolean;
  setEasyMode: (val: boolean) => void;
  setVoiceGuidance: (val: boolean) => void;
  toggleEasyMode: () => void;
  toggleVoiceGuidance: () => void;
  isSpeaking: boolean;
  speakText: (text: string, customLang?: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  // Load Easy Mode from localStorage (defaults to false)
  const [easyMode, setEasyModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('smriti_easy_mode');
    return saved === 'true';
  });

  // Load Voice Guidance from localStorage (defaults to true for cognitive care)
  const [voiceGuidance, setVoiceGuidanceState] = useState<boolean>(() => {
    const saved = localStorage.getItem('smriti_voice_guidance');
    return saved !== 'false';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Apply Easy Mode class to document root
  useEffect(() => {
    if (easyMode) {
      document.documentElement.classList.add('easy-mode');
      document.body.classList.add('easy-mode');
    } else {
      document.documentElement.classList.remove('easy-mode');
      document.body.classList.remove('easy-mode');
    }
  }, [easyMode]);

  const setEasyMode = (val: boolean) => {
    setEasyModeState(val);
    localStorage.setItem('smriti_easy_mode', val ? 'true' : 'false');
    if (val && voiceGuidance) {
      speakText('Easy mode is now enabled. Text size and contrast have been increased.');
    }
  };

  const setVoiceGuidance = (val: boolean) => {
    setVoiceGuidanceState(val);
    localStorage.setItem('smriti_voice_guidance', val ? 'true' : 'false');
    if (val) {
      speakText('Voice guidance is now turned on. Screen instructions will be read aloud.');
    } else {
      stopSpeaking();
    }
  };

  const toggleEasyMode = () => setEasyMode(!easyMode);
  const toggleVoiceGuidance = () => setVoiceGuidance(!voiceGuidance);

  // Stop current speech synthesis
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speak text aloud
  const speakText = useCallback(
    (text: string, customLang?: string) => {
      if (!('speechSynthesis' in window)) {
        console.warn('[Accessibility] Speech synthesis is not supported on this browser.');
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const lang = customLang || i18n.language || 'en';
        let speechLang = 'en-IN';
        if (lang === 'hi') speechLang = 'hi-IN';
        else if (lang === 'as') speechLang = 'as-IN';
        else if (lang === 'ne') speechLang = 'ne-NP';

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = easyMode ? 0.85 : 0.92; // Slightly calmer pace in easy mode
        utterance.pitch = 1.0;
        utterance.lang = speechLang;

        // Try to match best voice
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice =
          voices.find((v) => v.lang === speechLang) ||
          voices.find((v) => v.lang.startsWith(lang)) ||
          voices.find((v) => v.lang === 'hi-IN') ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (err) => {
          console.warn('[Accessibility] Speech synthesis error:', err);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[Accessibility] speakText failed:', err);
        setIsSpeaking(false);
      }
    },
    [i18n.language, easyMode]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        easyMode,
        voiceGuidance,
        setEasyMode,
        setVoiceGuidance,
        toggleEasyMode,
        toggleVoiceGuidance,
        isSpeaking,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
