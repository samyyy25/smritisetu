import React, { useState } from 'react';
import {
  LogoLockup,
  FeatureBullet,
  BigActionCard,
  BottomNavBar,
  SidebarNav,
  StatCard,
  StatusBadge,
  AlertCard,
  MiniTrendChart,
  TimelineItem,
  LanguageChip,
  DifferentiatorChip,
  ProgressRing,
  VoiceWaveform,
  NavTabId,
  SidebarNavItemId,
} from '../components/design-system';
import {
  Brain,
  Mic,
  BookOpen,
  Bell,
  Heart,
  Gamepad2,
  Calendar,
  LineChart,
  MapPin,
  WifiOff,
  Users,
  Eye,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Award,
  Volume2,
  FolderHeart,
  Cpu,
} from 'lucide-react';

export const Styleguide: React.FC = () => {
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('home');
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarNavItemId>('overview');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Assamese');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(true);
  const [activeTimelineYear, setActiveTimelineYear] = useState<string>('1998');
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('Daughter');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-24 font-sans">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#EAF6F3] border border-[#0D5C4D]/20 flex items-center justify-center text-[#0D5C4D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                SmritiSetu Design System & Component Library
              </h1>
              <p className="text-xs text-slate-500">
                Extracted directly from visual reference template • Tokens, Shapes & 13 Core Components
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EAF8F1] text-[#065F46] border border-[#A7E8C7]">
              ● Template Match Verified
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* ======================================================== */}
        {/* SECTION 1: COLOR PALETTE & TOKENS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              1. Color Palette & Extracted Tokens
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Exact color values sampled from the visual template for brand, surfaces, pastels, and status.
            </p>
          </div>

          <div className="space-y-6">
            {/* Primary Brand */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Primary Brand (Deep Forest Teal)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0D5C4D] text-white shadow-xs">
                  <span className="text-xs font-bold block">Brand Primary</span>
                  <span className="text-[11px] font-mono opacity-80">#0D5C4D</span>
                  <span className="text-[10px] opacity-70 block mt-1">Logo, Buttons, Active</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#07382E] text-white shadow-xs">
                  <span className="text-xs font-bold block">Sidebar Dark</span>
                  <span className="text-[11px] font-mono opacity-80">#07382E</span>
                  <span className="text-[10px] opacity-70 block mt-1">Dashboard Sidebar</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#147260] text-white shadow-xs">
                  <span className="text-xs font-bold block">Primary Light</span>
                  <span className="text-[11px] font-mono opacity-80">#147260</span>
                  <span className="text-[10px] opacity-70 block mt-1">Hover & Highlights</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#EAF6F3] text-[#0D5C4D] border border-[#ACDDCE] shadow-xs">
                  <span className="text-xs font-bold block">Teal Wash</span>
                  <span className="text-[11px] font-mono opacity-80">#EAF6F3</span>
                  <span className="text-[10px] opacity-70 block mt-1">Badges & Icon circles</span>
                </div>
              </div>
            </div>

            {/* Surfaces */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Surfaces & Backgrounds
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 block">Warm Cream</span>
                  <span className="text-[11px] font-mono text-slate-500">#FAF7F2</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Landing / Marketing panels</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F6F7F9] border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 block">App Shell</span>
                  <span className="text-[11px] font-mono text-slate-500">#F6F7F9</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Patient app canvas</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 block">Pure Card White</span>
                  <span className="text-[11px] font-mono text-slate-500">#FFFFFF</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Cards & Modals</span>
                </div>
              </div>
            </div>

            {/* Soft Pastels */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Soft Pastel Accents (Action Cards & Quiz Options)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-2xl bg-[#FDEEE9] border border-[#FBD8CE] text-[#E05345]">
                  <span className="text-xs font-bold block">Blush Pink</span>
                  <span className="text-[10px] font-mono">#FDEEE9</span>
                  <span className="text-[9px] block text-slate-500 mt-1">Play Memory Game</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#EAF6F4] border border-[#CEEBE6] text-[#0D5C4D]">
                  <span className="text-xs font-bold block">Mint / Sage</span>
                  <span className="text-[10px] font-mono">#EAF6F4</span>
                  <span className="text-[9px] block text-slate-500 mt-1">Talk to SmritiSetu</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F3EEF9] border border-[#E1D5F2] text-[#7C3AED]">
                  <span className="text-xs font-bold block">Lavender</span>
                  <span className="text-[10px] font-mono">#F3EEF9</span>
                  <span className="text-[9px] block text-slate-500 mt-1">My Life Story</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FEF5E7] border border-[#FCE6C7] text-[#D97706]">
                  <span className="text-xs font-bold block">Peach / Amber</span>
                  <span className="text-[10px] font-mono">#FEF5E7</span>
                  <span className="text-[9px] block text-slate-500 mt-1">Today's Reminders</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#EDF5FE] border border-[#D3E7FC] text-[#2563EB]">
                  <span className="text-xs font-bold block">Soft Blue</span>
                  <span className="text-[10px] font-mono">#EDF5FE</span>
                  <span className="text-[9px] block text-slate-500 mt-1">Neighbor / Blue Pill</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FDEEF1] border border-[#F9D6DE] text-[#E11D48]">
                  <span className="text-xs font-bold block">Warm Rose</span>
                  <span className="text-[10px] font-mono">#FDEEF1</span>
                  <span className="text-[9px] block text-slate-500 mt-1">My Memories</span>
                </div>
              </div>
            </div>

            {/* Status Colors */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Status Colors (Stable, Monitor, Attention)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#EAF8F1] border border-[#A7E8C7] text-[#065F46] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Stable (Green)</span>
                    <span className="text-[11px] font-mono text-[#059669]">#10B981 • #EAF8F1</span>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FEF7E6] border border-[#FDE29A] text-[#92400E] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Monitor (Amber/Yellow)</span>
                    <span className="text-[11px] font-mono text-[#D97706]">#F59E0B • #FEF7E6</span>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FDECEC] border border-[#F9BFC1] text-[#991B1B] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Attention (Red/Coral)</span>
                    <span className="text-[11px] font-mono text-[#DC2626]">#EF4444 • #FDECEC</span>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: LOGO LOCKUP & BRAND VARIANTS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              2. Component 1 — Logo Lockup
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tree and family connection emblem + "SmritiSetu" wordmark + tagline in Light & Dark modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-slate-200/80 flex flex-col items-center justify-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Light Mode (Landing & Patient Header)
              </span>
              <LogoLockup size="lg" theme="light" />
              <div className="flex items-center space-x-6 pt-2">
                <LogoLockup size="md" theme="light" />
                <LogoLockup size="sm" theme="light" showTagline={false} />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#07382E] text-white flex flex-col items-center justify-center space-y-6 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200/70">
                Dark Mode (Sidebar & Clinical Shell)
              </span>
              <LogoLockup size="lg" theme="dark" />
              <div className="flex items-center space-x-6 pt-2">
                <LogoLockup size="md" theme="dark" />
                <LogoLockup size="sm" theme="dark" showTagline={false} />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: FEATURE BULLETS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              3. Component 2 — FeatureBullet
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              As seen in the left landing / marketing column of the template.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-3xl bg-[#FAF7F2] border border-slate-200/70">
            <FeatureBullet
              icon={<Gamepad2 />}
              title="AI-Adaptive Games"
              subtitle="Adjusts to ability & performance"
            />
            <FeatureBullet
              icon={<Bell />}
              title="Memory Assistance"
              subtitle="Reminders, routines & safety"
            />
            <FeatureBullet
              icon={<LineChart />}
              title="Cognitive Monitoring"
              subtitle="Trend tracking & early insights"
            />
            <FeatureBullet
              icon={<MapPin />}
              title="NER Focused"
              subtitle="Regional languages & cultural content"
            />
            <FeatureBullet
              icon={<WifiOff />}
              title="Offline First"
              subtitle="Works without internet, Syncs later"
            />
            <FeatureBullet
              icon={<Users />}
              title="Family & Community"
              subtitle="Caregivers, ASHA & Doctors connected"
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: BIG ACTION CARDS & QUIZ OPTIONS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              4. Component 3 — BigActionCard & Quiz Option Buttons
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Large colorful tap targets from patient screen ("Good morning, Asha") and quiz answer pills.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Action Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Patient Home Screen Cards
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <BigActionCard
                  theme="pink"
                  icon={<Brain />}
                  title="Play Memory Game"
                  subtitle="Fun cognitive exercises"
                />
                <BigActionCard
                  theme="mint"
                  icon={<Mic />}
                  title="Talk to SmritiSetu"
                  subtitle="Voice conversation"
                />
                <BigActionCard
                  theme="lavender"
                  icon={<BookOpen />}
                  title="My Life Story"
                  subtitle="Revisit memories"
                  badgeText="New"
                />
                <BigActionCard
                  theme="peach"
                  icon={<Bell />}
                  title="Today's Reminders"
                  subtitle="Medicines & routines"
                />
              </div>

              <BigActionCard
                fullWidth
                theme="rose"
                icon={<Heart />}
                title="My Memories"
                subtitle="Your special moments and family albums"
              />
            </div>

            {/* Quiz Option Buttons */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quiz Answer Option Buttons ("Who is this person?")
              </h3>

              <div className="p-6 rounded-3xl bg-[#F6F7F9] border border-slate-200/80 space-y-3">
                {[
                  { id: 'Daughter', label: 'Daughter', bg: 'bg-[#FFF3EB]', border: 'border-[#FED7AA]', text: 'text-[#9A3412]' },
                  { id: 'Sister', label: 'Sister', bg: 'bg-[#EBF8F4]', border: 'border-[#A7F3D0]', text: 'text-[#065F46]' },
                  { id: 'Friend', label: 'Friend', bg: 'bg-[#F4F0FB]', border: 'border-[#DDD6FE]', text: 'text-[#6D28D9]' },
                  { id: 'Neighbor', label: 'Neighbor', bg: 'bg-[#EDF5FE]', border: 'border-[#BAE6FD]', text: 'text-[#1E40AF]' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedQuizOption(opt.id)}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-between border ${
                      opt.bg
                    } ${opt.border} ${opt.text} ${
                      selectedQuizOption === opt.id
                        ? 'ring-2 ring-offset-1 ring-[#0D5C4D] scale-[1.01]'
                        : 'hover:brightness-95'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedQuizOption === opt.id && (
                      <span className="text-xs font-bold bg-[#0D5C4D] text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: STAT CARDS & STATUS BADGES */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              5. Components 6 & 7 — StatCard & StatusBadge
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dashboard metric cards and status badges (Stable, Monitor, Attention).
            </p>
          </div>

          <div className="space-y-6">
            {/* Stat Cards Row */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Dashboard Overview Metric Row
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  variant="blue"
                  icon={<Users />}
                  label="Patients"
                  value="24"
                  delta="+2 new"
                />
                <StatCard
                  variant="stable"
                  icon={<ShieldCheck />}
                  label="Stable"
                  value="17"
                  delta="+1"
                />
                <StatCard
                  variant="monitor"
                  icon={<Eye />}
                  label="Monitor"
                  value="4"
                />
                <StatCard
                  variant="attention"
                  icon={<AlertOctagon />}
                  label="Attention"
                  value="3"
                  delta="+1"
                />
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Status Badges / Pills (Multiple sizes & dot indicators)
              </h3>
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <StatusBadge status="Stable" />
                <StatusBadge status="Stable" showDot />
                <StatusBadge status="Stable" showDot size="md" />

                <span className="w-px h-6 bg-slate-200" />

                <StatusBadge status="Monitor" />
                <StatusBadge status="Monitor" showDot />
                <StatusBadge status="Monitor" showDot size="md" />

                <span className="w-px h-6 bg-slate-200" />

                <StatusBadge status="Attention" />
                <StatusBadge status="Attention" showDot />
                <StatusBadge status="Attention" showDot size="md" />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: ALERT CARD & MINI TREND CHART */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              6. Components 8 & 9 — AlertCard & MiniTrendChart
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              "Possible Cognitive Change" explainable alert card with metric rows, disclaimer, and dual-trend SVG line chart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* The AlertCard */}
            <div className="flex justify-center">
              <AlertCard
                patientName="Anita Devi"
                detectedDate="Detected on 22 Jan 2026"
                title="Possible Cognitive Change"
                onViewDetails={() => alert('View details clicked')}
                onAddNote={() => alert('Add note clicked')}
              />
            </div>

            {/* Standalone MiniTrendChart variations */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Standalone MiniTrendChart (For embedding in cards & lists)
              </h3>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Anita Devi — Accuracy & Reaction Latency (30 Days)
                  </span>
                  <MiniTrendChart height={85} />
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Stable Patient Benchmark
                  </span>
                  <MiniTrendChart
                    height={75}
                    accuracyData={[80, 82, 85, 84, 88, 86, 89, 90, 88, 92]}
                    reactionTimeData={[45, 42, 40, 38, 41, 39, 36, 35, 37, 34]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: PROGRESS RING & VOICE WAVEFORM */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              7. Components 12 & 13 — ProgressRing & VoiceWaveform
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Circular progress indicators ("Today's Progress") and voice listening animated sound waves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Progress Rings */}
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-slate-200/70 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Circular Progress Rings
              </h3>

              <div className="flex flex-wrap items-center justify-around gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <ProgressRing progress={70} size={76} strokeWidth={6} value="2" label="Day Streak" />
                  <span className="text-xs font-medium text-slate-600">Today's Progress</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <ProgressRing progress={40} size={76} strokeWidth={6} value="2/5" label="Questions" color="#7C3AED" trackColor="#F3EEF9" />
                  <span className="text-xs font-medium text-slate-600">Quiz Progress</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <ProgressRing progress={78} size={76} strokeWidth={6} value="78%" label="Clarity" color="#10B981" trackColor="#EAF8F1" />
                  <span className="text-xs font-medium text-slate-600">Voice Clarity</span>
                </div>
              </div>
            </div>

            {/* Voice Waveform */}
            <div className="p-6 rounded-3xl bg-[#F6F7F9] border border-slate-200/80 flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Voice Waveform Indicator
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVoiceListening(!isVoiceListening)}
                  className="text-xs font-semibold text-[#0D5C4D] bg-[#EAF6F3] px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors"
                >
                  {isVoiceListening ? 'Stop Mic' : 'Start Mic'}
                </button>
              </div>

              <div className="py-4">
                <VoiceWaveform
                  isListening={isVoiceListening}
                  statusText={isVoiceListening ? 'Listening to voice...' : 'Microphone Paused'}
                  onToggle={() => setIsVoiceListening(!isVoiceListening)}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Used in "Remember & Speak" screen and top voice assistance
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: TIMELINE ITEM (MY LIFE STORY) */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              8. Component 10 — TimelineItem ("My Life Story")
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Vertical milestone nodes with year badges, connection line, and memory photo cards.
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#FAF7F2] border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Let's remember your beautiful journey
            </h3>

            <div className="relative">
              <TimelineItem
                year="1978"
                color="purple"
                title="My Childhood"
                subtitle="School days in Tezpur"
                isActive={activeTimelineYear === '1978'}
                onClick={() => setActiveTimelineYear('1978')}
              />
              <TimelineItem
                year="1989"
                color="amber"
                title="My Family"
                subtitle="Home in Guwahati"
                isActive={activeTimelineYear === '1989'}
                onClick={() => setActiveTimelineYear('1989')}
              />
              <TimelineItem
                year="1998"
                color="orange"
                title="My Wedding"
                subtitle="Ceremony with Arun"
                isActive={activeTimelineYear === '1998'}
                onClick={() => setActiveTimelineYear('1998')}
              />
              <TimelineItem
                year="2005"
                color="teal"
                title="My Children"
                subtitle="Priya & Rohit growing up"
                isActive={activeTimelineYear === '2005'}
                onClick={() => setActiveTimelineYear('2005')}
              />
              <TimelineItem
                isLast
                year="Today"
                color="rose"
                title="My Memories"
                subtitle="Daily joy with grandchildren"
                isActive={activeTimelineYear === 'Today'}
                onClick={() => setActiveTimelineYear('Today')}
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 9: LANGUAGE & DIFFERENTIATOR CHIPS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              9. Component 11 — LanguageChip & DifferentiatorChip
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Small pill-style chips as displayed across the footer banner in the template.
            </p>
          </div>

          <div className="space-y-6">
            {/* Differentiator Chips */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Key Differentiator Chips
              </h3>
              <div className="flex flex-wrap gap-2.5 p-4 rounded-3xl bg-[#FAF7F2] border border-slate-200/70">
                <DifferentiatorChip
                  icon={<MapPin />}
                  title="NER Focused"
                  subtitle="Cultural content & local languages"
                  iconBgColor="bg-teal-100"
                  iconColor="text-[#0D5C4D]"
                />
                <DifferentiatorChip
                  icon={<Mic />}
                  title="Voice First"
                  subtitle="Speak naturally in your language"
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-700"
                />
                <DifferentiatorChip
                  icon={<Cpu />}
                  title="AI Adaptive"
                  subtitle="Difficulty adjusts to performance"
                  iconBgColor="bg-amber-100"
                  iconColor="text-amber-700"
                />
                <DifferentiatorChip
                  icon={<Award />}
                  title="Research Backed"
                  subtitle="Memory science & confidence"
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-700"
                />
                <DifferentiatorChip
                  icon={<AlertOctagon />}
                  title="Explainable Alerts"
                  subtitle="Know why an alert was triggered"
                  iconBgColor="bg-rose-100"
                  iconColor="text-rose-700"
                />
                <DifferentiatorChip
                  icon={<FolderHeart />}
                  title="Family Centric"
                  subtitle="Elderly ready moments, create games"
                  iconBgColor="bg-pink-100"
                  iconColor="text-pink-700"
                />
                <DifferentiatorChip
                  icon={<WifiOff />}
                  title="Offline First"
                  subtitle="Works anywhere, anytime"
                  iconBgColor="bg-emerald-100"
                  iconColor="text-emerald-700"
                />
                <DifferentiatorChip
                  icon={<Heart />}
                  title="Community Care"
                  subtitle="ASHA workers & clinicians connected"
                  iconBgColor="bg-teal-100"
                  iconColor="text-teal-800"
                />
              </div>
            </div>

            {/* Supported Language Chips */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Supported Language Chips
              </h3>
              <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-3xl bg-[#FAF7F2] border border-slate-200/70">
                {[
                  { native: 'অসমীয়া', english: 'Assamese' },
                  { native: 'नेपाली', english: 'Nepali' },
                  { native: 'खासी', english: 'Khasi' },
                  { native: 'Mizo', english: 'Mizo' },
                  { native: 'English', english: 'English' },
                  { native: '+ More', english: 'Regional' },
                ].map((lang) => (
                  <LanguageChip
                    key={lang.english}
                    nativeName={lang.native}
                    englishName={lang.english}
                    isSelected={selectedLanguage === lang.english}
                    onClick={() => setSelectedLanguage(lang.english)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 10: NAVIGATION BARS (SIDEBAR & BOTTOM NAV) */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C4D]" />
              10. Components 4 & 5 — BottomNavBar & SidebarNav
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Patient 5-icon bottom navigation bar and Caregiver Dashboard dark teal sidebar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* SidebarNav */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Caregiver Dashboard SidebarNav
              </span>
              <SidebarNav
                activeId={activeSidebarItem}
                onSelect={(id) => setActiveSidebarItem(id)}
              />
            </div>

            {/* BottomNavBar in mobile frame mockup */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Patient App BottomNavBar (5-tab Navigation)
              </span>

              <div className="p-8 rounded-3xl bg-[#F6F7F9] border border-slate-200/80 flex flex-col items-center justify-center space-y-6">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft-card space-y-4 text-center">
                  <span className="text-xs font-semibold text-slate-500">
                    Active Tab: <strong className="text-[#0D5C4D] uppercase">{activeNavTab}</strong>
                  </span>
                  <p className="text-xs text-slate-400">
                    Touch-friendly targets with high accessibility contrast and active dot state.
                  </p>
                  <div className="pt-2">
                    <BottomNavBar
                      activeTab={activeNavTab}
                      onTabChange={(tab) => setActiveNavTab(tab)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
