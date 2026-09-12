import React, { useState } from 'react';
import { HealthStatusCard } from '../components/HealthStatusCard';
import { 
  Sun, 
  Volume2, 
  Mic, 
  CheckCircle, 
  Circle, 
  PhoneCall, 
  Sparkles, 
  Camera, 
  Clock, 
  ThumbsUp, 
  Smile,
  Heart
} from 'lucide-react';

export const PatientApp: React.FC = () => {
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  const [patientResponse, setPatientResponse] = useState<string>('');
  const [submittedFeedback, setSubmittedFeedback] = useState<boolean>(false);
  const [routines, setRoutines] = useState([
    { id: '1', time: '08:30 AM', task: 'Warm Lemon Water & Morning Walk', completed: true },
    { id: '2', time: '09:15 AM', task: 'Breakfast & Blood Pressure Pill', completed: true },
    { id: '3', time: '11:00 AM', task: 'Daily Memory Prompt & Photo Recall', completed: false },
    { id: '4', time: '04:30 PM', task: 'Evening Chai with Grandchildren', completed: false },
  ]);

  const toggleRoutine = (id: string) => {
    setRoutines(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleVoiceSimulate = () => {
    setVoiceRecording(true);
    setTimeout(() => {
      setVoiceRecording(false);
      setPatientResponse('Yes, I remember this ghat in Varanasi. We took the wooden boat at sunrise with Priya and Arun.');
    }, 2200);
  };

  const handleSubmitResponse = () => {
    if (!patientResponse.trim()) return;
    setSubmittedFeedback(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Banner / Time of Day */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-950/40 border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Sun className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-teal-400">
                  Patient Memory Space
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  Friday, Morning
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Outfit']">
                Namaste, Ramesh ji (Dadaji)
              </h1>
              <p className="text-sm text-slate-400">
                You are in your peaceful room at home. The weather today is sunny and pleasant.
              </p>
            </div>
          </div>

          {/* Quick family emergency call */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Dialing caregiver: Priya Sharma (+91 98765 43210)...')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Priya (Daughter)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Requirement: Live Database & API Health Probe calling GET /api/health on load */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Backend Connectivity Status
            </span>
            <span className="text-xs text-teal-400">Auto-verified on load</span>
          </div>
          <HealthStatusCard />
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Today's Memory Prompt */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Today's Memory Spark
                  </h2>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Family Album (1985)
                </span>
              </div>

              {/* Prompt Card */}
              <div className="space-y-4">
                <p className="text-xl font-medium text-slate-100 leading-relaxed">
                  "Do you remember the boat ride along the Ganga ghats in Varanasi with Priya when she was seven?"
                </p>

                {/* Simulated nostalgic photo placeholder */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-950/40 via-slate-800 to-slate-900 border border-slate-700/80 p-6 flex flex-col items-center justify-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-amber-200">
                    Ganga Ghats Sunrise Boat Ride
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Family photo archived by Priya • Varanasi, Uttar Pradesh
                  </p>
                  <button
                    onClick={() => {
                      const audio = new Audio();
                      alert('Playing audio cue: "Ganga Aarti temple bells and peaceful dawn sounds"');
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-teal-300 border border-slate-700 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    Play Gentle Audio Cue
                  </button>
                </div>

                {/* Interactive Response Area */}
                <div className="pt-2 space-y-3">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Share your memory (Speak or Type):
                  </label>

                  <div className="relative">
                    <textarea
                      value={patientResponse}
                      onChange={(e) => setPatientResponse(e.target.value)}
                      placeholder="Press the microphone to speak, or type what you recall..."
                      rows={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleVoiceSimulate}
                      disabled={voiceRecording}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        voiceRecording
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{voiceRecording ? 'Listening carefully...' : 'Voice Recall (Tap to Speak)'}</span>
                    </button>

                    <button
                      onClick={handleSubmitResponse}
                      disabled={!patientResponse.trim()}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md shadow-teal-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Memory Note
                    </button>
                  </div>

                  {submittedFeedback && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-sm text-emerald-200 flex items-center gap-3">
                      <ThumbsUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-emerald-300">Beautiful memory, Dadaji! </span>
                        Your recall response has been recorded and shared with your family caregiver dashboard.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Daily Routine Checklist */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Clock className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Today's Routine
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {routines.filter(r => r.completed).length} of {routines.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    onClick={() => toggleRoutine(routine.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                      routine.completed
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-white'
                    }`}
                  >
                    <div className="mt-0.5">
                      {routine.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-teal-400 block">
                        {routine.time}
                      </span>
                      <span className={`text-sm font-medium ${routine.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {routine.task}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gentle Encouragement */}
              <div className="mt-6 p-3.5 rounded-xl bg-slate-800/40 border border-slate-750 flex items-center gap-3 text-xs text-slate-300">
                <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Take each moment calmly. Drink water and enjoy your morning tea.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
