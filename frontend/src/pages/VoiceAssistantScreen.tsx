import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Heart,
  RefreshCw,
  HelpCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Radio,
  Keyboard,
  Info
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';

interface PresetPrompt {
  id: string;
  lang: string;
  query: string;
  category: 'family' | 'routine' | 'cultural' | 'time';
}

const PRESET_PROMPTS: PresetPrompt[] = [
  // English
  { id: 'en_1', lang: 'en', query: 'Who is my daughter?', category: 'family' },
  { id: 'en_2', lang: 'en', query: 'What are my reminders for today?', category: 'routine' },
  { id: 'en_3', lang: 'en', query: 'Tell me about our Bihu festival memory', category: 'cultural' },
  { id: 'en_4', lang: 'en', query: 'What time and date is it now?', category: 'time' },

  // Hindi (हिन्दी)
  { id: 'hi_1', lang: 'hi', query: 'मेरी बेटी प्रिया कहाँ है?', category: 'family' },
  { id: 'hi_2', lang: 'hi', query: 'मेरा बेटा कौन है?', category: 'family' },
  { id: 'hi_3', lang: 'hi', query: 'आज मेरी कौन सी दवाई बाकी है?', category: 'routine' },
  { id: 'hi_4', lang: 'hi', query: 'आज कौन सा दिन और समय है?', category: 'time' },

  // Assamese (অসমীয়া)
  { id: 'as_1', lang: 'as', query: 'মোৰ ছোৱালী প্ৰিয়া ক’ত আছে?', category: 'family' },
  { id: 'as_2', lang: 'as', query: 'মোৰ ল’ৰা অৰুণ কোন?', category: 'family' },
  { id: 'as_3', lang: 'as', query: 'আজিৰ ঔষধ আৰু দিনচৰ্যা কি?', category: 'routine' },
  { id: 'as_4', lang: 'as', query: 'আজি কি বাৰ আৰু সময় কিমান?', category: 'time' },

  // Nepali (नेपाली)
  { id: 'ne_1', lang: 'ne', query: 'मेरो छोरी प्रिया कहाँ छिन्?', category: 'family' },
  { id: 'ne_2', lang: 'ne', query: 'मेरो छोरा अरुण को हो?', category: 'family' },
  { id: 'ne_3', lang: 'ne', query: 'मेरो औषधि कहिले खाने?', category: 'routine' },
  { id: 'ne_4', lang: 'ne', query: 'आज कुन दिन हो र कति बज्यो?', category: 'time' },

  // Khasi (खासी)
  { id: 'kha_1', lang: 'kha', query: 'Ka kot khubor bad ki dawai?', category: 'routine' },
  { id: 'kha_2', lang: 'kha', query: 'Kumno ka khun kynthei jong nga, i Priya?', category: 'family' },
  { id: 'kha_3', lang: 'kha', query: 'Uei u khun shynrang jong nga, u Arun?', category: 'family' },
  { id: 'kha_4', lang: 'kha', query: 'Kaei ka por bad ka tarik mynta?', category: 'time' },

  // Mizo (Mizo)
  { id: 'miz_1', lang: 'miz', query: 'Ka damdawi ei hun a thleng tawh em?', category: 'routine' },
  { id: 'miz_2', lang: 'miz', query: 'Ka fanu Priya chu khawiah nge a awm?', category: 'family' },
  { id: 'miz_3', lang: 'miz', query: 'Ka fapa Arun chu tunge a nih?', category: 'family' },
  { id: 'miz_4', lang: 'miz', query: 'Vawiin hi eng ni nge, eng zat nge ri tawh?', category: 'time' },
];

