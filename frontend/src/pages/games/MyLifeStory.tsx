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
  BookOpen,
  Calendar,
  MapPin,
  Heart,
  Plus,
  HelpCircle,
  CloudOff,
  ListOrdered,
  Film
} from 'lucide-react';
import { MobileContainer } from '../../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../../components/design-system/BottomNavBar';
import { AdaptiveDifficultyNotice } from '../../components/AdaptiveDifficultyNotice';
import { getAdaptiveDifficulty, DifficultyLevel } from '../../utils/adaptiveDifficulty';
import { saveGameSession } from '../../utils/gameSessionSync';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface RealMemory {
  id: string;
  photoUrl: string | null;
  videoUrl?: string | null;
  mediaType?: 'photo' | 'video';
  personName: string | null;
  relationship: string | null;
  year: string | null;
  place: string | null;
  description: string | null;
  createdAt: string;
}

interface LifeQuestion {
  id: string;
  year: string;
  photoUrl: string;
  videoUrl?: string | null;
  mediaType?: 'photo' | 'video';
  personName: string;
  relationship: string;
  place: string;
  description: string;
  correctAnswer: string;
  options: string[];
}

interface AttemptRecord {
  questionId: string;
  responseTimeMs: number;
  correct: boolean;
}

interface FeedbackState {
  type: 'correct' | 'incorrect';
  chosen: string;
  correctAnswer: string;
  year: string;
  personName: string;
  relationship: string;
}

type GamePhase = 'loading' | 'insufficient_memories' | 'playing' | 'saving' | 'results';

