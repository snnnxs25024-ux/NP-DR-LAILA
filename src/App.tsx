/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AthleteDirectory } from './pages/AthleteDirectory';
import { AthleteProfile } from './pages/AthleteProfile';
import { Assessments } from './pages/Assessments';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const handleSelectAthlete = (id: string) => {
    setSelectedAthleteId(id);
    setCurrentView('profile');
  };

  const handleBackToDirectory = () => {
    setSelectedAthleteId(null);
    setCurrentView('directory');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'directory':
        return <AthleteDirectory onSelectAthlete={handleSelectAthlete} />;
      case 'assessments':
        return <Assessments />;
      case 'profile':
        if (selectedAthleteId) {
          return <AthleteProfile athleteId={selectedAthleteId} onBack={handleBackToDirectory} />;
        }
        return <AthleteDirectory onSelectAthlete={handleSelectAthlete} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      <Sidebar currentView={currentView === 'profile' ? 'directory' : currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-hidden relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

