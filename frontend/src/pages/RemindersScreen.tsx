import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Circle,
  Sun,
  Pill,
  Utensils,
  Footprints,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';

interface ReminderItem {
  id: string;
  patientId: string;
  time: string;
  label: string;
  iconType: string;
  completed: boolean;
  date: string;
}

const DEFAULT_FALLBACK_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    patientId: DEMO_PATIENT_ID,
    time: '8:00 AM',
    label: 'Morning Medicine & Chai',
    iconType: 'breakfast',
    completed: true,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_2',
    patientId: DEMO_PATIENT_ID,
    time: '11:00 AM',
    label: 'Drink Water & Hydrate',
    iconType: 'sun',
    completed: true,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_3',
    patientId: DEMO_PATIENT_ID,
    time: '1:30 PM',
    label: 'Afternoon Lunch & Rest',
    iconType: 'lunch',
    completed: false,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_4',
    patientId: DEMO_PATIENT_ID,
    time: '5:00 PM',
    label: 'Evening Walk in Garden',
    iconType: 'walk',
    completed: false,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_5',
    patientId: DEMO_PATIENT_ID,
    time: '8:30 PM',
    label: 'Night Medicine with Warm Milk',
    iconType: 'medicine',
    completed: false,
    date: new Date().toISOString(),
  },
];

export const RemindersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<ReminderItem[]>(DEFAULT_FALLBACK_REMINDERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/reminders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReminders(data);
        }
      }
    } catch (err: any) {
      console.warn('[RemindersScreen] Using offline fallback reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const toggleReminder = async (id: string, currentCompleted: boolean) => {
    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !currentCompleted } : r))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update reminder on server');
    } catch (err) {
      console.warn('Reverting optimistic update due to error:', err);
      // Revert if failed
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: currentCompleted } : r))
      );
    }
  };

  const getIconForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('breakfast') || t.includes('morning') || t.includes('sun')) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    if (t.includes('med') || t.includes('pill')) {
      return <Pill className="w-5 h-5 text-rose-500" />;
    }
    if (t.includes('lunch') || t.includes('food') || t.includes('dinner')) {
      return <Utensils className="w-5 h-5 text-emerald-600" />;
    }
    if (t.includes('walk') || t.includes('exercise') || t.includes('evening')) {
      return <Footprints className="w-5 h-5 text-teal-600" />;
    }
    return <Clock className="w-5 h-5 text-[#0D5C4D]" />;
  };

  const getBgForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('breakfast') || t.includes('morning')) return 'bg-amber-50 border-amber-100';
    if (t.includes('med') || t.includes('pill')) return 'bg-rose-50 border-rose-100';
    if (t.includes('lunch') || t.includes('food')) return 'bg-emerald-50 border-emerald-100';
    if (t.includes('walk') || t.includes('exercise')) return 'bg-teal-50 border-teal-100';
    return 'bg-slate-50 border-slate-100';
  };

  // Localized reminder label helper
  const getLocalizedLabel = (label: string, id: string) => {
    if (id === 'rem_1' || label.toLowerCase().includes('morning medicine')) return t('rem_morning_med', label);
    if (id === 'rem_2' || label.toLowerCase().includes('water') || label.toLowerCase().includes('hydrate')) return t('rem_water', label);
    if (id === 'rem_3' || label.toLowerCase().includes('lunch')) return t('rem_lunch', label);
    if (id === 'rem_4' || label.toLowerCase().includes('walk')) return t('rem_walk', label);
    if (id === 'rem_5' || label.toLowerCase().includes('night medicine') || label.toLowerCase().includes('warm milk')) return t('rem_night_med', label);
    return label;
  };

  // Voice narration of all reminders
  const handleHearAllReminders = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const pendingCount = reminders.filter((r) => !r.completed).length;
    const completedCount = reminders.filter((r) => r.completed).length;

    const speechText = `${t('reminders_title', "Today's Reminders")}. ${reminders
      .map((r) => `${r.time}: ${getLocalizedLabel(r.label, r.id)}. ${r.completed ? t('done', 'Done') : ''}`)
      .join(' ')}. ${t('reminders_completed_count', '{{completed}} of {{total}} completed', { completed: completedCount, total: reminders.length })}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Custom Header Matching Mockup */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/patient/home')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Go to Home"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.5]" />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('reminders_title', "Today's Reminders")}
          </span>

          <button
            type="button"
            onClick={fetchReminders}
            className={`p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors ${
              loading ? 'animate-spin text-[#0D5C4D]' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Subtitle / Progress Banner */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3.5 border border-slate-100/80 shadow-soft-card">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D5C4D]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 leading-tight">
                    {t('reminders_subtitle', 'Daily Schedule')}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {t('reminders_completed_count', '{{completed}} of {{total}} completed', {
                      completed: completedCount,
                      total: reminders.length,
                    })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF6F4] text-[#0D5C4D]">
                {Math.round((completedCount / Math.max(reminders.length, 1)) * 100)}%
              </span>
            </div>

            {/* Reminders List */}
            {loading ? (
              <div className="space-y-3 py-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200/70 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-xs text-red-700 font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={fetchReminders}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  {t('retry_loading', 'Retry Loading')}
                </button>
              </div>
            ) : reminders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-2">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">{t('no_reminders_today', 'No Reminders Today')}</h3>
                <p className="text-xs text-slate-400">{t('no_reminders_desc', 'All routines for today have been completed or none scheduled.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    onClick={() => toggleReminder(reminder.id, reminder.completed)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-soft-card group select-none ${
                      reminder.completed
                        ? 'bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-50'
                        : 'bg-white border-slate-100/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Icon Circle */}
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${getBgForType(
                          reminder.iconType
                        )}`}
                      >
                        {getIconForType(reminder.iconType)}
                      </div>

                      {/* Reminder Details */}
                      <div>
                        <span className="text-xs font-bold text-slate-400 font-mono block">
                          {reminder.time}
                        </span>
                        <span
                          className={`text-base font-bold tracking-tight leading-snug transition-colors ${
                            reminder.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {getLocalizedLabel(reminder.label, reminder.id)}
                        </span>
                      </div>
                    </div>

                    {/* Done Badge / Check Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReminder(reminder.id, reminder.completed);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs ${
                        reminder.completed
                          ? 'bg-[#0D5C4D] text-white'
                          : 'bg-[#EAF6F4] hover:bg-[#D4EEE8] text-[#0D5C4D] border border-[#CEEBE6]'
                      }`}
                    >
                      {reminder.completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('done', 'Done')}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>{t('done', 'Done')}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom "Hear All Reminders" Voice Button matching Image 5 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleHearAllReminders}
              className={`w-full py-4 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-[#0D5C4D] border-2 border-[#0D5C4D]/30 active:scale-[0.99]'
              }`}
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : 'text-[#0D5C4D]'}`} />
              <span>
                {isSpeaking
                  ? 'Speaking Reminders aloud… (Tap to Stop)'
                  : t('hear_all_reminders', 'Hear All Reminders')}
              </span>
            </button>
          </div>
        </div>
      </div>

      <BottomNavBar activeTab="reminders" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};
