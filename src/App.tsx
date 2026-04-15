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
import { ClinicalRecap } from './pages/ClinicalRecap';

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
      case 'clinical-recap':
        return <ClinicalRecap />;
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
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-white text-slate-900 overflow-hidden font-sans">
      <Sidebar currentView={currentView === 'profile' ? 'directory' : currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
              <img src="https://i.imgur.com/qgCJK08.png" alt="Logo" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[12px] tracking-tight text-slate-900 leading-none">NUTRITION</span>
              <span className="font-black text-[12px] tracking-tight text-slate-900 leading-none">PERFORMANCE</span>
            </div>
          </div>
          <div className="relative">
            <img src="https://picsum.photos/seed/nutritionist/100/100" alt="User" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
        
        <main className="flex-1 overflow-hidden relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

