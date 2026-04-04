import { useState } from 'react';
import { Filter, Search, ChevronRight, Activity, Droplets, Scale, UserPlus, Grid, List } from 'lucide-react';
import { athletes, Division, Sector } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AthleteDirectoryProps {
  onSelectAthlete: (id: string) => void;
}

export function AthleteDirectory({ onSelectAthlete }: AthleteDirectoryProps) {
  const [selectedDivision, setSelectedDivision] = useState<Division | 'All'>('All');
  const [selectedSector, setSelectedSector] = useState<Sector | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const divisions: (Division | 'All')[] = ['All', 'U-13', 'U-15', 'U-17', 'U-19', 'Senior'];
  const sectors: (Sector | 'All')[] = ['All', "Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

  const filteredAthletes = athletes.filter(a => {
    const matchDiv = selectedDivision === 'All' || a.division === selectedDivision;
    const matchSec = selectedSector === 'All' || a.sector === selectedSector;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiv && matchSec && matchSearch;
  });

  return (
    <div className="p-8 space-y-8 h-full flex flex-col overflow-hidden custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Athlete Directory</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm font-medium">Manage and monitor {athletes.length} professional athletes.</p>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">By DR LAILA</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-64 focus-within:border-brand-red/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/20">
            <UserPlus className="w-4 h-4" />
            Add Athlete
          </button>
        </div>
      </div>

      {/* Advanced Filtering System */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Division Filter</label>
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{selectedDivision}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {divisions.map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    selectedDivision === div 
                      ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sector Filter</label>
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{selectedSector}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    selectedSector === sec 
                      ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={cn(
              "grid gap-6 pb-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredAthletes.map(athlete => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete.id)}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-red/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white border border-slate-200 hover:border-brand-red/30 rounded-3xl p-6 cursor-pointer transition-all shadow-sm group-hover:shadow-md">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={athlete.imageUrl} alt={athlete.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 group-hover:border-brand-red/50 transition-colors" />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                          athlete.status === 'Fit' ? "bg-green-500" : 
                          athlete.status === 'Injured' ? "bg-red-500" : "bg-yellow-500"
                        )}></div>
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold text-lg group-hover:text-brand-red transition-colors leading-tight">{athlete.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{athlete.division}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{athlete.sector}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <MetricBox icon={Scale} label="Weight" value={`${athlete.weight}kg`} alert={Math.abs(athlete.weight - athlete.targetWeight) > 1.5} />
                    <MetricBox icon={Activity} label="Compliance" value={`${athlete.compliance}%`} color={athlete.compliance > 90 ? 'green' : athlete.compliance > 80 ? 'yellow' : 'red'} />
                    <MetricBox icon={Droplets} label="Hydration" value={`${athlete.hydrationLevel}%`} alert={athlete.hydrationLevel < 90} />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                          {i === 3 ? '+5' : <Utensils className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Check: 4h ago</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value, alert, color }: { icon: any, label: string, value: string, alert?: boolean, color?: 'red' | 'yellow' | 'green' }) {
  const colorMap = {
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500'
  };

  return (
    <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50 flex flex-col items-center justify-center text-center group/metric hover:border-slate-700 transition-colors">
      <Icon className={cn("w-4 h-4 mb-1.5 transition-transform group-hover/metric:scale-110", alert ? "text-brand-red" : "text-slate-500")} />
      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">{label}</span>
      <span className={cn(
        "text-xs font-black tracking-tight",
        alert ? "text-brand-red" : color ? colorMap[color] : "text-white"
      )}>
        {value}
      </span>
    </div>
  );
}

import { Utensils } from 'lucide-react';

