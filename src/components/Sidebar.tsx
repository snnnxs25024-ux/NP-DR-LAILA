import { Activity, Users, Utensils, HeartPulse, Stethoscope, BarChart3, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Athletes', icon: Users },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'injury', label: 'Injury', icon: Stethoscope },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen text-slate-500 relative z-20 no-print">
      {/* Logo Section */}
      <div className="p-8 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-brand-red to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-rose-600 flex items-center justify-center shadow-lg shadow-brand-red/20">
              <span className="text-white font-black text-xl italic">DL</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">NUTRITION</span>
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">PERFORMANCE</span>
          </div>
        </div>
        <div className="mt-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 inline-flex items-center gap-2 w-fit shadow-lg shadow-slate-900/20">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">By</span>
          <span className="text-[10px] font-black bg-gradient-to-r from-brand-red to-rose-500 bg-clip-text text-transparent uppercase tracking-[0.2em]">
            DR LAILA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
        Main Interface
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative",
                isActive 
                  ? "bg-pastel-red text-brand-red shadow-sm" 
                  : "hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-brand-red" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </div>
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-brand-red rounded-r-full"
                />
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-brand-red/50" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img src="https://picsum.photos/seed/nutritionist/100/100" alt="User" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-slate-900 truncate">Dr. Laila</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lead Sports Nutritionist</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 shadow-sm">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

