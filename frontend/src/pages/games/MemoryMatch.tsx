/**
 * Memory Match — /games/memory-match
 *
 * Tracks per the spec:
 *   • responseTimeMs   — ms from first card flip to second card flip (per attempt)
 *   • correct          — whether the pair matched
 *   • hintUsed         — button that briefly reveals all unmatched cards for 1.5 s
 *   • answerChanges    — count of mismatched attempts (proxy for re-selection)
 *
 * On completion POSTs a full GameSession to /api/game-sessions.
 * DEMO_PATIENT_ID comes from frontend/src/config.ts.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { MobileContainer } from '../../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../../components/design-system/BottomNavBar';
import { AdaptiveDifficultyNotice } from '../../components/AdaptiveDifficultyNotice';
import { getAdaptiveDifficulty, DifficultyLevel } from '../../utils/adaptiveDifficulty';
import { saveGameSession } from '../../utils/gameSessionSync';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// Card data — 6 available categories for adaptive difficulty & fallback
// ─────────────────────────────────────────────────────────────────────────────
interface CardDef {
  pairId: string;
  category: string;
  label: string;
  emoji?: string;
  photoUrl?: string | null;
  bg: string;
  iconColor: string;
}

const ALL_CARD_PAIRS: CardDef[] = [
  { pairId: 'family',   category: 'Family',   label: 'Family',         emoji: '👨‍👩‍👧', bg: '#FDEEE9', iconColor: '#E05345' },
  { pairId: 'festival', category: 'Festival', label: 'Festival',       emoji: '🪔',    bg: '#FEF5E7', iconColor: '#D97706' },
  { pairId: 'food',     category: 'Food',     label: 'Favourite Food', emoji: '🍛',    bg: '#EAF6F4', iconColor: '#0D5C4D' },
  { pairId: 'place',    category: 'Place',    label: 'Special Place',  emoji: '🕌',    bg: '#F3EEF9', iconColor: '#7C3AED' },
  { pairId: 'music',    category: 'Music',    label: 'Indian Raga',    emoji: '🎵',    bg: '#EDF5FE', iconColor: '#2563EB' },
  { pairId: 'nature',   category: 'Nature',   label: 'Peacock & Park', emoji: '🦚',    bg: '#EAF8F1', iconColor: '#059669' },
];

interface MemoryItem {
  id: string;
  photoUrl: string | null;
  personName: string | null;
  relationship: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GameCard {
  id: string;
  pairId: string;
  label: string;
  emoji?: string;
  photoUrl?: string | null;
  bg: string;
  iconColor: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface AttemptRecord {
  responseTimeMs: number;
  correct: boolean;
}

type GamePhase = 'playing' | 'saving' | 'results';

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

async function buildShuffledDeckWithMemories(level: DifficultyLevel): Promise<GameCard[]> {
  let realPairs: CardDef[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
    if (res.ok) {
      const data: MemoryItem[] = await res.json();
      const valid = data.filter(m => Boolean(m.photoUrl));
      realPairs = valid.map(m => ({
        pairId: m.id,
        category: m.relationship || 'Memory',
        label: m.personName || m.relationship || 'Memory',
        photoUrl: m.photoUrl,
        bg: '#F8FAFC',
        iconColor: '#0D5C4D'
      }));
    }
  } catch (e) {
    console.error('Failed to fetch memories for MemoryMatch:', e);
  }

  const neededPairsCount = level === 'easy' ? 3 : level === 'medium' ? 4 : 6;
  
  let chosenPairs: CardDef[] = [];
  if (realPairs.length >= neededPairsCount) {
    chosenPairs = shuffleArray(realPairs).slice(0, neededPairsCount);
  } else {
    const neededPlaceholderCount = neededPairsCount - realPairs.length;
    chosenPairs = [...realPairs, ...ALL_CARD_PAIRS.slice(0, neededPlaceholderCount)];
  }

  const cards: GameCard[] = [];
  chosenPairs.forEach((def) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${def.pairId}_${i}`,
        pairId: def.pairId,
        label: def.label,
        emoji: def.emoji || '📸',
        photoUrl: def.photoUrl,
        bg: def.bg,
        iconColor: def.iconColor,
        isFlipped: false,
        isMatched: false,
      });
    }
  });

  return shuffleArray(cards);
}

function buildShuffledDeckFallback(level: DifficultyLevel): GameCard[] {
  const neededPairs = level === 'easy' ? ALL_CARD_PAIRS.slice(0, 3) : level === 'medium' ? ALL_CARD_PAIRS.slice(0, 4) : ALL_CARD_PAIRS.slice(0, 6);
  const cards: GameCard[] = [];
  neededPairs.forEach((def) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${def.pairId}_${i}`,
        pairId: def.pairId,
        label: def.label,
        emoji: def.emoji || '📸',
        photoUrl: null,
        bg: def.bg,
        iconColor: def.iconColor,
        isFlipped: false,
        isMatched: false,
      });
    }
  });
  return shuffleArray(cards);
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s % 60}s`;
}

function hesitationLevel(answerChanges: number, hintCount: number) {
  const score = answerChanges + hintCount * 2;
  if (score === 0) return { label: 'Low',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
  if (score <= 3)  return { label: 'Medium', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100'   };
  return              { label: 'High',   color: 'text-red-700',     bg: 'bg-red-50 border-red-100'       };
}

// ─────────────────────────────────────────────────────────────────────────────
// MemoryCard sub-component — CSS 3-D flip
// ─────────────────────────────────────────────────────────────────────────────
interface MemoryCardProps {
  card: GameCard;
  isSelected: boolean;
  isHintRevealed: boolean;
  disabled: boolean;
  onClick: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, isSelected, isHintRevealed, disabled, onClick }) => {
  const { t } = useTranslation();
  const showFront = card.isFlipped || card.isMatched || isHintRevealed;
  const localizedLabel = t(`cat_${card.pairId}`, card.label);

  return (
    <button
      id={`card-${card.id}`}
      type="button"
      disabled={disabled || card.isMatched}
      onClick={() => onClick(card.id)}
      className="relative w-full select-none focus:outline-none cursor-pointer"
      style={{ perspective: '600px', aspectRatio: '1' }}
      aria-label={showFront ? localizedLabel : 'Hidden card'}
    >
      <div
        className="w-full h-full relative transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: showFront ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Back face */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-md border-2 transition-all duration-200
            ${isSelected ? 'border-[#0D5C4D] bg-[#EAF6F4] shadow-lg scale-[1.04]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'}
            ${disabled && !isSelected ? 'opacity-70' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl opacity-30">🪷</span>
          {isSelected && (
            <span className="absolute inset-0 rounded-2xl border-2 border-[#0D5C4D] animate-ping opacity-30" />
          )}
        </div>

        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-md border-2 transition-all duration-200
            ${card.isMatched ? 'border-emerald-500 ring-2 ring-emerald-300 opacity-85 scale-[0.98]' : 'border-slate-200'}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: card.bg }}
        >
          {card.photoUrl ? (
            <div className="w-full h-full relative">
              <img src={card.photoUrl} alt={card.label} className="w-full h-full object-cover block" />
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-[2px] py-1 px-1 text-center">
                <span className="text-[10px] font-bold text-white block truncate leading-tight">
                  {localizedLabel}
                </span>
              </div>
            </div>
          ) : (
            <>
              <span className="text-3xl leading-none">{card.emoji}</span>
              <span className="text-[10px] font-bold mt-0.5 px-1 text-center leading-tight" style={{ color: card.iconColor }}>
                {localizedLabel}
              </span>
            </>
          )}

          {card.isMatched && (
            <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main MemoryMatch component
// ─────────────────────────────────────────────────────────────────────────────
export const MemoryMatch: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  const [deck, setDeck] = useState<GameCard[]>(() => buildShuffledDeckFallback('easy'));
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const startedAtRef = useRef<number>(Date.now());
  const attemptStartRef = useRef<number | null>(null);
  const attemptsRef = useRef<AttemptRecord[]>([]);
  const answerChangesRef = useRef(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [results, setResults] = useState<{
    startedAt: string;
    completedAt: string;
    sessionDurationMs: number;
    accuracyPct: number;
    avgResponseMs: number;
    totalAttempts: number;
    correctMatches: number;
    answerChanges: number;
    hintCount: number;
    difficultyLevel: DifficultyLevel;
    postedSessionId: string | null;
    saveError: string | null;
    isOffline?: boolean;
  } | null>(null);

  const totalPairs = deck.length / 2;
  const matchedCount = useMemo(() => deck.filter((c) => c.isMatched).length / 2, [deck]);
  const isGameComplete = totalPairs > 0 && matchedCount === totalPairs;

  // Load adaptive difficulty and real deck on mount
  useEffect(() => {
    const loadDifficultyAndDeck = async () => {
      const res = await getAdaptiveDifficulty('memory_match');
      setDifficulty(res.difficultyLevel);
      setDifficultyChange(res.change);
      setDifficultyMessage(res.message);
      const newDeck = await buildShuffledDeckWithMemories(res.difficultyLevel);
      setDeck(newDeck);
    };
    loadDifficultyAndDeck();
  }, []);

  // Elapsed ticker
  useEffect(() => {
    if (phase !== 'playing') { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => setElapsed(Date.now() - startedAtRef.current), 500);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase]);

  // Restart handler
  const handleRestart = useCallback(async () => {
    const newDeck = await buildShuffledDeckWithMemories(difficulty);
    setDeck(newDeck);
    setSelectedIds([]);
    setIsChecking(false);
    setHintActive(false);
    setHintCount(0);
    setElapsed(0);
    setPhase('playing');
    setResults(null);
    attemptsRef.current = [];
    answerChangesRef.current = 0;
    attemptStartRef.current = null;
    startedAtRef.current = Date.now();
  }, [difficulty]);

  // Save session
  const saveSession = useCallback(async (completedAt: Date, sessionDurationMs: number, attempts: AttemptRecord[], ac: number, hints: number) => {
    setPhase('saving');
    const correct = attempts.filter((a) => a.correct).length;
    const accuracyPct = attempts.length > 0 ? Math.round((totalPairs / attempts.length) * 1000) / 10 : 0;
    const avgResponseMs = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.responseTimeMs, 0) / attempts.length) : 0;

    const body = {
      patientId: DEMO_PATIENT_ID,
      gameType: 'memory_match',
      questionId: null,
      responseTimeMs: avgResponseMs,
      sessionDurationMs,
      correct: correct === totalPairs,
      hintUsed: hints > 0,
      answerChanges: ac,
      difficultyLevel: difficulty,
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      timestamp: new Date(startedAtRef.current).toISOString(),
      metadataJson: JSON.stringify({
        totalAttempts: attempts.length,
        correctMatches: totalPairs,
        hintCount: hints,
        accuracyPct,
        avgResponseMs,
        answerChanges: ac,
        pairsTotal: totalPairs,
        difficultyLevel: difficulty,
        attemptsDetail: attempts,
      }),
    };

    const saveRes = await saveGameSession(body, 'Memory Match');

    setResults({
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      sessionDurationMs,
      accuracyPct,
      avgResponseMs,
      totalAttempts: attempts.length,
      correctMatches: totalPairs,
      answerChanges: ac,
      hintCount: hints,
      difficultyLevel: difficulty,
      postedSessionId: saveRes.postedSessionId,
      saveError: saveRes.saveError,
      isOffline: saveRes.isOffline,
    });
    setPhase('results');
  }, [totalPairs, difficulty]);

  // Watch completion
  useEffect(() => {
    if (isGameComplete && phase === 'playing') {
      const completedAt = new Date();
      const dur = Date.now() - startedAtRef.current;
      const t = setTimeout(() => void saveSession(completedAt, dur, attemptsRef.current, answerChangesRef.current, hintCount), 700);
      return () => clearTimeout(t);
    }
  }, [isGameComplete, phase, saveSession, hintCount]);

  // Hint handler
  const handleHint = useCallback(() => {
    if (hintActive || isChecking) return;
    setHintCount((n) => n + 1);
    setHintActive(true);
    hintTimerRef.current = setTimeout(() => setHintActive(false), 1500);
  }, [hintActive, isChecking]);

  useEffect(() => () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); }, []);

  // Card tap
  const handleCardTap = useCallback((tappedId: string) => {
    if (isChecking || phase !== 'playing') return;
    const tapped = deck.find((c) => c.id === tappedId);
    if (!tapped || tapped.isMatched || tapped.isFlipped) return;

    if (selectedIds.length === 0) {
      attemptStartRef.current = Date.now();
      setDeck((prev) => prev.map((c) => c.id === tappedId ? { ...c, isFlipped: true } : c));
      setSelectedIds([tappedId]);
      return;
    }

    if (selectedIds.length === 1) {
      const firstId = selectedIds[0];
      if (tappedId === firstId) {
        setDeck((prev) => prev.map((c) => c.id === tappedId ? { ...c, isFlipped: false } : c));
        setSelectedIds([]);
        attemptStartRef.current = null;
        return;
      }

      const responseTimeMs = attemptStartRef.current ? Date.now() - attemptStartRef.current : 0;
      attemptStartRef.current = null;

      setDeck((prev) => prev.map((c) => c.id === tappedId ? { ...c, isFlipped: true } : c));
      setIsChecking(true);

      setTimeout(() => {
        const first = deck.find((c) => c.id === firstId);
        const second = deck.find((c) => c.id === tappedId);
        const isMatch = first?.pairId === second?.pairId;

        attemptsRef.current.push({ responseTimeMs, correct: isMatch });

        if (isMatch) {
          setDeck((prev) => prev.map((c) => c.id === firstId || c.id === tappedId ? { ...c, isFlipped: true, isMatched: true } : c));
        } else {
          answerChangesRef.current += 1;
          setDeck((prev) => prev.map((c) => c.id === firstId || c.id === tappedId ? { ...c, isFlipped: false } : c));
        }

        setSelectedIds([]);
        setIsChecking(false);
      }, 900);
    }
  }, [deck, isChecking, phase, selectedIds]);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    const hesitation = hesitationLevel(results.answerChanges, results.hintCount);
    const allCorrect = results.correctMatches === totalPairs;

    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button type="button" onClick={() => navigate('/games')} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('game_match_title', 'Memory Match')}</span>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Trophy hero */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mb-3 shadow-md">
                {allCorrect ? <Trophy className="w-10 h-10 text-amber-500" /> : <Sparkles className="w-10 h-10 text-teal-500" />}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center">{allCorrect ? t('game_well_done', 'Well done! 🎉') : t('game_good_effort', 'Good effort!')}</h1>
              <p className="text-sm text-slate-500 text-center mt-1">
                {allCorrect ? t('game_all_pairs_found_sub', 'You found all the pairs!') : t('game_keep_practising', 'Keep practising — memory grows stronger!')}
              </p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <CheckCircle2 className="w-5 h-5" />, label: t('game_accuracy', 'Accuracy'),     value: `${results.accuracyPct}%`,        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { icon: <Timer       className="w-5 h-5" />, label: t('game_time_taken', 'Time Taken'),    value: formatMs(results.sessionDurationMs), color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
                { icon: <Zap         className="w-5 h-5" />, label: t('game_avg_response', 'Avg Response'),  value: formatMs(results.avgResponseMs),    color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
                { icon: <Eye         className="w-5 h-5" />, label: t('game_hints_used', 'Hints Used'),    value: String(results.hintCount),          color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100'  },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex flex-col gap-1.5`}>
                  <div className={stat.color}>{stat.icon}</div>
                  <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Detail rows */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
              {[
                { label: t('game_hesitation_level', 'Hesitation Level'), value: <span className={`text-xs font-bold px-3 py-1 rounded-full border ${hesitation.bg} ${hesitation.color}`}>{hesitation.label}</span> },
                { label: t('game_difficulty', 'Difficulty'),        value: <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 capitalize">{results.difficultyLevel || difficulty}</span> },
                { label: t('game_attempts', 'Attempts'),          value: <span className="text-xs font-medium text-slate-700">{results.correctMatches} {t('game_correct', 'correct')} / {results.totalAttempts} {t('game_tries', 'tries')}</span> },
                { label: t('game_answer_changes', 'Answer Changes'),    value: <span className="text-xs font-medium text-slate-700">{results.answerChanges}</span> },
              ].map((row, i) => (
                <React.Fragment key={row.label}>
                  {i > 0 && <div className="h-px bg-slate-100" />}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{row.label}</span>
                    {row.value}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Save confirmation / Offline Queue Notice */}
            {results.isOffline ? (
              <div className="rounded-2xl p-4 text-xs flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-900">
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
              <div className={`rounded-2xl p-4 text-xs flex items-start gap-2.5 ${results.saveError ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
                {results.saveError
                  ? <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  {results.saveError ? (
                    <><span className="font-semibold">{t('game_not_saved', 'Session not saved')} — </span>{results.saveError}</>
                  ) : (
                    <><span className="font-semibold">{t('game_saved_db', 'Session saved to database!')} </span>Row ID: <code className="font-mono text-[10px] break-all">{results.postedSessionId}</code></>
                  )}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 pb-2">
              <button id="memory-match-play-again" type="button" onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors active:scale-95">
                <RotateCcw className="w-4 h-4" /> {t('game_play_again', 'Play Again')}
              </button>
              <button id="memory-match-back-to-games" type="button" onClick={() => navigate('/games')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                <ArrowLeft className="w-4 h-4" /> {t('game_all_games', 'All Games')}
              </button>
            </div>
          </div>
        </div>
        <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
      </MobileContainer>
    );
  }

  // ── Saving screen ─────────────────────────────────────────────────────────
  if (phase === 'saving') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center gap-5 p-8">
          <div className="w-16 h-16 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8 text-[#0D5C4D] animate-bounce" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{t('game_all_pairs_found', 'All pairs found!')}</h2>
            <p className="text-sm text-slate-500">{t('game_saving_session', 'Saving your session…')}</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0D5C4D] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </MobileContainer>
    );
  }

  // ── Game board ────────────────────────────────────────────────────────────
  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button type="button" onClick={() => navigate('/games')} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('game_match_title', 'Memory Match')}</span>
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

        {/* Progress bar */}
        <div className="bg-white px-5 pb-3 pt-1 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>{t('pairs_found', 'Pairs found')}</span>
            <span className="font-bold text-[#0D5C4D]">{matchedCount} / {totalPairs}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0D5C4D] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(matchedCount / totalPairs) * 100}%` }} />
          </div>
        </div>

        {/* Instruction */}
        <div className="bg-[#FAF7F2] px-5 pt-3 pb-1">
          <p className="text-[11px] text-slate-500 text-center">
            {t('match_instruction', 'Tap two cards to find matching pairs.')}{' '}
            <span className="text-[#0D5C4D] font-semibold">{totalPairs - matchedCount} {t('pairs_remaining', 'pairs remaining')}</span>
          </p>
        </div>

        {/* Card grid: 2 cols on mobile, 3-4 cols on tablet and desktop */}
        <div className="flex-1 px-4 py-4 max-w-2xl w-full mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {deck.map((card) => (
              <MemoryCard
                key={card.id}
                card={card}
                isSelected={selectedIds.includes(card.id)}
                isHintRevealed={hintActive && !card.isMatched}
                disabled={isChecking || (selectedIds.length === 2 && !selectedIds.includes(card.id))}
                onClick={handleCardTap}
              />
            ))}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
          {/* Hint button */}
          <button id="memory-match-hint-btn" type="button" onClick={handleHint} disabled={hintActive || isChecking}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${hintActive
                ? 'bg-amber-100 text-amber-700 border border-amber-200 cursor-not-allowed'
                : 'bg-[#FEF5E7] text-[#D97706] border border-[#FCE6C7] hover:bg-amber-100 active:scale-95'}`}>
            <Eye className="w-3.5 h-3.5" />
            {hintActive ? t('game_showing', 'Showing…') : `${t('game_hint', 'Hint')} (${hintCount})`}
          </button>

          {/* Live attempt stats */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-slate-700">{attemptsRef.current.filter((a) => a.correct).length}</span>
              <span>{t('game_right', 'right')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold text-slate-700">{attemptsRef.current.filter((a) => !a.correct).length}</span>
              <span>{t('game_wrong', 'wrong')}</span>
            </div>
          </div>

          {/* Restart */}
          <button id="memory-match-restart-btn" type="button" onClick={handleRestart}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="Restart game">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="games" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default MemoryMatch;