const nodeColors = [
  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-200' },
  { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-200' },
  { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-200' },
  { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-200' },
  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-200' },
];

// Fallback wrong event options if patient has fewer than 3 other memories
const FALLBACK_EVENT_OPTIONS = [
  'Family Picnic & Boat Ride',
  'Housewarming & Griha Pravesh',
  'Grand Diwali Family Feast',
  'Holiday in Hills & Tea Gardens',
  'Special Golden Anniversary Celebration',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s % 60}s`;
}

function hesitationLevel(answerChanges: number, hintCount: number) {
  const score = answerChanges + hintCount * 2;
  if (score === 0) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
  if (score <= 2) return { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
  return { label: 'High', color: 'text-red-700', bg: 'bg-red-50 border-red-100' };
}

function formatMemoryOption(mem: RealMemory): string {
  if (mem.description && mem.description.trim().length > 0) {
    return mem.description.length > 55 ? `${mem.description.slice(0, 52)}...` : mem.description;
  }
  if (mem.personName) {
    return `${mem.personName}${mem.relationship ? ` (${mem.relationship})` : ''}${mem.place ? ` in ${mem.place}` : ''}`;
  }
  return 'Special Family Milestone';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const MyLifeStory: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Active Screen View: 'game' vs 'timeline'
  const [viewMode, setViewMode] = useState<'game' | 'timeline'>('game');

  // Adaptive Difficulty State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  // State
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [rawMemories, setRawMemories] = useState<RealMemory[]>([]);
  const [questions, setQuestions] = useState<LifeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gameplay State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Behavioral Signals
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // Tracking Refs
  const startedAtRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const attemptsRef = useRef<AttemptRecord[]>([]);
  const answerChangesRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results
  const [results, setResults] = useState<{
    startedAt: string;
    completedAt: string;
    sessionDurationMs: number;
    accuracyPct: number;
    avgResponseMs: number;
    totalAttempts: number;
    correctCount: number;
    answerChanges: number;
    hintCount: number;
    difficultyLevel: DifficultyLevel;
    postedSessionId: string | null;
    isOffline?: boolean;
    saveError: string | null;
    totalQuestions: number;
  } | null>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // 1. Initialize Game & Fetch Real Patient Memories
  const initGame = useCallback(async () => {
    setPhase('loading');
    setFeedbackState(null);
    setSelectedOption(null);
    setIsChecking(false);
    setHintActive(false);

    try {
      // Load adaptive difficulty
      const diffRes = await getAdaptiveDifficulty('my_life_story');
      setDifficulty(diffRes.difficultyLevel);
      setDifficultyChange(diffRes.change);
      setDifficultyMessage(diffRes.message);

      // Query real memories for DEMO_PATIENT_ID
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
      const data: RealMemory[] = res.ok ? await res.json() : [];

      // Sort chronological by year ascending
      const sortedMemories = [...data].sort((a, b) => {
        const yA = parseInt(a.year || '0', 10);
        const yB = parseInt(b.year || '0', 10);
        if (yA && yB) return yA - yB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      setRawMemories(sortedMemories);

      // Spec Requirement: If fewer than 3 real memories, do NOT invent fake timeline events!
      if (sortedMemories.length < 3) {
        setPhase('insufficient_memories');
        return;
      }

      // Determine question count (Easy: 3, Medium: 4, Hard: 5, capped at available memories)
      const qTarget = diffRes.difficultyLevel === 'easy' ? 3 : diffRes.difficultyLevel === 'medium' ? 4 : 5;
      const qCount = Math.min(qTarget, sortedMemories.length);

      // Pick distinct real memories for this session
      const selectedMemories = shuffleArray(sortedMemories).slice(0, qCount);

      // Build questions using real memory data
      const generatedQuestions: LifeQuestion[] = selectedMemories.map((mem) => {
        const year = mem.year || 'Past Milestone';
        const correctOpt = formatMemoryOption(mem);

        // Spec Requirement: Pull 2 wrong options from patient's OTHER real memories
        const otherMemories = sortedMemories.filter((m) => m.id !== mem.id);
        const otherOptions = otherMemories.map(formatMemoryOption).filter((opt) => opt !== correctOpt);
        const distinctOtherOptions = Array.from(new Set(otherOptions));

        let chosenWrongs: string[] = [];
        if (distinctOtherOptions.length >= 2) {
          chosenWrongs = shuffleArray(distinctOtherOptions).slice(0, 2);
        } else {
          const needed = 2 - distinctOtherOptions.length;
          const fallbackPool = FALLBACK_EVENT_OPTIONS.filter((fo) => fo !== correctOpt && !distinctOtherOptions.includes(fo));
          chosenWrongs = [...distinctOtherOptions, ...shuffleArray(fallbackPool).slice(0, needed)];
        }

        const isVid =
          mem.mediaType === 'video' ||
          Boolean(mem.videoUrl) ||
          Boolean(mem.photoUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ||
          Boolean(mem.photoUrl?.startsWith('data:video/'));

        return {
          id: mem.id,
          year,
          photoUrl: mem.photoUrl || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600',
          videoUrl: mem.videoUrl || (isVid ? mem.photoUrl : null),
          mediaType: isVid ? ('video' as const) : ('photo' as const),
          personName: mem.personName || 'Family',
          relationship: mem.relationship || 'Loved One',
          place: mem.place || 'Our Home',
          description: mem.description || '',
          correctAnswer: correctOpt,
          options: shuffleArray([correctOpt, ...chosenWrongs]),
        };
      });

      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setHintCount(0);
      attemptsRef.current = [];
      answerChangesRef.current = 0;
      startedAtRef.current = Date.now();
      questionStartRef.current = Date.now();
      setPhase('playing');
    } catch (err) {
      console.error('MyLifeStory init error:', err);
      setPhase('insufficient_memories');
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Elapsed ticker
  useEffect(() => {
    if (phase !== 'playing') {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => setElapsed(Date.now() - startedAtRef.current), 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  // Save session on game complete
  const saveSession = useCallback(
    async (
      completedAt: Date,
      sessionDurationMs: number,
      attempts: AttemptRecord[],
      ac: number,
      hints: number
    ) => {
      setPhase('saving');
      const correctCount = attempts.filter((a) => a.correct).length;
      const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const avgResponseMs =
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / attempts.length)
          : 0;

      const body = {
        patientId: DEMO_PATIENT_ID,
        gameType: 'my_life_story',
        questionId: null,
        responseTimeMs: avgResponseMs,
        sessionDurationMs,
        correct: correctCount === totalQuestions,
        hintUsed: hints > 0,
        answerChanges: ac,
        difficultyLevel: difficulty,
        startedAt: new Date(startedAtRef.current).toISOString(),
        completedAt: completedAt.toISOString(),
        timestamp: new Date(startedAtRef.current).toISOString(),
        metadataJson: JSON.stringify({
          totalQuestions,
          correctCount,
          accuracyPct,
          avgResponseMs,
          answerChanges: ac,
          hintCount: hints,
          difficultyLevel: difficulty,
          realMemoriesCount: rawMemories.length,
        }),
      };

      const saveRes = await saveGameSession(body, 'My Life Story');

      setResults({
        startedAt: new Date(startedAtRef.current).toISOString(),
        completedAt: completedAt.toISOString(),
        sessionDurationMs,
        accuracyPct,
        avgResponseMs,
        totalAttempts: attempts.length,
        correctCount,
        answerChanges: ac,
        hintCount: hints,
        difficultyLevel: difficulty,
        postedSessionId: saveRes.postedSessionId,
        isOffline: saveRes.isOffline,
        saveError: saveRes.saveError,
        totalQuestions,
      });

      setPhase('results');
    },
    [totalQuestions, difficulty, rawMemories.length]
  );

  // Handle Option Click
  const handleSelectOption = (opt: string) => {
    if (isChecking || phase !== 'playing' || !currentQuestion) return;

    setSelectedOption(opt);
    setIsChecking(true);

    const responseTimeMs = Date.now() - questionStartRef.current;
    const isCorrect = opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    attemptsRef.current.push({
      questionId: currentQuestion.id,
      responseTimeMs,
      correct: isCorrect,
    });

    if (!isCorrect) {
      answerChangesRef.current += 1;
    }

    setFeedbackState({
      type: isCorrect ? 'correct' : 'incorrect',
      chosen: opt,
      correctAnswer: currentQuestion.correctAnswer,
      year: currentQuestion.year,
      personName: currentQuestion.personName,
      relationship: currentQuestion.relationship,
    });

    // Friendly display duration for feedback, then proceed
    feedbackTimerRef.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setFeedbackState(null);
        setHintActive(false);
        setIsChecking(false);
        questionStartRef.current = Date.now();
      } else {
        const completedAt = new Date();
        const dur = Date.now() - startedAtRef.current;
        saveSession(completedAt, dur, attemptsRef.current, answerChangesRef.current, hintCount);
      }
    }, isCorrect ? 1300 : 1800);
  };

  // Hint handler
  const handleHint = () => {
    if (hintActive || isChecking || !currentQuestion) return;
    setHintCount((c) => c + 1);
    setHintActive(true);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render Loading Phase
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium text-base">
            {t('opening_album', 'Opening your life album...')}
          </p>
        </div>
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render Insufficient Memories State (< 3 real memories)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'insufficient_memories') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('game_life_title', 'My Life Story')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-purple-50 border-4 border-purple-200 flex items-center justify-center shadow-md">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {t('unlock_life_story_title', 'Add a few more memories to unlock your Life Story game')}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t(
                  'unlock_life_story_desc',
                  'You currently have {{count}} memory. Add at least 3 family memories with years to start recalling your personal life story milestones.',
                  { count: rawMemories.length }
                )}
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/memories')}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" /> <span>{t('add_memory', 'Add Memory')}</span>
              </button>

              {rawMemories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ListOrdered className="w-4 h-4 text-purple-600" /> {t('view_current_timeline', 'View Current Timeline')}
                </button>
              )}
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render Saving Phase
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'saving') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center gap-5 p-8">
          <div className="w-16 h-16 rounded-full bg-purple-50 border-4 border-purple-200 flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8 text-purple-600 animate-bounce" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{t('game_milestones_completed', 'Milestones Completed!')}</h2>
            <p className="text-sm text-slate-500">{t('game_saving_telemetry', 'Saving your life story session…')}</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render Results Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    const hesitation = hesitationLevel(results.answerChanges, results.hintCount);

    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('game_life_title', 'My Life Story')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-purple-50 border-4 border-purple-200 flex items-center justify-center mb-3 shadow-md">
                <BookOpen className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center">
                {t('game_life_recalled', 'Life Journey Recalled! 🌸')}
              </h1>
              <p className="text-sm text-slate-500 text-center mt-1">
                {t('game_life_recalled_sub', 'You reflected upon precious life moments and milestones')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  label: t('game_milestone_accuracy', 'Accuracy'),
                  value: `${results.accuracyPct}%`,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                },
                {
                  icon: <Timer className="w-5 h-5" />,
                  label: t('game_session_time', 'Time Taken'),
                  value: formatMs(results.sessionDurationMs),
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  border: 'border-blue-100',
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  label: t('game_avg_response', 'Avg Response'),
                  value: formatMs(results.avgResponseMs),
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                  border: 'border-amber-100',
                },
                {
                  icon: <Eye className="w-5 h-5" />,
                  label: t('game_hints_used', 'Hints Used'),
                  value: String(results.hintCount),
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                  border: 'border-purple-100',
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

            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('game_hesitation_level', 'Hesitation Level')}</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full border ${hesitation.bg} ${hesitation.color}`}>
                  {hesitation.label}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('game_difficulty', 'Difficulty')}</span>
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 capitalize">
                  {results.difficultyLevel || difficulty}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('game_milestones_answered', 'Score')}</span>
                <span className="font-bold text-slate-800">
                  {results.correctCount} / {results.totalQuestions} {t('game_correct', 'correct')}
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-3.5 text-xs flex items-start gap-2.5 ${
                results.saveError
                  ? 'bg-red-50 border border-red-100 text-red-700'
                  : results.isOffline
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
              }`}
            >
              {results.saveError ? (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : results.isOffline ? (
                <CloudOff className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <div>
                {results.saveError ? (
                  <>
                    <span className="font-semibold">{t('game_not_saved', 'Session not saved')} — </span>
                    {results.saveError}
                  </>
                ) : results.isOffline ? (
                  <>
                    <span className="font-semibold">{t('game_saved_offline', 'Saved locally in offline queue 📦')}</span>
                    <span className="text-[11px] block text-amber-700 mt-0.5">
                      {t('game_offline_notice', 'Your session is saved safely and will automatically sync once connected.')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{t('game_saved_db', 'Session saved to database!')} </span>
                    <span className="text-[11px] block font-mono text-emerald-800">
                      Row ID: {results.postedSessionId}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-1 pb-4">
              <button
                type="button"
                onClick={initGame}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> {t('game_play_again', 'Play Again')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
              >
                <ListOrdered className="w-4 h-4 text-purple-600" /> {t('view_timeline', 'View Timeline')}
              </button>
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PART 1 — TIMELINE VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (viewMode === 'timeline') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          {/* Top Header */}
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('game')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('timeline_view_title', 'Life Story Timeline')}
            </span>
            <button
              type="button"
              onClick={() => setViewMode('game')}
              className="text-xs font-bold text-[#0D5C4D] px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100"
            >
              {t('play_game', 'Play Game')}
            </button>
          </div>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
            <div className="text-center pb-2">
              <h2 className="text-xl font-bold text-slate-900">{t('timeline_title', 'Your Journey Through Time')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('timeline_subtitle', 'Milestones ordered chronologically by year')}</p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 pb-6">
              {/* Vertical connecting gradient line */}
              <div className="absolute left-[35px] sm:left-[39px] top-6 bottom-8 w-1 bg-gradient-to-b from-emerald-400 via-amber-400 via-rose-400 to-purple-500 rounded-full" />

              {rawMemories.map((mem, index) => {
                const colorConfig = nodeColors[index % nodeColors.length];
                return (
                  <div key={mem.id} className="relative flex items-start space-x-4 group">
                    {/* Node Dot with Year */}
                    <div
                      className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${colorConfig.bg} text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}
                    >
                      <span>{mem.year ? mem.year : `${index + 1}`}</span>
                    </div>

                    {/* Milestone Card */}
                    <div className="flex-1 bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-soft-card flex items-center justify-between gap-3 overflow-hidden">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            {mem.year || 'Archive'}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                          {mem.personName || 'Family Milestone'}
                        </h3>
                        {mem.relationship && (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0D5C4D] block truncate">
                            {mem.relationship} {mem.place && `• ${mem.place}`}
                          </span>
                        )}
                        {mem.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {mem.description}
                          </p>
                        )}
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] min-h-[5rem] max-w-[6rem] max-h-[6rem] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {mem.photoUrl ? (
                          <img
                            src={mem.photoUrl}
                            alt={`Photo of ${mem.personName}`}
                            className="w-full h-full object-cover block"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Terminal "Today / My Memories" Node */}
              <div className="relative flex items-center space-x-4 pt-2">
                <div className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex-1">
                  <span className="text-xs font-bold text-purple-900 block">{t('today', 'Today')}</span>
                  <span className="text-[11px] text-purple-700">{t('memories_journey_subtitle', 'My continuing memories journey')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewMode('game')}
                className="w-full py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> {t('start_recall_game', 'Play Recall Game')}
              </button>
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PART 2 — RECALL GAME VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Top Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('game_life_title', 'My Life Story')}
          </span>
          <div className="flex items-center gap-1.5 text-[#0D5C4D]">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tabular-nums">{formatMs(elapsed)}</span>
          </div>
        </div>

        {/* Adaptive Difficulty Notice */}
        <AdaptiveDifficultyNotice
          change={difficultyChange}
          message={difficultyMessage}
          level={difficulty}
        />

        {/* Progress Bar & View Toggle */}
        <div className="bg-white px-5 pb-3 pt-1 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>{t('game_milestone_progress', 'Progress')}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-0.5"
              >
                <ListOrdered className="w-3 h-3" /> {t('view_timeline', 'Timeline')}
              </button>
              <span className="font-bold text-[#0D5C4D]">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question & Photo Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
          {currentQuestion && (
            <div className="flex flex-col h-full gap-4 max-w-sm w-full mx-auto justify-between">
              {/* Question Title */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Around {currentQuestion.year}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {t('game_life_q_around_year', 'What happened around {{year}}?', { year: currentQuestion.year })}
                </h2>
                {hintActive && (
                  <p className="text-xs font-medium text-amber-800 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg py-1 px-2.5 inline-block animate-fadeIn">
                    💡 {t('game_hint_memory_clue', 'Associated with {{person}} in {{place}}', {
                      person: currentQuestion.personName,
                      place: currentQuestion.place || 'family home',
                    })}
                  </p>
                )}
              </div>

              {/* Photo / Video Box: Contained, square aspect ratio, elegant rounded container */}
              <div className="w-full aspect-square max-w-[270px] sm:max-w-[290px] bg-slate-950 rounded-3xl overflow-hidden shadow-md border-4 border-white relative mx-auto flex items-center justify-center">
                {currentQuestion.mediaType === 'video' || Boolean(currentQuestion.videoUrl) || Boolean(currentQuestion.photoUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      src={currentQuestion.videoUrl || currentQuestion.photoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-rose-600/90 text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Film className="w-3 h-3" />
                      <span>Video Memory</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentQuestion.photoUrl}
                    alt={`Memory photo from ${currentQuestion.year}`}
                    className="w-full h-full object-cover block"
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600';
                    }}
                  />
                )}
              </div>

              {/* 3 Options Buttons */}
              <div className="space-y-2 pt-1">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectAnswer = opt.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

                  let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-purple-300 shadow-sm';

                  if (isChecking) {
                    if (isSelected && isCorrectAnswer) {
                      btnStyle = 'bg-[#0D5C4D] border-[#0D5C4D] text-white scale-[1.02] shadow-md shadow-[#0D5C4D]/25 ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrectAnswer) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 scale-[0.98]';
                    } else if (!isSelected && isCorrectAnswer && feedbackState?.type === 'incorrect') {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-extrabold animate-pulse';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isChecking}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span className="line-clamp-2">{opt}</span>
                      {isChecking && isSelected && (
                        <span className="shrink-0 ml-2">
                          {isCorrectAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert Box */}
              {feedbackState && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 text-left transition-all animate-fadeIn shadow-sm ${
                    feedbackState.type === 'correct'
                      ? 'bg-[#EAF6F3] border-[#A7E8C7] text-[#0D5C4D]'
                      : 'bg-[#FFF8F0] border-[#FED7AA] text-amber-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                      feedbackState.type === 'correct' ? 'bg-[#0D5C4D]' : 'bg-amber-600'
                    }`}
                  >
                    {feedbackState.type === 'correct' ? (
                      <Heart className="w-4 h-4 fill-white" />
                    ) : (
                      <HelpCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold">
                      {feedbackState.type === 'correct'
                        ? t('game_who_remembered', 'Wonderful! You remembered that. ❤️')
                        : t(
                            'game_life_gentle_answer',
                            'That is okay! In {{year}}, you celebrated with {{name}} ({{rel}}). ❤️',
                            {
                              year: feedbackState.year,
                              name: feedbackState.personName,
                              rel: feedbackState.relationship,
                            }
                          )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Hint and Reset */}
        <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleHint}
            disabled={hintActive || isChecking}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              hintActive
                ? 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed'
                : 'bg-[#FEF5E7] text-[#D97706] border border-[#FCE6C7] hover:bg-amber-100 active:scale-95'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {hintActive ? t('game_showing', 'Showing…') : `${t('game_hint', 'Hint')} (${hintCount})`}
          </button>

          <button
            type="button"
            onClick={initGame}
            disabled={isChecking}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Restart game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default MyLifeStory;
