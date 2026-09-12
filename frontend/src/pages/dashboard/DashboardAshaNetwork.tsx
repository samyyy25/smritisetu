import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  Users,
  MapPin,
  CalendarCheck,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface DashboardAshaNetworkProps {
  onBackToOverview?: () => void;
}

export const DashboardAshaNetwork: React.FC<DashboardAshaNetworkProps> = ({
  onBackToOverview,
}) => {
  const navigate = useNavigate();

  const ashaWorkers = [
    {
      id: 'asha_1',
      name: 'Sunita Kalita',
      role: 'Lead ASHA Facilitator',
      centre: 'Dispur Health Sub-Centre, Ward 4',
      assignedCount: 4,
      visitsThisMonth: 14,
      phone: '+91 98640 12345',
      status: 'Active Field Duty',
    },
    {
      id: 'asha_2',
      name: 'Pratima Deka',
      role: 'Community Health Volunteer',
      centre: 'Beltola Community Clinic',
      assignedCount: 4,
      visitsThisMonth: 11,
      phone: '+91 98640 67890',
      status: 'Active Field Duty',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner with Link to ASHA Field Portal */}
      <div className="bg-gradient-to-r from-[#0D5C4D] to-[#127A66] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-amber-300 border border-white/20">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Community Health Integration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ASHA Health Worker Network</h1>
          <p className="text-sm text-teal-100 leading-relaxed">
            Connects clinicians, caregivers, and grassroots Accredited Social Health Activists (ASHAs)
            for timely home check-ins and field interventions across Northeast India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/asha')}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <span>Open ASHA Mobile View</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF6F3] text-[#0D5C4D] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">8</span>
            <span className="text-xs text-slate-500 block font-medium">Assigned Patients Monitored</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-800">25</span>
            <span className="text-xs text-slate-500 block font-medium">Home Visits This Month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-800">100%</span>
            <span className="text-xs text-slate-500 block font-medium">Alert Response Compliance</span>
          </div>
        </div>
      </div>

      {/* Assigned ASHA Field Workers List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Field Facilitators</h2>
            <p className="text-xs text-slate-500 mt-0.5">Grassroots workers covering primary health sub-centres</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/asha')}
            className="text-xs font-bold text-[#0D5C4D] hover:underline flex items-center gap-1"
          >
            <span>Launch Field Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {ashaWorkers.map((worker) => (
            <div
              key={worker.id}
              className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D5C4D] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">{worker.name}</span>
                    <span className="text-xs text-slate-500">{worker.role}</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {worker.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.centre}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Assigned: <strong>{worker.assignedCount} patients</strong></span>
                  <span>Visits: <strong>{worker.visitsThisMonth} logged</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
