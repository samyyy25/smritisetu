import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelectorScreen } from './pages/RoleSelectorScreen';
import { DevToolsScreen } from './pages/DevToolsScreen';
import { Styleguide } from './pages/Styleguide';
import { PatientAppHome } from './pages/PatientAppHome';
import { MemoryGamesList } from './pages/MemoryGamesList';
import { PlaceholderScreen } from './pages/PlaceholderScreen';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { PatientMemories } from './pages/PatientMemories';
import { CaregiverMemoryUpload } from './pages/CaregiverMemoryUpload';
import { MemoryMatch } from './pages/games/MemoryMatch';
import { WhoIsThis } from './pages/games/WhoIsThis';
import { FestivalMemories } from './pages/games/FestivalMemories';
import { RememberAndSpeak } from './pages/games/RememberAndSpeak';
import { DailyLifeChallenge } from './pages/games/DailyLifeChallenge';
import { MyLifeStory } from './pages/games/MyLifeStory';
import { RemindersScreen } from './pages/RemindersScreen';
import { PatientProfileScreen } from './pages/PatientProfileScreen';
import { VoiceAssistantScreen } from './pages/VoiceAssistantScreen';
import { OfflineSyncScreen } from './pages/OfflineSyncScreen';
import { AshaFieldWorkerScreen } from './pages/AshaFieldWorkerScreen';
import { SplashScreen } from './pages/SplashScreen';
import { OnboardingScreen } from './pages/OnboardingScreen';
import { LanguageSelectionScreen } from './pages/LanguageSelectionScreen';
import { MoreMenuScreen } from './pages/MoreMenuScreen';
import { GameSetupScreen } from './pages/GameSetupScreen';
import { LocationSetupScreen } from './pages/LocationSetupScreen';
import { MyPlacesScreen } from './pages/MyPlacesScreen';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { PageVoiceGuideAnnouncer } from './components/PageVoiceGuideAnnouncer';

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <Router>
        <PageVoiceGuideAnnouncer />
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-slate-800">
          <main className="flex-1">
            <Routes>
              {/* Root: Role Selector Screen */}
              <Route path="/" element={<RoleSelectorScreen />} />

              {/* Developer & Testing Tools (Isolated from real user flows) */}
              <Route path="/dev-tools" element={<DevToolsScreen />} />
              <Route path="/styleguide" element={<Styleguide />} />
              <Route path="/offline-sync" element={<OfflineSyncScreen />} />

              {/* Splash & Onboarding */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/languages" element={<LanguageSelectionScreen />} />

              {/* Patient App Dedicated Routes */}
              <Route path="/patient/home" element={<PatientAppHome />} />
              <Route path="/patient" element={<Navigate to="/patient/home" replace />} />

              {/* Memory Games List */}
              <Route path="/games" element={<MemoryGamesList />} />

              {/* Individual Games */}
              <Route path="/games/memory-match" element={<MemoryMatch />} />
              <Route path="/games/who-is-this" element={<WhoIsThis />} />
              <Route path="/games/festival-memories" element={<FestivalMemories />} />
              <Route path="/games/remember-speak" element={<RememberAndSpeak />} />
              <Route path="/games/remember-and-speak" element={<RememberAndSpeak />} />
              <Route path="/games/daily-life" element={<DailyLifeChallenge />} />
              <Route path="/games/daily-challenge" element={<DailyLifeChallenge />} />
              <Route path="/games/life-story" element={<MyLifeStory />} />
              <Route path="/games/my-life-story" element={<MyLifeStory />} />

              {/* Game Setup Routes from More Menu */}
              <Route path="/more/games/:gameKey/setup" element={<GameSetupScreen />} />
              <Route path="/setup/my-places" element={<LocationSetupScreen />} />
              <Route path="/setup/places" element={<LocationSetupScreen />} />
              <Route path="/more/places/setup" element={<LocationSetupScreen />} />

              {/* Individual Game Placeholders */}
              <Route path="/games/:gameId" element={<PlaceholderScreen tabId="games" />} />

              {/* Patient App Action Screens */}
              <Route path="/talk" element={<VoiceAssistantScreen />} />
              <Route path="/places" element={<MyPlacesScreen />} />
              <Route path="/patient/places" element={<MyPlacesScreen />} />
              <Route path="/my-places" element={<MyPlacesScreen />} />
              <Route path="/life-story" element={<MyLifeStory />} />
              <Route path="/reminders" element={<RemindersScreen />} />
              <Route path="/memories" element={<PatientMemories />} />
              <Route path="/profile" element={<PatientProfileScreen />} />
              <Route path="/more" element={<MoreMenuScreen />} />

              {/* Offline fallback route */}
              <Route path="/offline" element={<OfflineSyncScreen />} />
              <Route path="/sync" element={<OfflineSyncScreen />} />

              {/* Caregiver & ASHA Routes */}
              <Route path="/asha" element={<AshaFieldWorkerScreen />} />
              <Route path="/dashboard" element={<CaregiverDashboard />} />
              <Route path="/dashboard/memories/new" element={<CaregiverMemoryUpload />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AccessibilityProvider>
  );
};

export default App;
