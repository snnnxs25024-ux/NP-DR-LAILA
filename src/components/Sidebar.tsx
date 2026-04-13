import { Users, LogOut, ChevronRight, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Activity, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'directory', label: 'Atlet', icon: Users },
    { id: 'assessments', label: 'Asesmen', icon: Activity },
    { id: 'clinical-recap', label: 'Rekap Klinis', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="md:hidden bg-white border-t border-slate-200 flex flex-row items-center justify-around p-2 pb-safe z-20 no-print w-full shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl min-w-[64px] transition-all",
                isActive ? "text-brand-red" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg mb-1 transition-colors",
                isActive ? "bg-pastel-red" : "bg-transparent"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                isActive ? "text-brand-red font-bold" : ""
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isCollapsed ? 88 : 288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex bg-white border-r border-slate-200 flex-col h-screen text-slate-500 relative z-20 no-print overflow-hidden shrink-0"
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm z-30 transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>

        {/* Logo Section */}
        <div className={cn("p-8 flex flex-col gap-1 transition-all", isCollapsed ? "items-center px-0" : "items-start")}>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-br from-brand-red to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-rose-600 flex items-center justify-center shadow-lg shadow-brand-red/20">
                <span className="text-white font-black text-xl italic tracking-tighter">DL</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="font-black text-[16px] tracking-tight text-slate-900 leading-none">NUTRITION</span>
                  <span className="font-black text-[16px] tracking-tight text-slate-900 leading-none">PERFORMANCE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative",
                  isActive 
                    ? "bg-pastel-red text-brand-red shadow-sm" 
                    : "hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed ? "justify-center px-0" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={cn("w-5 h-5 transition-colors shrink-0", isActive ? "text-brand-red" : "text-slate-400 group-hover:text-slate-600")} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-brand-red rounded-r-full"
                  />
                )}
                {isActive && !isCollapsed && <ChevronRight className="w-4 h-4 text-brand-red/50" />}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={cn("p-6 mt-auto transition-all", isCollapsed ? "p-4" : "p-6")}>
          <div className={cn("rounded-2xl bg-slate-50 border border-slate-200 group hover:border-slate-300 transition-all", isCollapsed ? "p-2 flex flex-col items-center" : "p-4")}>
            <div className={cn("flex items-center gap-3 transition-all", isCollapsed ? "mb-0" : "mb-4")}>
              <div className="relative shrink-0">
                <img src="https://picsum.photos/seed/nutritionist/100/100" alt="User" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="font-bold text-sm text-slate-900 truncate">Dr. Laila</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ahli Gizi Olahraga Utama</span>
                </motion.div>
              )}
            </div>
            {!isCollapsed && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </motion.button>
            )}
            {isCollapsed && (
              <button className="mt-4 p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all border border-slate-200 shadow-sm">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

