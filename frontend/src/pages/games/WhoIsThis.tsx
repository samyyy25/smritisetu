import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, CheckCircle2, RotateCcw, Sparkles, Timer, Trophy, XCircle, Zap, Eye, Loader2, Heart, HelpCircle, Film
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
interface Memory {
  id: string;
  photoUrl: string | null;
  videoUrl?: string | null;
  mediaType?: 'photo' | 'video';
  personName: string | null;
  relationship: string | null;
}

interface Question {
  id: string;
  photoUrl: string;
  videoUrl?: string | null;
  mediaType?: 'photo' | 'video';
  personName: string;
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
  personName: string;
}

type GamePhase = 'loading' | 'error' | 'playing' | 'saving' | 'results';

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Data (Only used if patient has < 4 real memories in DB)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_MEMORIES: Memory[] = [
  { id: 'f1', photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600&auto=format&fit=crop', personName: 'Dr. Sharma', relationship: 'Doctor' },
  { id: 'f2', photoUrl: 'https://images.unsplash.com/photo-1506863530036-1ef0d464f158?q=80&w=600&auto=format&fit=crop', personName: 'Arjun', relationship: 'Son' },
  { id: 'f3', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', personName: 'Priya', relationship: 'Daughter' },
  { id: 'f4', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', personName: 'Rahul', relationship: 'Neighbor' }
];

const FALLBACK_RELATIONS = ['Friend', 'Neighbor', 'Doctor', 'Cousin', 'Brother', 'Sister', 'Caregiver', 'Teacher', 'Colleague', 'Wife', 'Son', 'Daughter', 'Granddaughter'];

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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const WhoIsThis: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getLocalizedRel = useCallback((rel: string) => {
    if (!rel) return rel;
    const key = `rel_${rel.toLowerCase().trim()}`;
    const translated = t(key);
    return translated !== key ? translated : rel;
  }, [t]);

  // Adaptive difficulty
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyChange, setDifficultyChange] = useState<'increased' | 'decreased' | 'unchanged'>('unchanged');
  const [difficultyMessage, setDifficultyMessage] = useState<string | null>(null);

  // State
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Gameplay state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // Precision tracking refs
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
    correctMatches: number;
    answerChanges: number;
    hintCount: number;
    difficultyLevel: DifficultyLevel;
    postedSessionId: string | null;
    saveError: string | null;
    isOffline?: boolean;
    realMemoriesCount: number;
    placeholderCount: number;
  } | null>(null);

  const [realUsedCount, setRealUsedCount] = useState(0);
  const [placeholderUsedCount, setPlaceholderUsedCount] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // 1. Fetch & Initialize Game
  const initGame = useCallback(async () => {
    setPhase('loading');
    setErrorMsg(null);
    setFeedbackState(null);
    setSelectedOption(null);
    setIsChecking(false);
    setHintActive(false);

    try {
      // Fetch adaptive difficulty
      const diffRes = await getAdaptiveDifficulty('who_is_this');
      setDifficulty(diffRes.difficultyLevel);
      setDifficultyChange(diffRes.change);
      setDifficultyMessage(diffRes.message);

      // Fetch patient's memories
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
      const data: Memory[] = res.ok ? await res.json() : [];
      
      // Filter memories with real photos and relationships
      const validMemories = data.filter(m => Boolean(m.photoUrl && m.relationship));
      
      let memoryPool: Memory[] = [];
      let realCount = 0;
      let placeholderCount = 0;

      if (validMemories.length >= 4) {
        // Spec: If patient has >= 4 real memories, use ONLY real memories — no placeholders!
        memoryPool = [...validMemories];
        realCount = memoryPool.length;
        placeholderCount = 0;
      } else {
        // Spec: Fill gap with placeholders, prioritizing real memories first
        const needed = 4 - validMemories.length;
        memoryPool = [...validMemories, ...FALLBACK_MEMORIES.slice(0, needed)];
        realCount = validMemories.length;
        placeholderCount = needed;
      }

      setRealUsedCount(realCount);
      setPlaceholderUsedCount(placeholderCount);

      // Number of questions: Easy = 3, Medium = 4, Hard = 5 (capped at memoryPool size)
      const qTarget = diffRes.difficultyLevel === 'easy' ? 3 : diffRes.difficultyLevel === 'medium' ? 4 : 5;
      const qCount = Math.min(qTarget, memoryPool.length);

      // Select unique memories for this session without repeating photos
      const selectedMemories = shuffleArray(memoryPool).slice(0, qCount);

      // Extract distinct relationships from all real memories
      const allRealRelations = Array.from(
        new Set(validMemories.map(m => m.relationship!.trim()).filter(Boolean))
      );

      // Wrong options per question: Easy = 2 wrong options (3 choices), Medium/Hard = 3 wrong options (4 choices)
      const wrongCount = diffRes.difficultyLevel === 'easy' ? 2 : 3;

      // Build question objects
      const generatedQuestions: Question[] = selectedMemories.map(mem => {
        const correct = mem.relationship!.trim();
        
        // Spec: Wrong-answer options must be pulled from the patient's OTHER real memories' relationships
        const otherRealRelations = allRealRelations.filter(
          r => r.toLowerCase() !== correct.toLowerCase()
        );

        let wrongs: string[] = [];
        if (otherRealRelations.length >= wrongCount) {
          wrongs = shuffleArray(otherRealRelations).slice(0, wrongCount);
        } else {
          // Supplement from fallback relationships if not enough distinct real relationships
          const neededGap = wrongCount - otherRealRelations.length;
          const fallbackPool = FALLBACK_RELATIONS.filter(
            r => r.toLowerCase() !== correct.toLowerCase() && !otherRealRelations.some(or => or.toLowerCase() === r.toLowerCase())
          );
          wrongs = [...otherRealRelations, ...shuffleArray(fallbackPool).slice(0, neededGap)];
        }

        const isVid =
          mem.mediaType === 'video' ||
          Boolean(mem.videoUrl) ||
          Boolean(mem.photoUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ||
          Boolean(mem.photoUrl?.startsWith('data:video/'));

        return {
          id: mem.id,
          photoUrl: mem.photoUrl!,
          videoUrl: mem.videoUrl || (isVid ? mem.photoUrl : null),
          mediaType: isVid ? ('video' as const) : ('photo' as const),
          personName: mem.personName || 'Family member',
          correctAnswer: correct,
          options: shuffleArray([correct, ...wrongs])
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
      console.error('WhoIsThis init error:', err);
      setErrorMsg('Failed to load memories. Please try again.');
      setPhase('error');
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
  const saveSession = useCallback(async (
    completedAt: Date,
    sessionDurationMs: number,
    attempts: AttemptRecord[],
    ac: number,
    hints: number
  ) => {
    setPhase('saving');
    const correctCount = attempts.filter((a) => a.correct).length;
    const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const avgResponseMs = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.responseTimeMs, 0) / attempts.length) : 0;

    const body = {
      patientId: DEMO_PATIENT_ID,
      gameType: 'who_is_this',
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
        totalAttempts: attempts.length,
        correctMatches: correctCount,
        accuracyPct,
        avgResponseMs,
        answerChanges: ac,
        hintCount: hints,
        difficultyLevel: difficulty,
        realMemoriesUsed: realUsedCount,
        placeholdersUsed: placeholderUsedCount,
      }),
    };

    const saveRes = await saveGameSession(body, 'Who Is This?');

    setResults({
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: completedAt.toISOString(),
      sessionDurationMs,
      accuracyPct,
      avgResponseMs,
      totalAttempts: attempts.length,
      correctMatches: correctCount,
      answerChanges: ac,
      hintCount: hints,
      difficultyLevel: difficulty,
      postedSessionId: saveRes.postedSessionId,
      saveError: saveRes.saveError,
      isOffline: saveRes.isOffline,
      realMemoriesCount: realUsedCount,
      placeholderCount: placeholderUsedCount,
    });
    setPhase('results');
  }, [totalQuestions, difficulty, realUsedCount, placeholderUsedCount]);

  // Handle Option Selection
  const handleAnswer = useCallback((opt: string) => {
    if (isChecking || phase !== 'playing' || !currentQuestion) return;
    
    setSelectedOption(opt);
    setIsChecking(true);
    
    const responseTimeMs = Date.now() - questionStartRef.current;
    const isCorrect = opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    attemptsRef.current.push({
      questionId: currentQuestion.id,
      responseTimeMs,
      correct: isCorrect
    });

    if (!isCorrect) {
      answerChangesRef.current += 1;
    }

    setFeedbackState({
      type: isCorrect ? 'correct' : 'incorrect',
      chosen: opt,
      correctAnswer: currentQuestion.correctAnswer,
      personName: currentQuestion.personName
    });

    // Provide friendly display duration for feedback, then proceed
    feedbackTimerRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        // Next Question
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedbackState(null);
        setHintActive(false);
        setIsChecking(false);
        questionStartRef.current = Date.now();
      } else {
        // End of session
        const completedAt = new Date();
        const dur = Date.now() - startedAtRef.current;
        saveSession(completedAt, dur, attemptsRef.current, answerChangesRef.current, hintCount);
      }
    }, isCorrect ? 1300 : 1800);
  }, [currentIndex, currentQuestion, isChecking, phase, questions.length, saveSession, hintCount]);

  // Hint handler
  const handleHint = useCallback(() => {
    if (hintActive || isChecking || !currentQuestion) return;
    setHintCount(n => n + 1);
    setHintActive(true);
  }, [hintActive, isChecking, currentQuestion]);

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

  // ── Render States ────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center p-8">
          <Loader2 className="w-10 h-10 text-[#0D5C4D] animate-spin mb-4" />
          <p className="text-slate-600 font-medium text-base">{t('game_gathering_memories', 'Gathering memories...')}</p>
        </div>
      </MobileContainer>
    );
  }

  if (phase === 'error') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('common_error', 'Oops!')}</h2>
          <p className="text-slate-600 mb-6 text-sm">{errorMsg}</p>
          <button onClick={initGame} className="px-6 py-3 bg-[#0D5C4D] text-white rounded-xl font-bold shadow-md hover:bg-[#0a4a3d] transition-colors">{t('game_try_again', 'Try Again')}</button>
        </div>
      </MobileContainer>
    );
  }

  if (phase === 'saving') {
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2] items-center justify-center gap-5 p-8">
          <div className="w-16 h-16 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8 text-[#0D5C4D] animate-bounce" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{t('game_great_job', 'Great job!')}</h2>
            <p className="text-sm text-slate-500">{t('game_saving_session', 'Saving your session…')}</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  if (phase === 'results' && results) {
    const hesitation = hesitationLevel(results.answerChanges, results.hintCount);
    
    return (
      <MobileContainer showTopBar={false}>
        <div className="flex flex-col min-h-full bg-[#FAF7F2]">
          <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shadow-xs">
            <button type="button" onClick={() => navigate('/games')} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('game_who_title', 'Who Is This?')}</span>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center mb-3 shadow-md">
                <Sparkles className="w-10 h-10 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center">{t('game_well_done', 'Well done! 🎉')}</h1>
              <p className="text-sm text-slate-500 text-center mt-1">
                {results.accuracyPct >= 80 
                  ? t('game_who_all_identified', 'You remembered your loved ones wonderful!') 
                  : t('game_good_effort', 'Great effort recalling your family memories!')}
              </p>
            </div>

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

            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
              {[
                { label: t('game_hesitation_level', 'Hesitation Level'), value: <span className={`text-xs font-bold px-3 py-1 rounded-full border ${hesitation.bg} ${hesitation.color}`}>{hesitation.label}</span> },
                { label: t('game_difficulty', 'Difficulty'),        value: <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#0D5C4D] capitalize">{results.difficultyLevel || difficulty}</span> },
                { label: t('game_attempts', 'Score'),             value: <span className="text-xs font-medium text-slate-700">{results.correctMatches} / {totalQuestions} {t('game_correct', 'correct')}</span> },
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

            <div className="flex gap-3 pb-2">
              <button type="button" onClick={initGame}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D5C4D] text-white font-bold text-sm shadow-md hover:bg-[#0a4a3d] transition-colors active:scale-95">
                <RotateCcw className="w-4 h-4" /> {t('game_play_again', 'Play Again')}
              </button>
              <button type="button" onClick={() => navigate('/games')}
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

  // ── Gameplay View ────────────────────────────────────────────────────────
  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Top bar */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button type="button" onClick={() => navigate('/games')} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('game_who_title', 'Who Is This?')}</span>
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

        {/* Progress Bar */}
        <div className="bg-white px-5 pb-3 pt-1 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>{t('common_progress', 'Progress')}</span>
            <span className="font-bold text-[#0D5C4D]">{currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0D5C4D] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
          {currentQuestion && (
            <div className="flex flex-col h-full gap-4 max-w-sm w-full mx-auto justify-between">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {t('game_who_is_this_q', 'Who is this?')}
                </h2>
                {hintActive && (
                  <p className="text-xs font-medium text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-lg py-1 px-2.5 inline-block animate-fadeIn">
                    💡 {t('game_hint_person', 'This is {{name}}', { name: currentQuestion.personName })}
                  </p>
                )}
              </div>

              {/* Photo / Video Box: Contained, square aspect ratio, elegant rounded container */}
              <div className="w-full aspect-square max-w-[280px] sm:max-w-[300px] bg-slate-950 rounded-3xl overflow-hidden shadow-md border-4 border-white relative mx-auto flex items-center justify-center">
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
                    alt={`Photo of ${currentQuestion.personName}`} 
                    className="w-full h-full object-cover block"
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600';
                    }}
                  />
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {currentQuestion.options.map(opt => {
                  const isSelected = selectedOption === opt;
                  const isCorrectAnswer = opt.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
                  
                  let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-teal-300 shadow-sm";
                  
                  if (isChecking) {
                    if (isSelected && isCorrectAnswer) {
                      // Correct selection
                      btnStyle = "bg-[#0D5C4D] border-[#0D5C4D] text-white scale-[1.02] shadow-md shadow-[#0D5C4D]/25 ring-2 ring-emerald-300";
                    } else if (isSelected && !isCorrectAnswer) {
                      // Wrong selection
                      btnStyle = "bg-rose-50 border-rose-400 text-rose-800 scale-[0.98]";
                    } else if (!isSelected && isCorrectAnswer && feedbackState?.type === 'incorrect') {
                      // Reveal correct answer when user made a mistake
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-extrabold animate-pulse";
                    }
                  } else if (hintActive && !isCorrectAnswer) {
                    // Hint dims non-matching option
                    btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={isChecking}
                      className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all active:scale-95 select-none ${btnStyle}`}
                    >
                      {getLocalizedRel(opt)}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert Box */}
              {feedbackState && (
                <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 text-left transition-all animate-fadeIn shadow-sm ${
                  feedbackState.type === 'correct'
                    ? 'bg-[#EAF6F3] border-[#A7E8C7] text-[#0D5C4D]'
                    : 'bg-[#FFF8F0] border-[#FED7AA] text-amber-900'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                    feedbackState.type === 'correct' ? 'bg-[#0D5C4D]' : 'bg-amber-600'
                  }`}>
                    {feedbackState.type === 'correct' ? <Heart className="w-4 h-4 fill-white" /> : <HelpCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold">
                      {feedbackState.type === 'correct'
                        ? t('game_who_remembered', 'Wonderful! You remembered that. ❤️')
                        : t('game_who_gentle_answer', 'That is okay! This is {{name}} ({{rel}}). ❤️', {
                            name: feedbackState.personName,
                            rel: getLocalizedRel(feedbackState.correctAnswer)
                          })}
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${hintActive
                ? 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed'
                : 'bg-[#FEF5E7] text-[#D97706] border border-[#FCE6C7] hover:bg-amber-100 active:scale-95'}`}
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

export default WhoIsThis;
