import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Sparkles,
  FileCheck,
  Send,
  Check
} from 'lucide-react';
import { DEMO_PATIENT_ID } from '../../config';

interface DashboardReportsProps {
  onBackToOverview: () => void;
}

export const DashboardReports: React.FC<DashboardReportsProps> = ({
  onBackToOverview,
}) => {
  const [reportType, setReportType] = useState<'neuro' | 'family' | 'asha'>('neuro');
  const [selectedPatient, setSelectedPatient] = useState('Ramesh Sharma (Age 72)');
  const [timeframe, setTimeframe] = useState('14-Day Audit');
  const [doctorNotes, setDoctorNotes] = useState(
    'Patient shows stable semantic recall for long-term autobiographical memories. A +32% reaction time slowdown noted in temporal sequencing (Festival memories) warrants continued gentle monitoring during weekly ASHA visits.'
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      patient: selectedPatient,
      timeframe,
      reportType,
      generatedAt: new Date().toISOString(),
      biomarkers: {
        meanLatencySec: 3.4,
        latencyDriftPct: +18.5,
        recallAccuracyPct: 82.4,
        hesitationRate: 1.1,
        hintReliancePct: 15.0,
      },
      doctorNotes,
      signOff: 'Dr. Mehta, MD (Neurology) • SmritiSetu Telemetry Protocol',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmritiSetu_Clinical_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Clinical Documentation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Clinical Progression Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable clinical summaries, neurologist export dossiers, and MoCA-aligned longitudinal progression reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Report Controls: Format, Patient & Range */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Format Tabs */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Report Template Format</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setReportType('neuro')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'neuro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🧠 Neurologist Dossier
              </button>
              <button
                type="button"
                onClick={() => setReportType('family')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'family' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🏡 Family Progress
              </button>
              <button
                type="button"
                onClick={() => setReportType('asha')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'asha' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🤝 ASHA Handover
              </button>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Patient Profile</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] cursor-pointer"
            >
              <option value="Ramesh Sharma (Age 72)">Ramesh Sharma (Age 72, Dadaji)</option>
              <option value="Meenakshi Devi (Age 68)">Meenakshi Devi (Age 68)</option>
              <option value="Biren Gogoi (Age 75)">Biren Gogoi (Age 75)</option>
              <option value="Kamala Roy (Age 70)">Kamala Roy (Age 70)</option>
            </select>
          </div>

          {/* Timeframe */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Assessment Period</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] cursor-pointer"
            >
              <option value="14-Day Audit">Last 14 Days (Biomarker Velocity)</option>
              <option value="30-Day Longitudinal">Last 30 Days (Monthly Dossier)</option>
              <option value="90-Day Full History">Quarterly Clinical Progression</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Dossier Header Lockup */}
        <div className="flex items-start justify-between border-b-2 border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#0D5C4D]" />
              <span className="text-lg font-bold text-slate-900 font-['Outfit']">SmritiSetu Clinical Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {reportType === 'neuro'
                ? 'Neurological Progression & Biomarker Dossier'
                : reportType === 'family'
                ? 'Family Care & Cognitive Engagement Summary'
                : 'ASHA Field Worker Handover Protocol'}
            </h2>
            <p className="text-xs text-slate-400">
              Standardized Cognitive Telemetry • MoCA / HMSE Aligned • Tele-Health Ready
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="font-bold block text-slate-900">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>Period: {timeframe}</span>
            <span className="block text-[10px] text-teal-800 font-mono mt-1">Ref: SMRITI-DOSSIER-2026-9A</span>
          </div>
        </div>

        {/* Patient Demographic Summary Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Patient Name:</span>
            <span className="font-bold text-slate-900">{selectedPatient.split('(')[0]}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Age & Gender:</span>
            <span className="font-bold text-slate-900">72 Yrs • Male</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Primary Language:</span>
            <span className="font-bold text-slate-900">Assamese / English</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Caregiver Contact:</span>
            <span className="font-bold text-slate-900">Priya Sharma (Daughter)</span>
          </div>
        </div>

        {/* Core Metrics Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-teal-700" />
            <span>Longitudinal Biomarker Velocity (14-Day Baseline Comparison)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100">
              <span className="text-slate-500 font-semibold block">Episodic Recall Accuracy</span>
              <span className="text-xl font-bold text-teal-900 font-['Outfit'] mt-1 block">82.4%</span>
              <span className="text-[11px] text-teal-700 mt-0.5 block">-4.2% change vs prior 14d</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-slate-500 font-semibold block">Response Latency Drift</span>
              <span className="text-xl font-bold text-amber-900 font-['Outfit'] mt-1 block">3.4s mean</span>
              <span className="text-[11px] text-amber-700 mt-0.5 block">+18.5% slower on sequence tasks</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-slate-500 font-semibold block">Hesitation / Reversals</span>
              <span className="text-xl font-bold text-purple-900 font-['Outfit'] mt-1 block">1.1 / play</span>
              <span className="text-[11px] text-purple-700 mt-0.5 block">Mild deliberation observed</span>
            </div>
          </div>
        </div>

        {/* Clinical Domain Assessment Matrix */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Clinical Domain Sub-Scores</h3>
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3">Cognitive Domain</th>
                  <th className="p-3">Exercise Modality</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Autobiographical Recall</td>
                  <td className="p-3">Who is This? / Photo Cue</td>
                  <td className="p-3 font-bold">86%</td>
                  <td className="p-3 text-emerald-700 font-bold">Stable ✅</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Temporal & Festival Ordering</td>
                  <td className="p-3">Festival Memories</td>
                  <td className="p-3 font-bold">74%</td>
                  <td className="p-3 text-amber-700 font-bold">Monitor ⚠️</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Spoken Narrative Clarity</td>
                  <td className="p-3">Remember & Speak</td>
                  <td className="p-3 font-bold">82%</td>
                  <td className="p-3 text-teal-700 font-bold">Good 🎙️</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Impression Notes Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 block">Clinician Assessment & Recommendations</label>
          <textarea
            rows={3}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
          />
        </div>

        {/* Doctor Sign-Off Block */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#0D5C4D]" />
            <span className="text-slate-500 font-medium">Verified by SmritiSetu Telemetry Engine</span>
          </div>

          <div className="text-right">
            <span className="font-bold block text-slate-900 font-['Outfit']">Dr. Mehta, MD (Neurology)</span>
            <span className="text-[10px] text-slate-400">Lead Neurologist • Tele-Dementia Sub-centre</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReports;