export const VoiceAssistantScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);

  const currentLangCode = i18n.language || 'en';

  // Check if speech recognition is realistically supported by browser engines for this language
  const isMicSupportedForLang = (langCode: string): boolean => {
    // Chrome / Chromium Web Speech Recognition does NOT have models for Khasi or Mizo
    if (langCode === 'kha' || langCode === 'miz') {
      return false;
    }
    return true;
  };

  // Candidate BCP-47 language codes for speech recognition and synthesis per language
  const getSpeechLangCandidates = (code: string): string[] => {
    switch (code) {
      case 'hi':
        return ['hi-IN', 'hi'];
      case 'as':
        return ['as-IN', 'as', 'bn-IN'];
      case 'ne':
        return ['ne-NP', 'ne-IN', 'ne'];
      case 'kha':
        return ['kha-IN', 'kha'];
      case 'miz':
        return ['lus-IN', 'lus', 'miz-IN', 'miz'];
      case 'en':
      default:
        return ['en-IN', 'en-GB', 'en-US', 'en'];
    }
  };

  // Find matching voice from browser speech synthesis
  const findMatchingVoice = (langCode: string): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const candidates = getSpeechLangCandidates(langCode);

    for (const cand of candidates) {
      const candLower = cand.toLowerCase();
      const matched = voices.find((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        return vLang === candLower || vLang.startsWith(candLower);
      });
      if (matched) return matched;
    }
    return null;
  };

  // Play gentle sound feedback using Web Audio API
  const playChime = useCallback((type: 'start' | 'reply' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'reply') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Ignore audio chime errors
    }
  }, []);

  // Stop mic stream visualizer
  const stopAudioVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Start microphone level visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch (err) {
      console.warn('[VoiceAssistant] Audio visualizer stream unavailable:', err);
    }
  };

  // Speak Answer Aloud via SpeechSynthesis with explicit language voice verification
  const speakAnswer = useCallback((textToSpeak: string, langOverride?: string) => {
    const targetLang = langOverride || currentLangCode;

    if (!('speechSynthesis' in window)) {
      setTtsNotice('Speech synthesis is not supported in this browser.');
      setState('idle');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const matchedVoice = findMatchingVoice(targetLang);

      if (matchedVoice) {
        setTtsNotice(null);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setState('speaking');
          playChime('reply');
        };

        utterance.onend = () => {
          setState('idle');
        };

        utterance.onerror = (e) => {
          console.warn('[VoiceAssistant] Speech synthesis ended/interrupted:', e);
          setState('idle');
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // No matching voice for this language: Stay silent on audio, do not play English speech!
        const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
        const langName = langObj ? langObj.nativeName : targetLang;
        setTtsNotice(`Voice audio is not supported in browser for ${langName} (${langObj?.englishName || ''}). Displaying full text response.`);
        playChime('reply');
        setState('idle');
      }
    } catch (err) {
      console.error('[VoiceAssistant] Speech synthesis error:', err);
      setState('idle');
    }
  }, [currentLangCode, playChime]);

  // Comprehensive Fuzzy / Intent Matcher for Elder Voice Queries
  const matchQueryIntent = (queryText: string): string => {
    const q = queryText.toLowerCase().trim();

    // 1. Daughter / Priya
    const daughterTokens = ['daughter', 'beti', 'priya', 'chowali', 'ছোৱালী', 'প্ৰিয়া', 'প্ৰিয়া', 'छोरी', 'khun kynthei', 'fanu', 'fa nu'];
    if (daughterTokens.some((tok) => q.includes(tok))) {
      return 'daughter';
    }

    // 2. Son / Arun
    const sonTokens = ['son', 'beta', 'arun', 'lora', 'পুতেক', 'ল’ৰা', 'লৰা', 'অৰুণ', 'छोरा', 'khun shynrang', 'fapa', 'fa pa'];
    if (sonTokens.some((tok) => q.includes(tok))) {
      return 'son';
    }

    // 3. Grandson / Rohan / Kaziranga
    const grandsonTokens = ['grandson', 'pota', 'rohan', 'নাতি', 'ৰোহন', 'कजिरंगा', 'काजीरंगा', 'काजिरंगा', 'ksiew', 'khun ksiew', 'tu fapa'];
    if (grandsonTokens.some((tok) => q.includes(tok))) {
      return 'grandson';
    }

    // 4. Husband / Dr. Ramesh / Shillong
    const husbandTokens = ['husband', 'pati', 'ramesh', 'swami', 'গিৰিয়েক', 'স্বামী', 'ৰমেশ', 'श्रीमान', 'shillong', 'tnga', 'pasal'];
    if (husbandTokens.some((tok) => q.includes(tok))) {
      return 'husband';
    }

    // 5. Medication / Routine / Schedule
    const routineTokens = ['medicine', 'medication', 'dawai', 'pill', 'reminder', 'routine', 'schedule', 'breakfast', 'ঔষধ', 'দৰব', 'দিনচৰ্যা', 'औषधि', 'खाना', 'kot khubor', 'ja step', 'damdawi', 'ei hun', 'tukthuan'];
    if (routineTokens.some((tok) => q.includes(tok))) {
      return 'medication_routine';
    }

    // 6. Time / Date / Clock
    const timeTokens = ['time', 'date', 'day', 'clock', 'today', 'samay', 'tarikh', 'समय', 'दिन', 'तारीख', 'कितने बजे', 'আজি', 'কি বাৰ', 'কিমান বাজিছে', 'कति बज्यो', 'por', 'tarik', 'mynta', 'vawiin', 'dar', 'eng ni'];
    if (timeTokens.some((tok) => q.includes(tok))) {
      return 'time_date';
    }

    // 7. Cultural / Bihu Festival
    const bihuTokens = ['bihu', 'festival', 'celebration', 'dance', 'rongali', 'tezpur', 'pitha', 'बिहू', 'त्योहार', 'उत्सव', 'ৰঙালী', 'পেঁপা', 'ঢোল', 'चाड', 'lehniam', 'kut'];
    if (bihuTokens.some((tok) => q.includes(tok))) {
      return 'cultural_bihu';
    }

    // 8. Location / Where am I / Home Safety
    const locationTokens = ['where', 'kahan', 'home', 'ghar', 'safe', 'lost', 'कहाँ', 'घर', 'सुरक्षित', 'ক’ত', 'কত', 'সুৰক্ষিত', 'hangno', 'iing', 'khawiah', 'thlamuang'];
    if (locationTokens.some((tok) => q.includes(tok))) {
      return 'location_safety';
    }

    // 9. Greetings & Welcome
    const greetingTokens = ['hello', 'hi', 'namaste', 'morning', 'evening', 'help', 'नमस्ते', 'प्रणाम', 'নমস্কাৰ', 'khublei', 'chibai'];
    if (greetingTokens.some((tok) => q.includes(tok))) {
      return 'greeting';
    }

    return 'unknown';
  };

  // Answer query intelligently using contextual knowledge in all 6 supported languages
  const generateKnowledgeAnswer = async (queryText: string, langCodeOverride?: string): Promise<string> => {
    const lang = langCodeOverride || currentLangCode;
    const intent = matchQueryIntent(queryText);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dayStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    switch (intent) {
      case 'daughter':
        switch (lang) {
          case 'hi':
            return 'आपकी प्यारी बेटी का नाम प्रिया शर्मा है। उन्होंने गुवाहाटी विश्वविद्यालय से स्नातक किया है और वह अक्सर आपसे मिलने आती हैं।';
          case 'as':
            return 'আপোনাৰ মৰমৰ ছোৱালীজনীৰ নাম প্ৰিয়া শৰ্মা। তেওঁ সদায় আপোনাৰ খবৰ লয় আৰু আপোনাৰ লগত আছে।';
          case 'ne':
            return 'तपाईंको प्यारी छोरीको नाम प्रिया शर्मा हो। उनले गुवाहाटी विश्वविद्यालयबाट स्नातक गरेकी छिन् र उनी प्रायः तपाईंलाई भेट्न आउँछिन्।';
          case 'kha':
            return 'Ka khun kynthei jong phi dei i Priya Sharma. I la pyndep ia ka jingpule na Gauhati University bad i wan jurip barabor ia phi da ka jingieit.';
          case 'miz':
            return 'I fanu duhtak chu Priya Sharma a ni. Gauhati University-ah lehkha a zir zo a, zing tin i kiangah hlim takin a awm thin.';
          case 'en':
          default:
            return 'Your daughter is Priya Sharma. She graduated from Gauhati University and loves spending peaceful mornings with you.';
        }

      case 'son':
        switch (lang) {
          case 'hi':
            return 'आपके बेटे का नाम अरुण शर्मा है। वह हर शाम आपसे मिलने आते हैं और आपके साथ गर्मागर्म असम चाय पीते हैं।';
          case 'as':
            return 'আপোনাৰ ল’ৰাজনৰ নাম অৰুণ শৰ্মা। তেওঁ সন্ধিয়া আপোনাক চাবলৈ আহে আৰু আপোনাৰ লগত চাহ খায়।';
          case 'ne':
            return 'तपाईंको छोराको नाम अरुण शर्मा हो। उहाँ हरेक साँझ तपाईंलाई भेट्न आउनुहुन्छ र चिया सँगै पिउनुहुन्छ।';
          case 'kha':
            return 'U khun shynrang jong phi dei u Arun Sharma. U wan sha phi man la ka janmiet ban dih sha ryngkat bad phi.';
          case 'miz':
            return 'I fapa chu Arun Sharma a ni. Tlai tin a rawn tlawh thin che a, thingpui in dun a nuam ti em em thin.';
          case 'en':
          default:
            return 'Your son is Arun Sharma. He visits you in the evenings and enjoys having fresh tea with you.';
        }

      case 'grandson':
        switch (lang) {
          case 'hi':
            return 'आपके पोते का नाम रोहन है। उसने आपके साथ काजीरंगा राष्ट्रीय उद्यान में गैंडे देखे थे और वह आपको बहुत प्यार करता है।';
          case 'as':
            return 'আপোনাৰ নাতিৰ নাম ৰোহন। সি কাজিৰঙাত আপোনাৰ লগত এশিঙীয়া গঁড় চাইছিল আৰু আপোনাক বহুত ভাল পায়।';
          case 'ne':
            return 'तपाईंको नातिको नाम रोहन हो। उसले तपाईंसँग काजिरंगा राष्ट्रिय निकुञ्ज घुमेको थियो र तपाईंलाई धेरै माया गर्छ।';
          case 'kha':
            return 'U khun ksiew jong phi dei u Rohan. U la leit jurip ia ka Kaziranga ryngkat bad phi bad u ieit shikatdei ia phi.';
          case 'miz':
            return 'I tu fapa chu Rohan a ni. Kaziranga Park-ah in kal dun tawh a, a ngaina em em che a ni.';
          case 'en':
          default:
            return 'Your grandson is Rohan Sharma. He visited Kaziranga Park with you and loves holding your hand.';
        }

      case 'husband':
        switch (lang) {
          case 'hi':
            return 'आपके पति डॉ. रमेश शर्मा हैं। आप दोनों ने 1978 में शिलॉन्ग की खूबसूरत वादियों और वार्ड लेक में अपनी सुहानी यादें बनाई थीं।';
          case 'as':
            return 'আপোনাৰ স্বামী ড° ৰমেশ শৰ্মা। ১৯৭৮ চনত ছিলঙৰ ৱাৰ্ডছ লেকত আপোনালোকে সুন্দৰ স্মৃতি কটাইছিল।';
          case 'ne':
            return 'तपाईंको श्रीमान डा. रमेश शर्मा हुनुहुन्छ। तपाईंहरूले सन् १९७८ मा शिलोङको वार्ड लेकमा सुन्दर सम्झनाहरू बनाउनुभएको थियो।';
          case 'kha':
            return 'U tnga jong phi dei u Dr. Ramesh Sharma. Phi la pynlut ia ki por ba kordor ha Shillong hajan Ward\'s Lake ha u snem 1978.';
          case 'miz':
            return 'I pasal chu Dr. Ramesh Sharma a ni. Kum 1978 khan Shillong Ward Lake kamah hun hlimawm tak in hmang dun tawh a ni.';
          case 'en':
          default:
            return 'Your husband is Dr. Ramesh Sharma. You shared wonderful memories in Shillong by Ward Lake in 1978.';
        }

      case 'medication_routine':
        switch (lang) {
          case 'hi':
            return 'आज की दिनचर्या: सुबह का नाश्ता और दवा पूरी हो चुकी है। अगली दवा दोपहर के भोजन के बाद 1:00 बजे है।';
          case 'as':
            return 'আপোনাৰ ৰাতিপুৱাৰ ঔষধ লোৱা হ’ল। দুপৰীয়া ১:০০ বজাত আহাৰৰ পিছত পৰৱৰ্তী ঔষধ আছে।';
          case 'ne':
            return 'बिहानको औषधि र खाना पूरा भइसक्यो। तपाईंको अर्को औषधि दिउँसो १:०० बजे आराम गरेपछि छ।';
          case 'kha':
            return 'Ki dawai step bad ka ja step la dep lut. Ka por ban shongthait bad ban dih dawai kaba bud dei ha ka por 1:00 baje nohphai sngi.';
          case 'miz':
            return 'Zing damdawi leh tukthuan in ei zo tawh e. Chhun chawlh hahdam leh damdawi ei leh hun chu chhun dar 1:00 PM a ni e.';
          case 'en':
          default:
            return 'Morning medication and breakfast are completed. Your next routine is afternoon rest and medication at 1:00 PM.';
        }

      case 'time_date':
        switch (lang) {
          case 'hi':
            return `आज ${dayStr} है और अभी समय ${timeStr} हुआ है। आपका दिन शुभ और सुखद रहे!`;
          case 'as':
            return `আজি ${dayStr} আৰু এতিয়া সময় ${timeStr}। দিনটো অতি শান্ত আৰু আনন্দদায়ক হওক!`;
          case 'ne':
            return `आज ${dayStr} हो र अहिले समय ${timeStr} भएको छ। तपाईंको दिन सुखद र शान्त रहोस्!`;
          case 'kha':
            return `Mynta ka sngi dei ${dayStr}, bad ka por mynta dei ${timeStr}. Long kaba suk bad kaba kmen!`;
          case 'miz':
            return `Vawiin hi ${dayStr} a ni a, tunah hian dar ${timeStr} a ni. Ni hlimawm leh thlamuanthlak tak hmang ang che!`;
          case 'en':
          default:
            return `Today is ${dayStr}, and the current time is ${timeStr}. Have a calm and peaceful day!`;
        }

      case 'cultural_bihu':
        switch (lang) {
          case 'hi':
            return 'रोंगाली बिहू असम का प्रसिद्ध और खुशियों भरा त्योहार है। आपके पारिवारिक आँगन में सबने पारंपरिक मुगा पोशाक में बिहू नृत्य किया था।';
          case 'as':
            return 'ৰঙালী বিহু বসন্তৰ আনন্দমুখৰ উৎসৱ। ঢোল, পেঁপা আৰু পিঠা-পনাৰে তেজপুৰৰ পৰিয়ালৰ লগত আপুনি আনন্দ কৰিছিল।';
          case 'ne':
            return 'रोंगाली बिहु वसन्त ऋतुको रमाइलो उत्सव हो। परिवारसँग ढोल, पेपा र मिठो पिठा खाएर मनाइएको सम्झना छ।';
          case 'kha':
            return 'Ka Rongali Bihu dei ka lehniam pyrem kaba dap da ka jingkmen bad ka shad tynrai ryngkat ki kynja pitha ba thiang.';
          case 'miz':
            return 'Rongali Bihu chu thal lai kut ropui tak a ni a, chhungkua leh thiante nen rimawi leh thil tuihnai nen in lawm thin a ni.';
          case 'en':
          default:
            return 'Rongali Bihu is a joyful spring festival celebrated with dhol, pepa, and delicious pitha with your beloved family in Tezpur.';
        }

      case 'location_safety':
        switch (lang) {
          case 'hi':
            return 'आप अपने प्यारे और सुरक्षित घर पर हैं। आपका परिवार और स्मृतिसेतु हमेशा आपकी देखभाल के लिए यहाँ हैं।';
          case 'as':
            return 'আপুনি নিজৰ ঘৰত সম্পূৰ্ণ সুৰক্ষিত হৈ আছে। আপোনাৰ পৰিয়াল আৰু স্মৃতিসেতু আপোনাৰ কাষতেই আছে।';
          case 'ne':
            return 'तपाईं आफ्नो घरमा पूर्ण सुरक्षित हुनुहुन्छ। तपाईंको परिवार र स्मृतिसेतु सधैं तपाईंको साथमा छन्।';
          case 'kha':
            return 'Phi don ha la iing kaba shngain bad kaba suk. Ka iing ka sem bad ka SmritiSetu ki don ryngkat bad phi.';
          case 'miz':
            return 'I in ngeiah thlamuang takin i awm e. I chhungte leh SmritiSetu chu i kiangah an awm reng e.';
          case 'en':
          default:
            return 'You are safe in your comfortable home. Your family and SmritiSetu are always right beside you.';
        }

      case 'greeting':
        switch (lang) {
          case 'hi':
            return 'नमस्ते! मैं आपका स्मृतिसेतु आवाज़ साथी हूँ। आप परिवार, यादों, या अपनी दैनिक दवाइयों के बारे में कुछ भी पूछ सकते हैं।';
          case 'as':
            return 'নমস্কাৰ! মই আপোনাৰ স্মৃতিসেতু ভইচ সংগী। আপোনাৰ পৰিয়াল, স্মৃতি বা ঔষধৰ বিষয়ে যিকোনো কথা সুধিব পাৰে।';
          case 'ne':
            return 'नमस्ते! म तपाईंको स्मृतिसेतु आवाज साथी हुँ। तपाईं परिवार, सम्झना वा दिनचर्या बारे सोध्न सक्नुहुन्छ।';
          case 'kha':
            return 'Khublei! Nga dei u paralok SmritiSetu jong phi. Phi lah ban kylli shaphang ka iing ka sem, ki dawai lane ki jingkynmaw.';
          case 'miz':
            return 'Chibai! SmritiSetu aw puih tu che ka ni e. I chhungte, damdawi leh hun hman dan chungchang min zawt thei reng e.';
          case 'en':
          default:
            return 'Hello! I am your SmritiSetu companion. Feel free to ask about your family, cherished memories, or daily reminders.';
        }

      case 'unknown':
      default:
        // Gentle, respectful fallback when query is not matched with confidence
        switch (lang) {
          case 'hi':
            return 'मुझे आपकी बात पूरी तरह समझ नहीं आई। क्या आप दोबारा बोलेंगे, नीचे दिए गए सुझावों में से चुनेंगे, या लिखकर पूछेंगे?';
          case 'as':
            return 'মই কথাষাৰ ঠিককৈ বুজি নাপালোঁ। অনুগ্ৰহ কৰি আকৌ কওক, তলৰ প্ৰশ্ন বাছক, বা লিখি সুধক।';
          case 'ne':
            return 'मैले तपाईंको कुरा स्पष्ट बुझ्न सकिनँ। कृपया फेरि भन्नुहोस्, तलको सुझाव छान्नुहोस्, वा लेखेर सोध्नुहोस्।';
          case 'kha':
            return 'Nga khlem da sngewthuh bha. Sngewbha kylli biang, jied na ki jingkylli harum, lane thoh ia ka jingkylli.';
          case 'miz':
            return 'Ka lo hre chiang lova, khawngaihin han sawi tha leh la, a hnuai a zawhna awm sa te hi thlang la, a nih loh pawhin type rawh le.';
          case 'en':
          default:
            return "I didn't quite catch that. Could you please try again, choose a suggested question below, or type your question?";
        }
    }
  };

  // Process a question
  const processQuery = async (queryText: string, langCodeOverride?: string) => {
    if (!queryText.trim()) return;
    const targetLang = langCodeOverride || currentLangCode;

    setTranscript(queryText);
    setInterimText('');
    setState('thinking');
    setErrorMessage(null);

    // Stop listening if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioVisualizer();

    try {
      const answer = await generateKnowledgeAnswer(queryText, targetLang);
      setAssistantResponse(answer);
      speakAnswer(answer, targetLang);
    } catch (err: any) {
      const fallback = `I heard "${queryText}". You are safe at home and your family is here with you.`;
      setAssistantResponse(fallback);
      speakAnswer(fallback, targetLang);
    }
  };

  // Switch Language Pill and re-evaluate active question if present
  const handleLanguageSelect = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setTtsNotice(null);
    setErrorMessage(null);

    // If currently listening when user switches language, stop listening cleanly
    if (state === 'listening') {
      stopListening();
    }

    // If there is an active question being displayed, regenerate answer in new language
    if (transcript) {
      processQuery(transcript, langCode);
    }
  };

  // Start Speech Recognition upon explicit user tap
  const startListening = () => {
    setErrorMessage(null);
    setAssistantResponse(null);
    setTranscript('');
    setInterimText('');
    setTtsNotice(null);

    // Verify if speech recognition is supported for this language
    if (!isMicSupportedForLang(currentLangCode)) {
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode);
      const langName = langObj ? langObj.nativeName : currentLangCode;
      setErrorMessage(
        `Speech recognition is not available in browser engines for ${langName}. Please tap a suggested question below or type your question.`
      );
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
      playChime('error');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. You can type or tap any question below to hear the voice response.'
      );
      playChime('error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const speechCandidates = getSpeechLangCandidates(currentLangCode);
      recognition.lang = speechCandidates[0] || 'en-IN';

      recognition.onstart = () => {
        setState('listening');
        playChime('start');
        startAudioVisualizer();
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          processQuery(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceAssistant] Recognition error:', event.error);
        stopAudioVisualizer();
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage(
            'Microphone permission was blocked. Please allow microphone access in your browser or type your question below.'
          );
        } else if (event.error === 'no-speech') {
          setState('idle');
        } else if (event.error === 'language-not-supported') {
          const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode);
          setErrorMessage(`Browser does not support voice recognition for ${langObj?.nativeName || currentLangCode}. Please type your question below.`);
          setState('idle');
        } else {
          setState('idle');
        }
      };

      recognition.onend = () => {
        stopAudioVisualizer();
        if (state === 'listening') {
          setState('idle');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('[VoiceAssistant] Could not start speech recognition:', err);
      setErrorMessage('Could not activate microphone. You can type your question below.');
      setState('idle');
      playChime('error');
    }
  };

  // Stop listening manually
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioVisualizer();

    if (interimText || transcript) {
      processQuery(interimText || transcript);
    } else {
      setState('idle');
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState('idle');
  };

  // Submit via text input
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput('');
    processQuery(text);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      stopAudioVisualizer();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioVisualizer]);

  // Filter suggested prompts for active language
  const activePresets = PRESET_PROMPTS.filter((p) => p.lang === currentLangCode).length > 0
    ? PRESET_PROMPTS.filter((p) => p.lang === currentLangCode)
    : PRESET_PROMPTS.filter((p) => p.lang === 'en');

  // Input placeholder per language
  const getInputPlaceholder = () => {
    switch (currentLangCode) {
      case 'hi':
        return 'या कोई प्रश्न लिखें (जैसे: मेरी बेटी प्रिया कहाँ है?)';
      case 'as':
        return 'বা কোনো প্ৰশ্ন লিখক (যেনে: মোৰ ছোৱালী প্ৰিয়া ক’ত আছে?)';
      case 'ne':
        return 'वा कुनै प्रश्न लेख्नुहोस् (जस्तै: मेरो छोरी प्रिया कहाँ छिन्?)';
      case 'kha':
        return 'Lane thoh ia ka jingkylli (nuksa: Ka kot khubor bad ki dawai?)';
      case 'miz':
        return 'Zawhna type rawh (nuksa: Ka damdawi ei hun a thleng tawh em?)';
      case 'en':
      default:
        return 'Or type any question (e.g. Who is my daughter?)';
    }
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];
  const micAvailable = isMicSupportedForLang(currentLangCode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#062c24] via-[#07382E] to-[#041c17] text-white flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 max-w-4xl w-full mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 shadow-sm"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-teal-200">
            SmritiSetu Voice Companion
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
            {activeLangObj.nativeName}
          </span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Center Stage */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto space-y-6 z-10 py-4 max-w-2xl w-full mx-auto">
        
        {/* Status Header */}
        <div className="space-y-1.5 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {state === 'listening'
              ? 'Listening to you…'
              : state === 'thinking'
              ? 'Searching memories…'
              : state === 'speaking'
              ? 'Speaking response aloud 🔊'
              : !micAvailable
              ? `Select a question in ${activeLangObj.nativeName}`
              : 'Tap microphone to speak'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 max-w-md mx-auto">
            {state === 'listening'
              ? `Listening in ${activeLangObj.nativeName} (${activeLangObj.englishName})`
              : state === 'speaking'
              ? `Speaking in ${activeLangObj.nativeName}`
              : !micAvailable
              ? `Speech recognition is not available for ${activeLangObj.nativeName}. Use suggested questions or type below.`
              : `Speak naturally in ${activeLangObj.nativeName} anytime`}
          </p>
        </div>

        {/* Dynamic Waveform & Mic Core */}
        <div className="relative flex items-center justify-center my-4">
          {/* Animated concentric rings during listening/speaking */}
          {state === 'listening' && (
            <>
              <div
                className="absolute rounded-full border-2 border-emerald-400/30 transition-all duration-150 animate-ping"
                style={{
                  width: `${140 + audioLevel * 1.5}px`,
                  height: `${140 + audioLevel * 1.5}px`,
                }}
              />
              <div
                className="absolute rounded-full bg-emerald-500/20 transition-all duration-100"
                style={{
                  width: `${120 + audioLevel * 1.2}px`,
                  height: `${120 + audioLevel * 1.2}px`,
                }}
              />
            </>
          )}

          {state === 'speaking' && (
            <div className="absolute w-44 h-44 rounded-full border border-teal-300/40 animate-pulse" />
          )}

          {/* Central Pulsing Mic Button or Type/Tap Fallback Button */}
          {micAvailable ? (
            <button
              type="button"
              onClick={
                state === 'listening'
                  ? stopListening
                  : state === 'speaking'
                  ? stopSpeaking
                  : startListening
              }
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${
                state === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white scale-110 ring-8 ring-emerald-500/30 shadow-emerald-500/50'
                  : state === 'speaking'
                  ? 'bg-teal-600 text-white animate-pulse ring-8 ring-teal-400/30'
                  : 'bg-white/15 hover:bg-white/25 text-white hover:scale-105 border border-white/20'
              }`}
              title={
                state === 'listening'
                  ? 'Tap to stop listening'
                  : state === 'speaking'
                  ? 'Tap to stop speaking'
                  : `Tap to start speaking in ${activeLangObj.nativeName}`
              }
            >
              {state === 'listening' ? (
                <Mic className="w-12 h-12 text-white animate-bounce" />
              ) : state === 'speaking' ? (
                <Volume2 className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <Mic className="w-12 h-12 text-teal-200" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (textInputRef.current) {
                  textInputRef.current.focus();
                }
              }}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 bg-white/10 hover:bg-white/20 text-white border-2 border-dashed border-teal-300/40"
              title={`Speech recognition is not available for ${activeLangObj.nativeName}. Tap to type.`}
            >
              <Keyboard className="w-10 h-10 text-teal-300" />
              <span className="text-[10px] text-teal-200 font-bold mt-1 tracking-tight">Tap to Type</span>
            </button>
          )}
        </div>

        {/* Live Transcript / Response Display Box */}
        <div className="w-full max-w-lg bg-black/30 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-xl text-center space-y-3 min-h-[90px] flex flex-col justify-center">
          {errorMessage ? (
            <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : interimText ? (
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Listening in real-time…
              </span>
              <p className="text-base sm:text-lg text-emerald-300 font-medium italic animate-pulse">
                "{interimText}…"
              </p>
            </div>
          ) : transcript && !assistantResponse ? (
            <p className="text-base sm:text-lg text-teal-100 font-medium">
              "{transcript}"
            </p>
          ) : assistantResponse ? (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-teal-300/80 uppercase tracking-wider block">
                Answer for "{transcript || 'Question'}"
              </span>
              <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                {assistantResponse}
              </p>

              {/* TTS Notice if audio voice is not supported in browser for active language */}
              {ttsNotice ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/30 text-[11px] font-semibold mt-1">
                  <VolumeX className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{ttsNotice}</span>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakAnswer(assistantResponse)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold text-teal-200 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Again 🔊</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-teal-200/60">
              {micAvailable
                ? `Tap the microphone or choose a suggested question in ${activeLangObj.nativeName} to start.`
                : `Choose a suggested question in ${activeLangObj.nativeName} below or type in the box.`}
            </p>
          )}
        </div>

        {/* Text Input / Speak Bar (Ensures typing works even without microphone permission) */}
        <form
          onSubmit={handleTextSubmit}
          className="w-full max-w-lg flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/15 focus-within:border-emerald-400 transition-all"
        >
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={getInputPlaceholder()}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-teal-200/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold transition-all shadow-sm shrink-0"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Suggested Quick Prompt Cards */}
        <div className="w-full max-w-lg space-y-2 pt-1">
          <span className="text-[11px] font-bold text-teal-300/70 uppercase tracking-wider block">
            Suggested Questions ({activeLangObj.nativeName}):
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => processQuery(preset.query)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-teal-100 hover:text-white transition-all shadow-xs hover:scale-[1.02] active:scale-98 text-left"
              >
                "{preset.query}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Language Switch Chips at Bottom */}
      <div className="pt-3 pb-2 z-10 max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-center flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = (i18n.language || 'en') === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white text-[#07382E] shadow-md scale-105 ring-2 ring-emerald-400'
                    : 'bg-white/10 hover:bg-white/20 text-teal-200 border border-white/10'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantScreen;
