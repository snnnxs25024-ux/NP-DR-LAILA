/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance (Code Splitting)
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const AthleteDirectory = lazy(() => import('./pages/AthleteDirectory').then(module => ({ default: module.AthleteDirectory })));
const AthleteProfile = lazy(() => import('./pages/AthleteProfile').then(module => ({ default: module.AthleteProfile })));
const Assessments = lazy(() => import('./pages/Assessments').then(module => ({ default: module.Assessments })));
const ClinicalRecap = lazy(() => import('./pages/ClinicalRecap').then(module => ({ default: module.ClinicalRecap })));

// Loading Fallback UI
const PageLoader = () => (
  <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-white/80 backdrop-blur-sm">
    <div className="relative w-20 h-20 flex items-center justify-center mb-6">
      <div className="absolute inset-0 bg-brand-red/10 rounded-2xl animate-ping opacity-75"></div>
      <img src="https://i.imgur.com/qgCJK08.png" alt="Logo" className="w-16 h-16 object-contain relative z-10 animate-pulse" referrerPolicy="no-referrer" />
    </div>
    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Memuat...</span>
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('np_auth') === 'true';
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('np_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('np_auth');
    setCurrentView('dashboard');
  };

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-white text-slate-900 overflow-hidden font-sans">
      <Sidebar currentView={currentView === 'profile' ? 'directory' : currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
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
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500">Keluar</button>
            <div className="relative">
              <img src="https://picsum.photos/seed/nutritionist/100/100" alt="User" loading="lazy" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-hidden relative pb-safe">
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

