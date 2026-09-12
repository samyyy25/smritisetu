import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  XCircle,
  Zap,
  Eye,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  FileText,
  MessageSquare,
  Keyboard,
  Brain,
  HelpCircle,
  Check
} from 'lucide-react';
import { MobileContainer } from '../../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../../components/design-system/BottomNavBar';
import { VoiceWaveform } from '../../components/design-system/VoiceWaveform';
import { AdaptiveDifficultyNotice } from '../../components/AdaptiveDifficultyNotice';
import { getAdaptiveDifficulty, DifficultyLevel } from '../../utils/adaptiveDifficulty';
import { saveGameSession } from '../../utils/gameSessionSync';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface MemoryPrompt {
  id: string;
  photoUrl: string;
  videoUrl?: string;
  mediaType?: 'photo' | 'video';
  personName: string;
  relationship: string;
  place: string;
  year: string;
  description: string;
  sampleSpokenText: string;
  followUpQuestion: string;
  correctAnswer: string;
  options: string[];
}

type Step = 'recording' | 'ai_summary' | 'follow_up' | 'saving' | 'results';

// ─────────────────────────────────────────────────────────────────────────────
// Default / Fallback Cultural Memories
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_MEMORIES: MemoryPrompt[] = [
  {
    id: 'mem_1',
    photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=700&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Priya',
    relationship: 'Daughter',
    place: 'Guwahati, Assam',
    year: '1988',
    description: 'A serene family journey to Kamakhya temple along the Brahmaputra banks.',
    sampleSpokenText: 'This was our family trip to Guwahati with my daughter Priya. We took a boat on the Brahmaputra river and visited the temple gardens in 1988.',
    followUpQuestion: 'Where was this memorable family trip taken?',
    correctAnswer: 'Guwahati, Assam',
    options: ['Guwahati, Assam', 'Varanasi Ghats', 'Shimla Hills', 'Jaipur Palace'],
  },
  {
    id: 'mem_2',
    photoUrl: 'https://images.unsplash.com/photo-1506863530036-1ef0d464f158?q=80&w=700&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Arjun',
    relationship: 'Son',
    place: 'Patna Primary School',
    year: '1975',
    description: 'Teaching science and arithmetic to enthusiastic primary students.',
    sampleSpokenText: 'I remember teaching mathematics in Patna. My son Arjun used to come with me to the school playground after afternoon classes.',
    followUpQuestion: 'Who used to join after afternoon classes in this memory?',
    correctAnswer: 'Son Arjun',
    options: ['Son Arjun', 'Brother Rajesh', 'Colleague Dr. Sharma', 'Neighbor Verma'],
  },
  {
    id: 'mem_3',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Meenakshi',
    relationship: 'Wife',
    place: 'Varanasi Ghats',
    year: '1982',
    description: 'Evening Ganga Aarti with lighted clay diyas and sweet morning chai.',
    sampleSpokenText: 'We were in Varanasi by the river ghats during the evening aarti. Meenakshi bought flower diyas and we sat watching the lights on the river.',
    followUpQuestion: 'What festival or ritual was being observed by the river?',
    correctAnswer: 'Ganga Aarti with flower diyas',
    options: ['Ganga Aarti with flower diyas', 'Holi Rangotsav', 'Harvest Fair', 'Bihu Dance'],
  },
];

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s % 60}s`;
}

function hesitationLevel(pauseCount: number, answerChanges: number) {
  const score = pauseCount + answerChanges * 2;
  if (score <= 2) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
  if (score <= 5) return { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
  return { label: 'High', color: 'text-red-700', bg: 'bg-red-50 border-red-100' };
}

export const RememberAndSpeak: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Adaptive Difficulty State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  // Active Memory Prompt
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [memories, setMemories] = useState<MemoryPrompt[]>(FALLBACK_MEMORIES);
  const currentMemory = memories[memoryIndex] || FALLBACK_MEMORIES[0];

  // Gameplay State
  const [step, setStep] = useState<Step>('recording');
  const [elapsed, setElapsed] = useState(0);

  // Speech & Transcript
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Behavioral signals
  const [pauseCount, setPauseCount] = useState(0);
  const [answerChanges, setAnswerChanges] = useState(0);
  const [aiSummary, setAiSummary] = useState('');

  // Follow-up Question
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFollowUpCorrect, setIsFollowUpCorrect] = useState(false);

  // Timers & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const startedAtRef = useRef<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpokenTimeRef = useRef<number>(Date.now());
  const pauseDetectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results State
  const [results, setResults] = useState<{
    startedAt: string;
    completedAt: string;
    sessionDurationMs: number;
    wordCount: number;
    pauseCount: number;
    clarityScore: number;
    accuracyPct: number;
    followUpCorrect: boolean;
    difficultyLevel: DifficultyLevel;
    transcript: string;
    aiSummary: string;
    speechMode: 'voice' | 'text' | 'simulation';
    postedSessionId: string | null;
    saveError: string | null;
    isOffline?: boolean;
  } | null>(null);

  // 1. Fetch real memories and adaptive difficulty for DEMO_PATIENT_ID
  useEffect(() => {
    const loadData = async () => {
      // Load adaptive difficulty
      const diffRes = await getAdaptiveDifficulty('remember_and_speak');
      setDifficulty(diffRes.difficultyLevel);
      setDifficultyChange(diffRes.change);
      setDifficultyMessage(diffRes.message);

      try {
        const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: MemoryPrompt[] = data.map((m: any, idx: number) => {
              const isVideo = m.mediaType === 'video' || (m.videoUrl && m.videoUrl.length > 0) || (m.photoUrl && m.photoUrl.endsWith('.mp4'));
              const fallbackPhoto = FALLBACK_MEMORIES[idx % FALLBACK_MEMORIES.length].photoUrl;
              let photo = m.photoUrl;
              if (!photo || photo.endsWith('.mp4')) {
                photo = fallbackPhoto;
              }
              const video = m.videoUrl || (m.photoUrl && m.photoUrl.endsWith('.mp4') ? m.photoUrl : undefined);

              return {
                id: m.id,
                photoUrl: photo,
                videoUrl: video,
                mediaType: isVideo ? 'video' : 'photo',
                personName: m.personName || 'Family Member',
                relationship: m.relationship || 'Relative',
                place: m.place || 'Home & Family',
                year: m.year ? String(m.year) : 'Past Years',
                description: m.description || 'A cherished personal memory from family archives.',
                sampleSpokenText: `This moment was captured in ${m.place || 'our hometown'} with ${m.personName || 'my family'} around ${m.year || 'those days'}. ${m.description || ''}`,
                followUpQuestion: `Who was pictured with you in this memory?`,
                correctAnswer: m.personName || 'Family Member',
                options: [
                  m.personName || 'Family Member',
                  'Dr. Sharma',
                  'Colleague Verma',
                  'Neighbor Gupta',
                ],
              };
            });
            setMemories(mapped);
          }
        }
      } catch (err) {
        console.warn('Using fallback memories for Remember & Speak:', err);
      }
    };
    loadData();
  }, []);

  // 2. Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMode('text');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English, also works with natural accented speech

      recognition.onstart = () => {
        setIsListening(true);
        lastSpokenTimeRef.current = Date.now();
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());

        // Check silence / pause threshold (gap > 1.8 seconds between phrases)
        const now = Date.now();
        if (now - lastSpokenTimeRef.current > 1800) {
          setPauseCount((p) => p + 1);
        }
        lastSpokenTimeRef.current = now;
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsSpeechSupported(false);
          setMode('text');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsSpeechSupported(false);
      setMode('text');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Elapsed timer ticker
  useEffect(() => {
    if (step === 'saving' || step === 'results') {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => setElapsed(Date.now() - startedAtRef.current), 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [step]);

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMode('text');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition, switching to text mode:', err);
        setMode('text');
      }
    }
  };

  // Rule-based AI Summary generator
  const generateAiSummary = (rawText: string, mem: MemoryPrompt) => {
    const textLower = rawText.toLowerCase();
    const hasPlace = textLower.includes(mem.place.toLowerCase().split(',')[0]);
    const hasPerson = textLower.includes(mem.personName.toLowerCase());
    const hasYear = textLower.includes(mem.year);

    if (rawText.trim().length === 0) {
      return `You observed the family memory photo of ${mem.personName} at ${mem.place}.`;
    }

    if (hasPlace && hasPerson) {
      return `You clearly recalled your journey to ${mem.place} with ${mem.personName} (${mem.relationship}) around ${mem.year}.`;
    } else if (hasPerson) {
      return `You spoke warmly about your memories with ${mem.personName} (${mem.relationship}) and shared personal recollections.`;
    } else if (hasPlace) {
      return `You remembered the visit to ${mem.place} and described the surroundings and atmosphere.`;
    } else {
      return `You shared expressive thoughts about this family memory: "${rawText.slice(0, 90)}${rawText.length > 90 ? '…' : ''}"`;
    }
  };

  // Move from Recording to AI Summary review
  const handleProceedToSummary = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    const summaryText = generateAiSummary(transcript, currentMemory);
    setAiSummary(summaryText);
    setStep('ai_summary');
  };

  // Use Quick Speech Simulation (Ideal for live demo without mic)
  const handleUseSampleSpeech = (sample: string) => {
    setTranscript(sample);
    setAnswerChanges((c) => c + 1);
  };

  // Follow-up question answer handler
  const handleSelectFollowUp = (option: string) => {
    setSelectedOption(option);
    const correct = option === currentMemory.correctAnswer;
    setIsFollowUpCorrect(correct);
  };

  // Final Session Save
  const handleFinishGame = async () => {
    setStep('saving');
    const completedAt = new Date();
    const sessionDurationMs = Date.now() - startedAtRef.current;
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Speech clarity score heuristic: 80% to 98% based on length and flow
    const clarityScore = Math.min(
      98,
      Math.max(78, 80 + Math.min(wordCount * 1.5, 15) - pauseCount * 2)
    );

    // Accuracy %: 60% weight for follow-up question, 40% for speech recall completeness
    let accuracyScore = isFollowUpCorrect ? 60 : 20;
    if (wordCount >= 10) accuracyScore += 40;
    else if (wordCount >= 5) accuracyScore += 25;
    else accuracyScore += 10;

    const body = {
      patientId: DEMO_PATIENT_ID,
      gameType: 'remember_and_speak',
      questionId: currentMemory.id,
      responseTimeMs: sessionDurationMs,
      sessionDurationMs,
      correct: isFollowUpCorrect,
      hintUsed: mode === 'text' || pauseCount > 0,
      answerChanges,
      difficultyLevel: difficulty,
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      timestamp: new Date(startedAtRef.current).toISOString(),
      metadataJson: JSON.stringify({
        transcript,
        wordCount,
        pauseCount,
        clarityScore,
        aiSummary,
        speechMode: mode,
        difficultyLevel: difficulty,
        memoryPlace: currentMemory.place,
        memoryPerson: currentMemory.personName,
        followUpQuestion: currentMemory.followUpQuestion,
        followUpAnswer: selectedOption,
        followUpCorrect: isFollowUpCorrect,
        accuracyPct: accuracyScore,
      }),
    };

    const saveRes = await saveGameSession(body, 'Remember & Speak');

    setResults({
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      sessionDurationMs,
      wordCount,
      pauseCount,
      clarityScore,
      accuracyPct: accuracyScore,
      followUpCorrect: isFollowUpCorrect,
      difficultyLevel: difficulty,
      transcript,
      aiSummary,
      speechMode: mode,
      postedSessionId: saveRes.postedSessionId,
      saveError: saveRes.saveError,
      isOffline: saveRes.isOffline,
    });

    setStep('results');
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  const wordCountLive = transcript.trim().split(/\s+/).filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────────────────
  // Results Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'results' && results) {
    const hesitation = hesitationLevel(results.pauseCount, answerChanges);

    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          {/* Header */}
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('game_speak_title', 'Remember & Speak')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 p-5 space-y-4">
            {/* Celebration Header */}
            <div className="flex flex-col items-center py-3">
              <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center mb-3 shadow-md">
                <Brain className="w-10 h-10 text-[#0D5C4D]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center font-['Outfit']">
                {t('speak_share_memory', 'Memory Shared! 🎙️')}
              </h1>
              <p className="text-xs text-slate-500 text-center mt-0.5 max-w-xs">
                {t('speak_share_sub', 'Your voice and spoken recollections were analyzed and preserved.')}
              </p>
            </div>

            {/* AI Recall Summary Quote Card */}
            <div className="bg-gradient-to-br from-teal-900 to-[#07382E] text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>{t('speak_ai_synthesis', 'AI Memory Synthesis')}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic text-teal-50">
                "{results.aiSummary}"
              </p>
            </div>

            {/* 4 Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  label: t('speak_word_count', 'Word Count'),
                  value: `${results.wordCount} ${t('words_unit', 'words')}`,
                  color: 'text-teal-700',
                  bg: 'bg-teal-50',
                  border: 'border-teal-100',
                },
                {
                  icon: <Timer className="w-5 h-5" />,
                  label: t('speak_speaking_time', 'Speaking Time'),
                  value: formatMs(results.sessionDurationMs),
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  border: 'border-blue-100',
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  label: t('speak_clarity', 'Speech Clarity'),
                  value: `${results.clarityScore}%`,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  label: t('game_recall_question', 'Recall Question'),
                  value: results.followUpCorrect ? 'Correct ✅' : 'Missed ❌',
                  color: results.followUpCorrect ? 'text-emerald-600' : 'text-amber-600',
                  bg: results.followUpCorrect ? 'bg-emerald-50' : 'bg-amber-50',
                  border: results.followUpCorrect ? 'border-emerald-100' : 'border-amber-100',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex flex-col gap-1.5`}
                >
                  <div className={stat.color}>{stat.icon}</div>
                  <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Detailed Metrics Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('speak_pauses_title', 'Conversational Pauses')}</span>
                <span className="font-bold text-slate-900">
                  {t('speak_pauses_detected', '{{count}} pauses detected', { count: results.pauseCount })}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('game_hesitation_level', 'Hesitation Level')}</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full border ${hesitation.bg} ${hesitation.color}`}>
                  {hesitation.label}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('game_difficulty', 'Difficulty')}</span>
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 capitalize">
                  {results.difficultyLevel || difficulty}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('speak_input_modality', 'Input Modality')}</span>
                <span className="font-bold text-slate-800 capitalize">
                  {results.speechMode === 'voice'
                    ? t('speak_mode_voice', '🎙️ Live Voice Recognition')
                    : t('speak_mode_text', '⌨️ Text Assist Fallback')}
                </span>
              </div>
            </div>

            {/* Save Status / Offline Queue Banner */}
            {results.isOffline ? (
              <div className="rounded-2xl p-3.5 text-xs flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-900">
                <RotateCcw className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold block">Saved locally & queued for sync (Offline Mode 🔄)</span>
                  <span className="text-[11px] text-amber-800">
                    Your speech recording is preserved on this device. Local ID:{' '}
                    <code className="font-mono text-[10px] break-all">{results.postedSessionId}</code>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-2xl p-3.5 text-xs flex items-start gap-2.5 ${
                  results.saveError
                    ? 'bg-red-50 border border-red-100 text-red-700'
                    : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                }`}
              >
                {results.saveError ? (
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <div>
                  {results.saveError ? (
                    <>
                      <span className="font-semibold">Session not saved — </span>
                      {results.saveError}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Voice session telemetry saved to database! </span>
                      <span className="text-[11px] block font-mono text-emerald-800">
                        ID: {results.postedSessionId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  setMemoryIndex((i) => (i + 1) % memories.length);
                  setTranscript('');
                  setStep('recording');
                  startedAtRef.current = Date.now();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> {t('speak_next_memory', 'Next Memory')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/games')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> {t('game_all_games', 'All Games')}
              </button>
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Follow-Up Recall Question
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'follow_up') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => setStep('ai_summary')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('speak_step2_title', 'Step 2: Recall Question')}
            </span>
            <div className="flex items-center gap-1.5 text-[#0D5C4D]">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs font-bold tabular-nums">{formatMs(elapsed)}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-5 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 text-xs font-semibold mb-1">
                <Brain className="w-3.5 h-3.5 text-teal-700" />
                <span>{t('speak_verification', 'Memory Verification')}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
                {currentMemory.followUpQuestion}
              </h2>
              <p className="text-xs text-slate-500">
                {t('speak_select_detail', 'Select the detail matching your photo memory')}
              </p>
            </div>

            {/* Photo Thumbnail */}
            <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-slate-100">
              <img
                src={currentMemory.photoUrl}
                alt={`Memory recall photo of ${currentMemory.personName || 'family moment'}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentMemory.options.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectFollowUp(opt)}
                    className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all text-left flex items-center justify-between shadow-xs ${
                      isSelected
                        ? 'bg-[#0D5C4D] text-white border-[#0D5C4D]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20">
            <button
              type="button"
              disabled={!selectedOption}
              onClick={handleFinishGame}
              className="w-full py-3.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {t('speak_complete_workout', 'Complete Memory Workout')}
            </button>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: AI Recall Summary Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'ai_summary') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => setStep('recording')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('speak_analysis_title', 'Spoken Memory Analysis')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 flex flex-col p-5 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] pt-2">
                {t('speak_memory_captured', 'Memory Captured')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('speak_understood_sub', 'Here is what SmritiSetu understood from your voice')}
              </p>
            </div>

            {/* AI Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>{t('speak_ai_narrative', 'AI Recall Narrative')}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-[#F3E5D4]">
                "{aiSummary}"
              </p>

              {/* Raw Transcript Snippet */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {t('speak_transcribed_words', 'Transcribed Words ({{count}} words):', { count: wordCountLive })}
                </span>
                <p className="text-xs text-slate-600 italic">
                  "{transcript}"
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('speak_pause_count', 'Pause Count')}</span>
                <span className="text-base font-bold text-slate-800 font-['Outfit']">{pauseCount}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('speak_speaking_mode', 'Speaking Mode')}</span>
                <span className="text-base font-bold text-teal-800 font-['Outfit'] capitalize">{mode}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20">
            <button
              type="button"
              onClick={() => setStep('follow_up')}
              className="w-full py-3.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>{t('speak_next_recall_q', 'Next: Quick Recall Question')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Voice Recording & Photo Screen
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Sticky Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('game_speak_title', 'Remember & Speak')}
          </span>
          <div className="flex items-center gap-1.5 text-[#0D5C4D]">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tabular-nums">{formatMs(elapsed)}</span>
          </div>
        </div>

        {/* Adaptive Difficulty Toast / Notice */}
        <AdaptiveDifficultyNotice
          change={difficultyChange}
          message={difficultyMessage}
          level={difficulty}
        />

        {/* Prompt Header */}
        <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
              {t('speak_look_and_speak', 'Look at the picture and speak')}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t('speak_tell_me', 'Tell me who or what you remember from this moment')}
            </p>
          </div>

          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'voice' ? 'text' : 'voice'))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            {mode === 'voice' ? (
              <>
                <Keyboard className="w-3.5 h-3.5" />
                <span>{t('speak_text_mode', 'Text Mode')}</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>{t('speak_voice_mode', 'Voice Mode')}</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-2xl w-full mx-auto">
          {/* Family Photo / Video Card with capped responsive height */}
          <div className="w-full max-h-56 sm:max-h-64 md:max-h-72 aspect-video sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-md border-4 border-white bg-slate-900 relative group flex items-center justify-center">
            {currentMemory.mediaType === 'video' && currentMemory.videoUrl ? (
              <video
                key={currentMemory.videoUrl}
                src={currentMemory.videoUrl}
                poster={currentMemory.photoUrl}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentMemory.photoUrl}
                alt={`Family memory photo: ${currentMemory.personName} at ${currentMemory.place || 'home'}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white p-2.5 rounded-2xl text-xs flex items-center justify-between pointer-events-none">
              <div>
                <span className="font-bold block">
                  {difficulty === 'hard'
                    ? currentMemory.mediaType === 'video'
                      ? 'Video from Family Archive'
                      : 'Photo from Family Archive'
                    : `${currentMemory.personName} (${currentMemory.relationship})`}
                </span>
                <span className="text-[10px] text-slate-200">
                  {difficulty === 'easy'
                    ? `${currentMemory.place} • ${currentMemory.year}`
                    : difficulty === 'medium'
                    ? `Year: ${currentMemory.year} (Where was this?)`
                    : 'Recall where & when this happened'}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-semibold pointer-events-auto">
                {currentMemory.mediaType === 'video'
                  ? '🎬 ' + t('video_cue', 'Video Cue')
                  : t('speak_photo_cue', 'Photo Cue')}
              </span>
            </div>
          </div>

          {/* Voice Waveform / Listening State */}
          {mode === 'voice' ? (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <VoiceWaveform
                isListening={isListening}
                statusText={
                  isListening
                    ? t('speak_listening', 'Listening... Speak freely')
                    : transcript.length > 0
                    ? t('speak_voice_paused', 'Voice paused. Tap mic to speak more')
                    : t('speak_tap_mic', 'Tap mic button to begin speaking')
                }
                onToggle={toggleListening}
                barCount={16}
              />

              {/* Live Transcript Display Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 min-h-[60px] text-xs">
                {transcript.length > 0 ? (
                  <p className="text-slate-800 leading-relaxed font-medium">"{transcript}"</p>
                ) : (
                  <p className="text-slate-400 italic">
                    {t('speak_transcript_placeholder', 'Your transcribed words will appear here in real-time as you speak...')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Text Input Mode */
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {t('speak_type_label', 'Type what you recall from this memory:')}
              </label>
              <textarea
                rows={3}
                placeholder={t('speak_type_placeholder', 'e.g. This was our trip to Guwahati with Priya in 1988...')}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setAnswerChanges((c) => c + 1);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>
          )}

          {/* Quick Speech Simulation Buttons (for live demos without microphone) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>{t('speak_demo_shortcut', 'Quick Spoken Simulation (Demo shortcut):')}</span>
              <span>{wordCountLive} {t('words_unit', 'words')}</span>
            </div>
            <button
              type="button"
              onClick={() => handleUseSampleSpeech(currentMemory.sampleSpokenText)}
              className="w-full p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200/60 text-left text-xs text-teal-900 font-medium transition active:scale-95"
            >
              "{currentMemory.sampleSpokenText}"
            </button>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20">
          <button
            type="button"
            disabled={transcript.trim().length === 0}
            onClick={handleProceedToSummary}
            className="w-full py-3.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{t('speak_process_review', 'Process & Review Memory')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default RememberAndSpeak;
