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
  MoveHorizontal,
  HelpCircle,
  PartyPopper
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
interface StageCard {
  id: string;
  stepNumber: number; // 1, 2, 3, 4 (Correct chronological order)
  title: string;
  subtitle: string;
  imageUrl: string;
  iconText: string;
  accentBg: string;
  accentColor: string;
}

interface FestivalChallenge {
  id: string;
  festivalName: string;
  region: string;
  description: string;
  stages: StageCard[];
  options: string[]; // Options for follow-up question
}

type GameStep = 'sequence' | 'question' | 'saving' | 'results';

// ─────────────────────────────────────────────────────────────────────────────
// Festival Data (Rich Cultural Imagery & Clear Stage Labels)
// ─────────────────────────────────────────────────────────────────────────────
const FESTIVAL_CHALLENGES: FestivalChallenge[] = [
  {
    id: 'bihu',
    festivalName: 'Rongali Bihu',
    region: 'Assam & Northeast',
    description: 'Celebrating the harvest, new beginnings, and spring melody',
    stages: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Preparing',
        subtitle: 'Cleaning homes, crafting jaapi hats & decking cattle with garlands',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=600&auto=format&fit=crop',
        iconText: '🌾',
        accentBg: 'bg-amber-50',
        accentColor: 'text-amber-800',
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Bihu Dance',
        subtitle: 'Youth dance to rhythmic dhol drums, pepa horns & gogona beats',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        iconText: '🥁',
        accentBg: 'bg-red-50',
        accentColor: 'text-red-700',
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Traditional Food',
        subtitle: 'Sharing freshly baked pitha, coconut laru & jolpan with loved ones',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
        iconText: '🥟',
        accentBg: 'bg-emerald-50',
        accentColor: 'text-emerald-800',
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Celebration',
        subtitle: 'Community gatherings under banyan trees for elder blessings & joy',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop',
        iconText: '🎉',
        accentBg: 'bg-purple-50',
        accentColor: 'text-purple-800',
      },
    ],
    options: ['Rongali Bihu', 'Diwali', 'Holi', 'Durga Puja'],
  },
  {
    id: 'diwali',
    festivalName: 'Diwali',
    region: 'Pan-India',
    description: 'The triumph of light over darkness and knowledge over ignorance',
    stages: [
      {
        id: 'd1',
        stepNumber: 1,
        title: 'Cleaning & Rangoli',
        subtitle: 'Welcoming prosperity with colorful doorstep rangoli patterns',
        imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=600&auto=format&fit=crop',
        iconText: '🎨',
        accentBg: 'bg-rose-50',
        accentColor: 'text-rose-700',
      },
      {
        id: 'd2',
        stepNumber: 2,
        title: 'Lighting Diyas',
        subtitle: 'Illuminating pathways with golden clay oil lamps',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
        iconText: '🪔',
        accentBg: 'bg-amber-50',
        accentColor: 'text-amber-800',
      },
      {
        id: 'd3',
        stepNumber: 3,
        title: 'Lakshmi Puja',
        subtitle: 'Chanting hymns, offering marigold flowers and sweets for blessings',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=600&auto=format&fit=crop',
        iconText: '🙏',
        accentBg: 'bg-yellow-50',
        accentColor: 'text-yellow-800',
      },
      {
        id: 'd4',
        stepNumber: 4,
        title: 'Sharing Sweets',
        subtitle: 'Distributing kaju katli, laddus & exchanging warm family greetings',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
        iconText: '✨',
        accentBg: 'bg-orange-50',
        accentColor: 'text-orange-800',
      },
    ],
    options: ['Diwali', 'Bihu', 'Eid', 'Christmas'],
  },
  {
    id: 'durga_puja',
    festivalName: 'Durga Puja',
    region: 'Eastern India',
    description: 'Celebrating divine feminine energy, cultural harmony and joy',
    stages: [
      {
        id: 'dp1',
        stepNumber: 1,
        title: 'Mahalaya Dawn',
        subtitle: 'Awakening with Birendra Krishna Bhadra chandi recitation at 4 AM',
        imageUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600&auto=format&fit=crop',
        iconText: '🌅',
        accentBg: 'bg-blue-50',
        accentColor: 'text-blue-800',
      },
      {
        id: 'dp2',
        stepNumber: 2,
        title: 'Bodhan & Welcome',
        subtitle: 'Unveiling artistic clay idols under illuminated majestic pandals',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        iconText: '🏛️',
        accentBg: 'bg-red-50',
        accentColor: 'text-red-800',
      },
      {
        id: 'dp3',
        stepNumber: 3,
        title: 'Dhunuchi Dance',
        subtitle: 'Rhythmic incense dance to thunderous dhak beats on Ashtami evening',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop',
        iconText: '🔥',
        accentBg: 'bg-amber-50',
        accentColor: 'text-amber-800',
      },
      {
        id: 'dp4',
        stepNumber: 4,
        title: 'Sindoor Khela',
        subtitle: 'Bidding farewell on Dashami with red vermilion and sweet mishti',
        imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=600&auto=format&fit=crop',
        iconText: '🌺',
        accentBg: 'bg-rose-50',
        accentColor: 'text-rose-800',
      },
    ],
    options: ['Durga Puja', 'Holi', 'Lohri', 'Onam'],
  },
];

