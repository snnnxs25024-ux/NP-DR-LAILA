import { Bell, Search, Settings, HelpCircle } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
      <div className="flex flex-col">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Performance Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PBSI National Training Center</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
          <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">By DR LAILA</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 w-80 focus-within:border-brand-red/50 focus-within:ring-1 focus-within:ring-brand-red/50 transition-all group">
          <Search className="w-4 h-4 group-focus-within:text-brand-red transition-colors" />
          <input 
            type="text" 
            placeholder="Search athletes or metrics..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button className="relative p-2.5 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 group">
            <Bell className="w-5 h-5 group-hover:shake" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-red rounded-full border-2 border-white shadow-[0_0_10px_rgba(225,29,72,0.2)]"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

