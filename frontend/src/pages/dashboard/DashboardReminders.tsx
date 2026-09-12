import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Sun,
  Coffee,
  Utensils,
  Moon,
  Activity,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  User,
  Heart,
  Pill
} from 'lucide-react';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../../config';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface RoutineItem {
  id: string;
  patientId: string;
  time: string;
  label: string;
  iconType: string;
  completed: boolean;
  category?: string;
  voicePrompt?: string;
}

interface DashboardRemindersProps {
  onBackToOverview: () => void;
}

export const DashboardReminders: React.FC<DashboardRemindersProps> = ({
  onBackToOverview,
}) => {
  const { speakText, isSpeaking, stopSpeaking } = useAccessibility();
  const [reminders, setReminders] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('Health');
  const [newIconType, setNewIconType] = useState('medicine');

  // Load Reminders
  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/reminders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReminders(data);
        }
      }
    } catch (err) {
      console.warn('Using fallback reminders for dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const completedCount = reminders.filter((r) => r.completed).length;
  const adherencePct = reminders.length > 0 ? Math.round((completedCount / reminders.length) * 100) : 0;

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !currentStatus } : r))
    );

    try {
      await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
    } catch (err) {
      console.warn('Reminder toggle sync notice:', err);
    }
  };

  const handlePlayVoice = (promptText: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(promptText);
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: RoutineItem = {
      id: `rem_${Date.now()}`,
      patientId: DEMO_PATIENT_ID,
      time: newTime,
      label: newLabel || 'Daily Health Routine',
      iconType: newIconType,
      completed: false,
      category: newCategory,
      voicePrompt: `Namaste Ramesh ji. It is ${newTime}. Time for your ${newLabel}.`,
    };

    setReminders([...reminders, newRem]);
    setIsAddModalOpen(false);
    setNewLabel('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
      case 'morning':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'sun':
      case 'water':
        return <Sun className="w-5 h-5 text-blue-500" />;
      case 'lunch':
        return <Utensils className="w-5 h-5 text-emerald-600" />;
      case 'walk':
      case 'exercise':
        return <Activity className="w-5 h-5 text-teal-700" />;
      case 'night':
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <Pill className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Adherence Stat & Add Reminder */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 text-teal-700" />
            <span>Care Routine Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Daily Routine & Medication Reminders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule automated spoken voice routines for morning/evening medicines, prayer timings, and hydration cues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-xs shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Reminder</span>
        </button>
      </div>

      {/* 3 Quick Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Today's Adherence</span>
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">{adherencePct}%</span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              {completedCount} of {reminders.length} routines completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Pending Routines</span>
            <span className="text-2xl font-bold text-amber-700 font-['Outfit']">{reminders.length - completedCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Next: Evening Garden Walk & BP Check
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Voice Delivery Mode</span>
            <span className="text-2xl font-bold text-[#0D5C4D] font-['Outfit']">Active 🎙️</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Spoken prompt in English & Assamese
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Routine Cards List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
            Today's Timeline & Medicine Tracking
          </h2>
          <span className="text-xs font-bold text-slate-400">Synced with ASHA Field Worker</span>
        </div>

        <div className="space-y-3">
          {reminders.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(item.id, item.completed)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-[#0D5C4D] bg-white'
                  }`}
                  title={item.completed ? 'Mark pending' : 'Mark completed'}
                >
                  {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-2xs shrink-0">
                  {getIcon(item.iconType)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.time}
                    </span>
                    <h3 className={`text-sm font-bold ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {item.label}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {item.completed ? 'Completed on schedule ✅' : 'Scheduled reminder for patient device'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    handlePlayVoice(
                      item.voicePrompt || `Namaste Ramesh ji. It is ${item.time}. Time for your ${item.label}.`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition active:scale-95"
                  title="Test spoken prompt"
                >
                  <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Voice Prompt</span>
                </button>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Schedule Care Reminder</h2>
                <p className="text-xs text-slate-500">Add a routine or medication dose with spoken reminder.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Time of Day</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 08:30 AM, 05:00 PM"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Routine / Medicine Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Morning Blood Pressure Tablet & Chai"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category & Icon</label>
                <select
                  value={newIconType}
                  onChange={(e) => setNewIconType(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] cursor-pointer"
                >
                  <option value="medicine">💊 Medicine / Tablet</option>
                  <option value="breakfast">☕ Morning Chai & Breakfast</option>
                  <option value="water">💧 Hydration / Water</option>
                  <option value="walk">🚶 Evening Walk / Light Exercise</option>
                  <option value="lunch">🍲 Lunch & Rest</option>
                  <option value="night">🌙 Night Medicine & Milk</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold shadow-md"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardReminders;
