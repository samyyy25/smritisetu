import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { SidebarNav, SidebarNavItemId } from '../components/design-system/SidebarNav';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { DashboardPatients } from './dashboard/DashboardPatients';
import { DashboardPatientDetail } from './dashboard/DashboardPatientDetail';
import { DashboardAlerts } from './dashboard/DashboardAlerts';
import { DashboardAshaNetwork } from './dashboard/DashboardAshaNetwork';
import { DashboardCognitiveTrends } from './dashboard/DashboardCognitiveTrends';
import { DashboardMemoryLibrary } from './dashboard/DashboardMemoryLibrary';
import { DashboardReminders } from './dashboard/DashboardReminders';
import { DashboardReports } from './dashboard/DashboardReports';
import { DashboardSettings } from './dashboard/DashboardSettings';
import { DashboardLocation } from './dashboard/DashboardLocation';
import { API_BASE_URL } from '../config';

export const CaregiverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<SidebarNavItemId>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [locationPatientId, setLocationPatientId] = useState<string>('23f55848-e317-4a06-ae05-3aa42d94cd10');
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(3);

  // Sync with searchParams if present e.g. ?tab=location&patientId=xyz or ?tab=patients&patientId=xyz
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SidebarNavItemId | null;
    const patientParam = searchParams.get('patientId');

    if (tabParam === 'location') {
      setActiveTab('location');
      if (patientParam) {
        setLocationPatientId(patientParam);
      }
      setSelectedPatientId(null);
    } else if (patientParam) {
      setSelectedPatientId(patientParam);
      setActiveTab('patients');
    } else if (tabParam) {
      setActiveTab(tabParam);
      setSelectedPatientId(null);
    }
  }, [searchParams]);

  // Fetch active alerts count for SidebarNav badge
  useEffect(() => {
    const fetchBadgeCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts?status=ACTIVE`);
        if (res.ok) {
          const data = await res.json();
          setActiveAlertsCount(data.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch alerts count for sidebar:', err);
      }
    };
    fetchBadgeCount();
  }, [activeTab]);

  const handleSelectTab = (id: SidebarNavItemId) => {
    setActiveTab(id);
    setSelectedPatientId(null);
    setSearchParams({ tab: id });
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    setSearchParams({ tab: 'patients', patientId });
  };

  const handleSelectPatientLocation = (patientId: string) => {
    setLocationPatientId(patientId);
    setActiveTab('location');
    setSelectedPatientId(null);
    setSearchParams({ tab: 'location', patientId });
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setSearchParams({ tab: 'patients' });
  };

  const handleUploadMemory = () => {
    navigate('/dashboard/memories/new');
  };

  // Render appropriate content based on tab & selectedPatientId
  const renderContent = () => {
    if (selectedPatientId) {
      return (
        <DashboardPatientDetail
          patientId={selectedPatientId}
          onBack={handleBackToPatients}
          onAddMemory={handleUploadMemory}
          onViewLocation={(pId) => handleSelectPatientLocation(pId)}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            onNavigateToPatient={handleSelectPatient}
            onNavigateToAlerts={() => handleSelectTab('alerts')}
            onNavigateToPatients={() => handleSelectTab('patients')}
            onNavigateToLocation={() => handleSelectPatientLocation(locationPatientId || '23f55848-e317-4a06-ae05-3aa42d94cd10')}
          />
        );
      case 'patients':
        return (
          <DashboardPatients
            onSelectPatient={handleSelectPatient}
            onSelectPatientLocation={handleSelectPatientLocation}
            onAddMemory={handleUploadMemory}
          />
        );
      case 'location':
        return (
          <DashboardLocation
            patientId={locationPatientId}
            onSelectPatient={handleSelectPatientLocation}
            onBackToOverview={() => handleSelectTab('overview')}
            onBackToPatients={() => handleSelectTab('patients')}
          />
        );
      case 'alerts':
        return <DashboardAlerts onSelectPatient={handleSelectPatient} />;
      case 'cognitive-trends':
        return (
          <DashboardCognitiveTrends
            onBackToOverview={() => handleSelectTab('overview')}
            onSelectPatient={handleSelectPatient}
          />
        );
      case 'memory-library':
        return (
          <DashboardMemoryLibrary
            onBackToOverview={() => handleSelectTab('overview')}
            onUploadMemory={handleUploadMemory}
          />
        );
      case 'reminders':
        return (
          <DashboardReminders
            onBackToOverview={() => handleSelectTab('overview')}
          />
        );
      case 'asha-network':
        return (
          <DashboardAshaNetwork
            onBackToOverview={() => handleSelectTab('overview')}
          />
        );
      case 'reports':
        return (
          <DashboardReports
            onBackToOverview={() => handleSelectTab('overview')}
          />
        );
      case 'settings':
        return (
          <DashboardSettings
            onBackToOverview={() => handleSelectTab('overview')}
          />
        );
      default:
        return (
          <DashboardOverview
            onNavigateToPatient={handleSelectPatient}
            onNavigateToAlerts={() => handleSelectTab('alerts')}
            onNavigateToPatients={() => handleSelectTab('patients')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row p-3 md:p-6 gap-6">
      {/* Left Sidebar Navigation */}
      <div className="md:sticky md:top-6 self-start flex-shrink-0">
        <SidebarNav
          activeId={activeTab}
          onSelect={handleSelectTab}
          alertsCount={activeAlertsCount}
          doctorName="Dr. Mehta"
          doctorRole="Lead Neurologist"
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full min-w-0">
        {renderContent()}
      </main>
    </div>
  );
};