// Helper functions
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
  if (score <= 1) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
  if (score <= 4) return { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
  return { label: 'High', color: 'text-red-700', bg: 'bg-red-50 border-red-100' };
}

export const FestivalMemories: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStageTitle = useCallback((stage: StageCard) => {
    const key = `fest_stage_${stage.id}_title`;
    const translated = t(key);
    return translated !== key ? translated : stage.title;
  }, [t]);

  const getStageSubtitle = useCallback((stage: StageCard) => {
    const key = `fest_stage_${stage.id}_sub`;
    const translated = t(key);
    return translated !== key ? translated : stage.subtitle;
  }, [t]);

  const getFestName = useCallback((name: string) => {
    const key = `fest_opt_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const translated = t(key);
    return translated !== key ? translated : name;
  }, [t]);

  // Adaptive difficulty
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  // Challenge selection
  const [challengeIndex, setChallengeIndex] = useState(0);
  const challenge = FESTIVAL_CHALLENGES[challengeIndex];

  // Game step & status
  const [step, setStep] = useState<GameStep>('sequence');
  const [elapsed, setElapsed] = useState(0);
  
  // Card slot states: array of StageCards currently placed in slots
  const [placedSlots, setPlacedSlots] = useState<(StageCard | null)[]>([]);
  const [availableCards, setAvailableCards] = useState<StageCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Question stage state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState(false);

  // Hint & Telemetry tracking
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [answerChanges, setAnswerChanges] = useState(0);

  // Timers & Refs
  const startedAtRef = useRef<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results state
  const [results, setResults] = useState<{
    startedAt: string;
    completedAt: string;
    sessionDurationMs: number;
    accuracyPct: number;
    avgResponseMs: number;
    answerChanges: number;
    hintCount: number;
    sequenceCorrect: boolean;
    questionCorrect: boolean;
    overallCorrect: boolean;
    difficultyLevel: DifficultyLevel;
    postedSessionId: string | null;
    saveError: string | null;
    isOffline?: boolean;
  } | null>(null);

  // Initialize new game session
  const initGame = useCallback(async (festIdx = 0) => {
    setChallengeIndex(festIdx);
    const chosen = FESTIVAL_CHALLENGES[festIdx];
    
    // Fetch adaptive difficulty
    const diffRes = await getAdaptiveDifficulty('festival_memories');
    setDifficulty(diffRes.difficultyLevel);
    setDifficultyChange(diffRes.change);
    setDifficultyMessage(diffRes.message);

    // easy: 3 stages, medium/hard: 4 stages
    const stageCount = diffRes.difficultyLevel === 'easy' ? 3 : 4;
    const activeStages = chosen.stages.slice(0, stageCount);

    setAvailableCards(shuffleArray(activeStages));
    setPlacedSlots(new Array(stageCount).fill(null));
    setSelectedCardId(null);
    setSelectedOption(null);
    setIsQuestionSubmitted(false);
    setHintActive(false);
    setHintCount(0);
    setAnswerChanges(0);
    setStep('sequence');
    setResults(null);

    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    initGame(0);
  }, [initGame]);

  // Elapsed time counter
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

  // Handle placing a card into the next open slot or targeted slot
  const handleSelectCard = (card: StageCard) => {
    const firstEmptyIndex = placedSlots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      const nextSlots = [...placedSlots];
      nextSlots[firstEmptyIndex] = card;
      setPlacedSlots(nextSlots);
      setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
      setAnswerChanges((c) => c + 1);
    }
  };

  // Handle clicking a placed slot to return it to the available pool
  const handleRemoveFromSlot = (slotIdx: number) => {
    const card = placedSlots[slotIdx];
    if (!card) return;
    const nextSlots = [...placedSlots];
    nextSlots[slotIdx] = null;
    setPlacedSlots(nextSlots);
    setAvailableCards((prev) => [...prev, card]);
    setAnswerChanges((c) => c + 1);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (placedSlots[slotIdx]) {
      handleRemoveFromSlot(slotIdx);
    }
  };

  // Hint button
  const handleHint = () => {
    if (hintActive) return;
    setHintCount((h) => h + 1);
    setHintActive(true);

    if (step === 'sequence') {
      const targetSlot = placedSlots.findIndex((s, idx) => s?.stepNumber !== idx + 1);
      if (targetSlot !== -1) {
        const correctStageNumber = targetSlot + 1;
        const correctCard = challenge.stages.find((s) => s.stepNumber === correctStageNumber);
        
        if (correctCard) {
          const currentPlacedSlot = placedSlots.findIndex((s) => s?.id === correctCard.id);
          const newSlots = [...placedSlots];
          if (currentPlacedSlot !== -1) {
            newSlots[currentPlacedSlot] = null;
          }
          newSlots[targetSlot] = correctCard;
          setPlacedSlots(newSlots);
          setAvailableCards((prev) => prev.filter((c) => c.id !== correctCard.id));
        }
      }
    }

    hintTimerRef.current = setTimeout(() => {
      setHintActive(false);
    }, 2000);
  };

  useEffect(() => () => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }, []);

  // Submit Sequence and proceed to Follow-up Question
  const handleConfirmSequence = () => {
    if (placedSlots.some((s) => s === null)) return;
    setStep('question');
  };

  // Save session and compute metrics
  const handleFinishGame = async (chosenOption: string) => {
    setSelectedOption(chosenOption);
    setIsQuestionSubmitted(true);
    setStep('saving');

    const completedAt = new Date();
    const sessionDurationMs = Date.now() - startedAtRef.current;

    // Check sequence accuracy: 1, 2, 3, 4
    const isSequenceCorrect = placedSlots.every((card, idx) => card?.stepNumber === idx + 1);
    const isQuestionCorrect = chosenOption === challenge.festivalName;
    const overallCorrect = isSequenceCorrect && isQuestionCorrect;

    let accuracyScore = 0;
    const totalSlots = placedSlots.length;
    if (isSequenceCorrect) accuracyScore += 60;
    else {
      const correctSlots = placedSlots.filter((c, idx) => c?.stepNumber === idx + 1).length;
      accuracyScore += Math.round((correctSlots / (totalSlots || 1)) * 60);
    }
    if (isQuestionCorrect) accuracyScore += 40;

    const body = {
      patientId: DEMO_PATIENT_ID,
      gameType: 'festival_memories',
      questionId: challenge.id,
      responseTimeMs: sessionDurationMs,
      sessionDurationMs,
      correct: overallCorrect,
      hintUsed: hintCount > 0,
      answerChanges,
      difficultyLevel: difficulty,
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      timestamp: new Date(startedAtRef.current).toISOString(),
      metadataJson: JSON.stringify({
        festivalId: challenge.id,
        festivalName: challenge.festivalName,
        isSequenceCorrect,
        isQuestionCorrect,
        accuracyPct: accuracyScore,
        hintCount,
        answerChanges,
        difficultyLevel: difficulty,
        placedSequence: placedSlots.map((s) => s?.title),
      }),
    };

    const saveRes = await saveGameSession(body, 'Festival Memories');

    setResults({
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      sessionDurationMs,
      accuracyPct: accuracyScore,
      avgResponseMs: Math.round(sessionDurationMs / (placedSlots.length + 1 || 1)),
      answerChanges,
      hintCount,
      sequenceCorrect: isSequenceCorrect,
      questionCorrect: isQuestionCorrect,
      overallCorrect,
      difficultyLevel: difficulty,
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

  const allSlotsFilled = placedSlots.every((s) => s !== null);

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
              {t('game_fest_title', 'Festival Memories')}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Celebration Header */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mb-3 shadow-md">
                <PartyPopper className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center font-['Outfit']">
                {results.overallCorrect ? t('game_wonderful_recall', 'Wonderful Recall! 🎉') : t('game_well_played', 'Well Played! 👏')}
              </h1>
              <p className="text-xs text-slate-500 text-center mt-1 max-w-xs">
                {results.overallCorrect
                  ? `${t('game_arranged_all_stages', 'You arranged all stages in the perfect sequence!')}`
                  : `${t('game_completed_fest_journey', 'You completed the festival celebration journey.')}`}
              </p>
            </div>

            {/* 4 Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  label: t('game_accuracy', 'Accuracy'),
                  value: `${results.accuracyPct}%`,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                },
                {
                  icon: <Timer className="w-5 h-5" />,
                  label: t('game_time_taken', 'Time Taken'),
                  value: formatMs(results.sessionDurationMs),
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  border: 'border-blue-100',
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  label: t('game_step_latency', 'Step Latency'),
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
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{t('fest_seq_order', 'Sequence Order')}</span>
                <span className={`text-xs font-bold ${results.sequenceCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {results.sequenceCorrect ? `✅ 100% ${t('game_correct', 'Correct')}` : `⚠️ ${t('fest_partial_match', 'Partial Match')}`}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{t('fest_identification', 'Festival Identification')}</span>
                <span className={`text-xs font-bold ${results.questionCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {results.questionCorrect ? `✅ ${t('game_correct', 'Correct')}` : `❌ ${t('fest_missed', 'Missed')}`}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{t('game_hesitation_level', 'Hesitation Level')}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${hesitation.bg} ${hesitation.color}`}>
                  {hesitation.label}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{t('game_difficulty', 'Difficulty')}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 capitalize">
                  {results.difficultyLevel || difficulty}
                </span>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{t('fest_swaps', 'Swaps & Adjustments')}</span>
                <span className="text-xs font-medium text-slate-700">{results.answerChanges} {t('common_times', 'times')}</span>
              </div>
            </div>

            {/* Save Status / Offline Queue Banner */}
            {results.isOffline ? (
              <div className="rounded-2xl p-3.5 text-xs flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-900">
                <RotateCcw className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold block">{t('game_saved_offline', 'Saved locally in offline queue 📦')}</span>
                  <span className="text-[11px] text-amber-800">
                    {t('game_offline_notice', 'Your session is saved safely and will automatically sync once connected.')}
                    <code className="font-mono text-[10px] break-all block mt-0.5">{results.postedSessionId}</code>
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
                      <span className="font-semibold">{t('game_not_saved', 'Session not saved')} — </span>
                      {results.saveError}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{t('game_saved_db', 'Session telemetry saved to database!')} </span>
                      <span className="text-[11px] block font-mono text-emerald-800">
                        ID: {results.postedSessionId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1 pb-4">
              <button
                type="button"
                onClick={() => initGame((challengeIndex + 1) % FESTIVAL_CHALLENGES.length)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> {t('fest_next_festival', 'Next Festival')}
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
  // Step 2: Follow-up Identification Question
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'question') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          {/* Header */}
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => setStep('sequence')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('fest_identify_title', 'Step 2 of 2: Identify Festival')}
            </span>
            <div className="flex items-center gap-1.5 text-[#0D5C4D]">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs font-bold tabular-nums">{formatMs(elapsed)}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-5 space-y-6 overflow-y-auto">
            {/* Header prompt */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('fest_seq_completed', 'Sequence Completed!')}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                {t('fest_what_is_this', 'What festival is this?')}
              </h2>
              <p className="text-xs text-slate-500">
                {challenge.description}
              </p>
            </div>

            {/* Sequence mini summary preview */}
            <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              {placedSlots.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-1">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                    <img src={stage?.imageUrl} alt={stage ? getStageTitle(stage) : ''} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">
                    {idx + 1}. {stage ? getStageTitle(stage) : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {challenge.options.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setAnswerChanges((c) => c + 1);
                      handleFinishGame(opt);
                    }}
                    className={`py-4 px-4 rounded-2xl border-2 text-sm font-bold transition-all text-left flex items-center justify-between shadow-sm ${
                      isSelected
                        ? 'bg-[#0D5C4D] text-white border-[#0D5C4D] scale-[1.01]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{getFestName(opt)}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Drag & Arrange 4 Sequence Stages
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
            {t('game_fest_title', 'Festival Memories')}
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

        {/* Instructions banner */}
        <div className="bg-white px-5 py-3 border-b border-slate-100 space-y-1">
          <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
            {t('fest_arrange_title', 'Arrange in Chronological Order (1 → {{count}})', { count: placedSlots.length })}
          </h2>
          <p className="text-xs text-slate-500">
            {t('fest_arrange_sub', 'Tap the cards below to place them in order of celebration stages.')}
          </p>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto max-w-2xl w-full mx-auto">
          {/* Target Sequence Slot Area */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('fest_timeline_slots', 'Timeline Slots (1 to 4):')}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {placedSlots.map((slot, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(idx)}
                  className={`min-h-[120px] rounded-2xl p-2.5 border-2 transition-all flex flex-col justify-between cursor-pointer relative ${
                    slot
                      ? 'bg-white border-teal-600 shadow-sm'
                      : 'bg-slate-50/90 border-dashed border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {slot && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
                        {t('fest_tap_remove', 'Tap to remove')}
                      </span>
                    )}
                  </div>

                  {slot ? (
                    <div className="space-y-1.5 mt-2">
                      <div className="w-full h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={slot.imageUrl} alt={getStageTitle(slot)} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {getStageTitle(slot)}
                      </span>
                    </div>
                  ) : (
                    <div className="h-14 flex items-center justify-center text-center">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {t('fest_slot', 'Slot')} {idx + 1} {t('fest_empty', 'Empty')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Cards Pool to Tap */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('fest_available_cards', 'Available Stage Cards ({{count}}):', { count: availableCards.length })}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card)}
                  className="bg-white hover:bg-slate-50/80 rounded-2xl p-3 border border-slate-200 shadow-soft-card text-left transition-all active:scale-95 group flex flex-col justify-between"
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 mb-2 relative">
                    <img src={card.imageUrl} alt={getStageTitle(card)} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                      {card.iconText}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {getStageTitle(card)}
                    </span>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                      {getStageSubtitle(card)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar with Hint & Submit Sequence */}
        <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handleHint}
            disabled={hintActive}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              hintActive
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-[#FEF5E7] text-[#D97706] border border-[#FCE6C7] hover:bg-amber-100 active:scale-95'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{hintActive ? t('fest_autofilling', 'Auto-filling Slot…') : `${t('game_hint', 'Hint')} (${hintCount})`}</span>
          </button>

          <button
            type="button"
            disabled={!allSlotsFilled}
            onClick={handleConfirmSequence}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D5C4D] hover:bg-[#0a4a3d] text-white text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <span>{t('fest_confirm_seq', 'Confirm Sequence')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default FestivalMemories;
