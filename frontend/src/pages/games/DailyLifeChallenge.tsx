import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Pill,
  Utensils,
  Footprints,
  Moon,
  Sun,
  Coffee,
  HeartPulse,
  Tv,
  Flame,
  Activity,
  Car,
  Clock,
  Check
} from 'lucide-react';
import { MobileContainer } from '../../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../../components/design-system/BottomNavBar';
import { AdaptiveDifficultyNotice } from '../../components/AdaptiveDifficultyNotice';
import { getAdaptiveDifficulty, DifficultyLevel } from '../../utils/adaptiveDifficulty';
import { saveGameSession } from '../../utils/gameSessionSync';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface RoutineOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  textColor: string;
  iconColor: string;
  isCorrect: boolean;
}

interface RoutineScenario {
  id: string;
  timeOfDay: string;
  timeIcon: React.ReactNode;
  scenarioTitle: string;
  questionText: string;
  contextHint: string;
  options: RoutineOption[];
}

interface ScenarioAttempt {
  scenarioId: string;
  responseTimeMs: number;
  correct: boolean;
  selectedOptionId: string;
}

type Step = 'playing' | 'saving' | 'results';

// ─────────────────────────────────────────────────────────────────────────────
// Routine Scenarios Factory
// ─────────────────────────────────────────────────────────────────────────────
const getRoutineScenarios = (t: (key: string, defaultVal?: any) => string): RoutineScenario[] => [
  {
    id: 'sc_morning',
    timeOfDay: '08:00 AM',
    timeIcon: <Sun className="w-5 h-5 text-amber-500" />,
    scenarioTitle: t('routine_morning_title', "It's 8:00 AM in the morning"),
    questionText: t('routine_morning_q', 'What should you do first after waking up and freshening up?'),
    contextHint: t('routine_morning_hint', 'Doctor prescribed regular morning blood pressure care after warm water.'),
    options: [
      {
        id: 'opt_med_morning',
        title: t('opt_med_morning_title', 'Morning Blood Pressure Medicine'),
        subtitle: t('opt_med_morning_sub', 'Take prescribed tablet with a glass of lukewarm water'),
        icon: <Pill className="w-6 h-6" />,
        bg: 'bg-[#FDECEC]',
        border: 'border-[#F9BFC1]',
        textColor: 'text-rose-950',
        iconColor: 'text-[#EF4444]',
        isCorrect: true,
      },
      {
        id: 'opt_heavy_sweets',
        title: t('opt_sweets_title', 'Eat Heavy Fried Sweets & Chai'),
        subtitle: t('opt_sweets_sub', 'Skip water and eat rich morning snacks'),
        icon: <Utensils className="w-6 h-6" />,
        bg: 'bg-[#FEF7E6]',
        border: 'border-[#FDE29A]',
        textColor: 'text-amber-950',
        iconColor: 'text-[#F59E0B]',
        isCorrect: false,
      },
      {
        id: 'opt_watch_tv',
        title: t('opt_tv_title', 'Watch Television for Hours'),
        subtitle: t('opt_tv_sub', 'Sit on sofa before taking medicine'),
        icon: <Tv className="w-6 h-6" />,
        bg: 'bg-[#F1F5F9]',
        border: 'border-[#CBD5E1]',
        textColor: 'text-slate-800',
        iconColor: 'text-slate-600',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'sc_afternoon',
    timeOfDay: '01:00 PM',
    timeIcon: <Sun className="w-5 h-5 text-amber-600" />,
    scenarioTitle: t('routine_afternoon_title', "It's 1:00 PM in the afternoon"),
    questionText: t('routine_afternoon_q', 'What is the scheduled healthy routine for midday?'),
    contextHint: t('routine_afternoon_hint', 'Midday nutrition and proper hydration maintain cognitive alertness.'),
    options: [
      {
        id: 'opt_lunch',
        title: t('opt_lunch_title', 'Wholesome Lunch & Hydration'),
        subtitle: t('opt_lunch_sub', 'Warm dal, rice, green vegetables and fresh water'),
        icon: <Utensils className="w-6 h-6" />,
        bg: 'bg-[#EAF8F1]',
        border: 'border-[#A7E8C7]',
        textColor: 'text-emerald-950',
        iconColor: 'text-[#10B981]',
        isCorrect: true,
      },
      {
        id: 'opt_heavy_workout',
        title: t('opt_workout_title', 'Intense Outdoor Gym Workout'),
        subtitle: t('opt_workout_sub', 'Heavy lifting during peak hot sun'),
        icon: <Activity className="w-6 h-6" />,
        bg: 'bg-[#FEF7E6]',
        border: 'border-[#FDE29A]',
        textColor: 'text-amber-950',
        iconColor: 'text-[#F59E0B]',
        isCorrect: false,
      },
      {
        id: 'opt_aarti_noon',
        title: t('opt_aarti_title', 'Evening Sunset Aarti Prayers'),
        subtitle: t('opt_aarti_sub', 'Light evening lamps at midday'),
        icon: <Flame className="w-6 h-6" />,
        bg: 'bg-[#F3EEF9]',
        border: 'border-[#DDD6FE]',
        textColor: 'text-purple-950',
        iconColor: 'text-[#7C3AED]',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'sc_evening',
    timeOfDay: '04:30 PM',
    timeIcon: <Coffee className="w-5 h-5 text-teal-600" />,
    scenarioTitle: t('routine_evening_title', "It's 4:30 PM in the evening"),
    questionText: t('routine_evening_q', 'What is a calming and refreshing routine for this hour?'),
    contextHint: t('routine_evening_hint', 'Gentle mobility and fresh air support restful evening sleep.'),
    options: [
      {
        id: 'opt_evening_walk',
        title: t('opt_walk_title', 'Gentle Garden Walk & Warm Tea'),
        subtitle: t('opt_walk_sub', 'Enjoy fresh air with caregiver and sip herbal tea'),
        icon: <Footprints className="w-6 h-6" />,
        bg: 'bg-[#EAF6F4]',
        border: 'border-[#A5D8CD]',
        textColor: 'text-teal-950',
        iconColor: 'text-[#0D5C4D]',
        isCorrect: true,
      },
      {
        id: 'opt_sleep_night',
        title: t('opt_sleep_title', 'Go to Sleep for the Night'),
        subtitle: t('opt_sleep_sub', 'Turn off all room lights and sleep early'),
        icon: <Moon className="w-6 h-6" />,
        bg: 'bg-[#EDF5FE]',
        border: 'border-[#BFDBFE]',
        textColor: 'text-blue-950',
        iconColor: 'text-[#2563EB]',
        isCorrect: false,
      },
      {
        id: 'opt_drive_highway',
        title: t('opt_drive_title', 'Drive Alone on Fast Highway'),
        subtitle: t('opt_drive_sub', 'Take car out without glasses'),
        icon: <Car className="w-6 h-6" />,
        bg: 'bg-[#F1F5F9]',
        border: 'border-[#CBD5E1]',
        textColor: 'text-slate-800',
        iconColor: 'text-slate-600',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'sc_night',
    timeOfDay: '08:30 PM',
    timeIcon: <Moon className="w-5 h-5 text-indigo-500" />,
    scenarioTitle: t('routine_night_title', "It's 8:30 PM at night"),
    questionText: t('routine_night_q', 'What is the recommended pre-sleep routine?'),
    contextHint: t('routine_night_hint', 'Evening medicine followed by soothing ragas prepares the body for deep rest.'),
    options: [
      {
        id: 'opt_night_med',
        title: t('opt_night_med_title', 'Night Medicine & Soothing Raga'),
        subtitle: t('opt_night_med_sub', 'Take evening tablet and listen to calming classical music'),
        icon: <HeartPulse className="w-6 h-6" />,
        bg: 'bg-[#EDF5FE]',
        border: 'border-[#BFDBFE]',
        textColor: 'text-indigo-950',
        iconColor: 'text-[#4F46E5]',
        isCorrect: true,
      },
      {
        id: 'opt_strong_coffee',
        title: t('opt_coffee_title', 'Drink Strong Double Espresso Coffee'),
        subtitle: t('opt_coffee_sub', 'High caffeine beverage right before sleeping'),
        icon: <Coffee className="w-6 h-6" />,
        bg: 'bg-[#FEF7E6]',
        border: 'border-[#FDE29A]',
        textColor: 'text-amber-950',
        iconColor: 'text-[#F59E0B]',
        isCorrect: false,
      },
      {
        id: 'opt_skip_all',
        title: t('opt_skip_title', 'Skip All Medicines & Stay Awake'),
        subtitle: t('opt_skip_sub', 'Ignore routine checklist'),
        icon: <XCircle className="w-6 h-6" />,
        bg: 'bg-[#FDECEC]',
        border: 'border-[#F9BFC1]',
        textColor: 'text-rose-950',
        iconColor: 'text-[#EF4444]',
        isCorrect: false,
      },
    ],
  },
];

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s % 60}s`;
}

function hesitationLevel(answerChanges: number, hintCount: number) {
  const score = answerChanges + hintCount * 2;
  if (score <= 1) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
  if (score <= 4) return { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
  return { label: 'High', color: 'text-red-700', bg: 'bg-red-50 border-red-100' };
}

export const DailyLifeChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const routineScenarios = useMemo(() => getRoutineScenarios(t), [t]);

  // Adaptive Difficulty State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  // Active Scenarios based on difficulty
  const [activeScenarios, setActiveScenarios] = useState<RoutineScenario[]>(routineScenarios.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScenario = activeScenarios[currentIndex] || routineScenarios[0];
  const totalScenarios = activeScenarios.length;

  // Selection & Feedback state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [step, setStep] = useState<Step>('playing');
  const [elapsed, setElapsed] = useState(0);

  // Telemetry
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [answerChanges, setAnswerChanges] = useState(0);

  // Timing & Attempt records
  const startedAtRef = useRef<number>(Date.now());
  const scenarioStartRef = useRef<number>(Date.now());
  const attemptsRef = useRef<ScenarioAttempt[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results state
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
    saveError: string | null;
    isOffline?: boolean;
  } | null>(null);

  // Initialize Game
  const initGame = useCallback(async () => {
    // Load adaptive difficulty
    const diffRes = await getAdaptiveDifficulty('daily_life_challenge');
    setDifficulty(diffRes.difficultyLevel);
    setDifficultyChange(diffRes.change);
    setDifficultyMessage(diffRes.message);

    // 3 scenarios on easy, 4 scenarios on medium/hard
    const scCount = diffRes.difficultyLevel === 'easy' ? 3 : 4;
    setActiveScenarios(routineScenarios.slice(0, scCount));

    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsChecking(false);
    setStep('playing');
    setHintActive(false);
    setHintCount(0);
    setAnswerChanges(0);
    setResults(null);
    attemptsRef.current = [];
    startedAtRef.current = Date.now();
    scenarioStartRef.current = Date.now();
  }, [routineScenarios]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Elapsed ticker
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

  // Hint button: briefly highlights correct option and dims distractions
  const handleHint = () => {
    if (hintActive || isChecking) return;
    setHintCount((h) => h + 1);
    setHintActive(true);

    hintTimerRef.current = setTimeout(() => {
      setHintActive(false);
    }, 2500);
  };

  useEffect(() => () => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }, []);

  // Save session to backend
  const saveSession = useCallback(
    async (
      completedAt: Date,
      sessionDurationMs: number,
      attempts: ScenarioAttempt[],
      ac: number,
      hints: number
    ) => {
      setStep('saving');
      const correctCount = attempts.filter((a) => a.correct).length;
      const accuracyPct = Math.round((correctCount / totalScenarios) * 100);
      const avgResponseMs =
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / attempts.length)
          : 0;

      const body = {
        patientId: DEMO_PATIENT_ID,
        gameType: 'daily_life_challenge',
        questionId: null,
        responseTimeMs: avgResponseMs,
        sessionDurationMs,
        correct: correctCount === totalScenarios,
        hintUsed: hints > 0,
        answerChanges: ac,
        difficultyLevel: difficulty,
        startedAt: new Date(startedAtRef.current).toISOString(),
        completedAt: completedAt.toISOString(),
        timestamp: new Date(startedAtRef.current).toISOString(),
        metadataJson: JSON.stringify({
          totalScenarios,
          correctCount,
          accuracyPct,
          avgResponseMs,
          answerChanges: ac,
          hintCount: hints,
          difficultyLevel: difficulty,
          attemptsDetail: attempts,
        }),
      };

      const saveRes = await saveGameSession(body, 'Daily Life Challenge');

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
        saveError: saveRes.saveError,
        isOffline: saveRes.isOffline,
      });

      setStep('results');
    },
    [totalScenarios, difficulty]
  );

  // Handle Option Pick
  const handleOptionClick = (option: RoutineOption) => {
    if (isChecking || step !== 'playing') return;

    if (selectedOptionId && selectedOptionId !== option.id) {
      setAnswerChanges((c) => c + 1);
    }

    setSelectedOptionId(option.id);
    setIsChecking(true);

    const responseTimeMs = Date.now() - scenarioStartRef.current;
    const isCorrect = option.isCorrect;

    attemptsRef.current.push({
      scenarioId: currentScenario.id,
      responseTimeMs,
      correct: isCorrect,
      selectedOptionId: option.id,
    });

    // Advance after brief visual feedback
    setTimeout(() => {
      if (currentIndex < totalScenarios - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOptionId(null);
        setIsChecking(false);
        scenarioStartRef.current = Date.now();
      } else {
        const completedAt = new Date();
        const dur = Date.now() - startedAtRef.current;
        saveSession(completedAt, dur, attemptsRef.current, answerChanges, hintCount);
      }
    }, 1100);
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Results Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'results' && results) {
    const hesitation = hesitationLevel(results.answerChanges, results.hintCount);

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
              {t('game_daily_title', 'Daily Life Challenge')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Header Trophy */}
            <div className="flex flex-col items-center py-3">
              <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center mb-3 shadow-md">
                <Trophy className="w-10 h-10 text-[#0D5C4D]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center font-['Outfit']">
                {results.accuracyPct === 100
                  ? t('game_perfect_routine', 'Perfect Routine! 🌟')
                  : t('game_routine_complete', 'Routine Workout Complete! 👏')}
              </h1>
              <p className="text-xs text-slate-500 text-center mt-1 max-w-xs">
                {t('routine_score_summary', '{{correct}} of {{total}} daily living scenarios answered correctly.', {
                  correct: results.correctCount,
                  total: totalScenarios,
                })}
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  label: t('game_accuracy', 'Routine Accuracy'),
                  value: `${results.accuracyPct}%`,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                },
                {
                  icon: <Timer className="w-5 h-5" />,
                  label: t('game_session_time', 'Total Time'),
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

            {/* Breakdown Detail Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('routine_decision_hesitation', 'Decision Hesitation')}</span>
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
                <span className="font-semibold text-slate-600">{t('routine_option_adjustments', 'Option Adjustments')}</span>
                <span className="font-bold text-slate-800">
                  {t('routine_choice_changes', '{{count}} choice changes', { count: results.answerChanges })}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">{t('routine_adherence_confidence', 'Routine Adherence Confidence')}</span>
                <span className="font-bold text-emerald-700">
                  {results.accuracyPct >= 75
                    ? t('routine_conf_high', 'High (Independent)')
                    : t('routine_conf_mod', 'Moderate (Prompt Assisted)')}
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
                    Your daily routine score is safe on this device. Local ID:{' '}
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
                      <span className="font-semibold">Daily routine telemetry saved to database! </span>
                      <span className="text-[11px] block font-mono text-emerald-800">
                        Row ID: {results.postedSessionId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
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
  // Active Scenario Gameplay
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
            {t('game_daily_title', 'Daily Life Challenge')}
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

        {/* Progress Bar */}
        <div className="bg-white px-5 pb-3 pt-1 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>{t('routine_scenario_progress', 'Scenario Progress')}</span>
            <span className="font-bold text-[#0D5C4D]">
              {currentIndex + 1} / {totalScenarios}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D5C4D] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalScenarios) * 100}%` }}
            />
          </div>
        </div>

        {/* Scenario Card Prompt */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto max-w-2xl w-full mx-auto">
          {/* Time Badge & Question */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold font-mono">
                {currentScenario.timeIcon}
                <span>{currentScenario.timeOfDay}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {t('routine_daily_schedule', 'Daily Schedule')}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] leading-snug">
                {currentScenario.scenarioTitle}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentScenario.questionText}
              </p>
            </div>

            {/* Hint Notice if active */}
            {hintActive && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>{t('routine_caregiver_tip', 'Caregiver Routine Tip: ')}</strong>
                  {currentScenario.contextHint}
                </p>
              </div>
            )}
          </div>

          {/* 3 Large Action Option Cards */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('routine_choose_action', 'Choose the correct action:')}
            </span>

            {currentScenario.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.isCorrect;

              let cardStyles = `${option.bg} ${option.border} hover:shadow-md hover:scale-[1.01]`;

              if (isChecking && isSelected) {
                cardStyles = isCorrect
                  ? 'bg-emerald-100 border-emerald-500 scale-[1.02] shadow-md'
                  : 'bg-red-100 border-red-500 scale-[0.98] shadow-md';
              } else if (hintActive && isCorrect) {
                cardStyles = 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm';
              } else if (hintActive && !isCorrect) {
                cardStyles += ' opacity-40';
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  disabled={isChecking}
                  className={`w-full p-4 rounded-3xl border-2 transition-all text-left flex items-center justify-between shadow-soft-card group active:scale-95 ${cardStyles}`}
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Large Icon Target */}
                    <div
                      className={`w-12 h-12 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center flex-shrink-0 ${option.iconColor} group-hover:scale-105 transition`}
                    >
                      {option.icon}
                    </div>

                    <div className="space-y-0.5">
                      <span className={`text-sm font-bold block leading-tight ${option.textColor}`}>
                        {option.title}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Status Indicator */}
                  <div className="pl-2">
                    {isChecking && isSelected ? (
                      isCorrect ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                          <XCircle className="w-4 h-4 stroke-[3]" />
                        </div>
                      )
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 bg-white/60 flex items-center justify-center text-slate-400 group-hover:border-slate-400 transition" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Hint Bar */}
        <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handleHint}
            disabled={hintActive || isChecking}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              hintActive
                ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                : 'bg-[#FEF5E7] text-[#D97706] border border-[#FCE6C7] hover:bg-amber-100 active:scale-95'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {hintActive
                ? t('routine_showing_advice', 'Showing Advice…')
                : t('routine_hint_btn', 'Routine Hint ({{count}})', { count: hintCount })}
            </span>
          </button>

          <button
            type="button"
            onClick={initGame}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Restart Challenge"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default DailyLifeChallenge;
