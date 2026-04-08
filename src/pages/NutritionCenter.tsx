import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Utensils, Filter, Download } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { downloadJSON } from '../lib/exportUtils';

export function NutritionCenter() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const handleExport = () => {
    const scheduleData = {
      weekStarting: format(startDate, 'yyyy-MM-dd'),
      meals: mealTypes.map(type => ({
        type,
        days: weekDays.map(day => ({
          date: format(day, 'yyyy-MM-dd'),
          plan: 'Standard Athlete Menu' // In a real app, this would be actual data
        }))
      }))
    };
    downloadJSON(scheduleData, `Nutrition_Schedule_${format(startDate, 'yyyy_MM_dd')}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 h-full flex flex-col overflow-hidden custom-scrollbar"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition Center</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Meal planning, catering coordination, and group assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Schedule
          </button>
          <button className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/20">
            <Plus className="w-4 h-4" />
            New Meal Plan
          </button>
        </div>
      </div>

      {/* Calendar Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pastel-red rounded-xl border border-brand-red/10">
              <CalendarIcon className="w-5 h-5 text-brand-red" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {format(startDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button className="px-4 py-1.5 rounded-lg bg-white text-[10px] font-bold text-slate-900 shadow-sm border border-slate-200">Weekly</button>
            <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Monthly</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button className="p-2.5 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 border-r border-slate-100 flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Meal Type</span>
          </div>
          {weekDays.map((date, i) => {
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={i} className={cn(
                "p-4 border-r border-slate-100 text-center transition-colors",
                isToday ? "bg-pastel-red/30" : ""
              )}>
                <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", isToday ? "text-brand-red" : "text-slate-400")}>
                  {format(date, 'EEE')}
                </div>
                <div className={cn(
                  "text-xl font-black w-10 h-10 mx-auto flex items-center justify-center rounded-2xl transition-all",
                  isToday ? "bg-brand-red text-white shadow-lg shadow-brand-red/20 scale-110" : "text-slate-400"
                )}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Meal Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mealTypes.map((meal, idx) => (
            <div key={meal} className="grid grid-cols-8 border-b border-slate-100 min-h-[140px] group/row">
              <div className="p-6 border-r border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center gap-3 group-hover/row:bg-slate-50/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meal}</span>
              </div>
              {weekDays.map((date, i) => (
                <div key={i} className="p-3 border-r border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group/cell relative">
                  {/* Mock content for some cells */}
                  {(i === 0 || i === 2 || i === 4) && idx === 1 && (
                     <div className="bg-white border border-slate-200 rounded-2xl p-4 h-full shadow-sm group-hover/cell:border-brand-red/30 transition-all">
                       <div className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-1">High Carb</div>
                       <div className="text-xs font-bold text-slate-900 mb-2 leading-tight">Grilled Salmon & Quinoa</div>
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Senior Singles</span>
                       </div>
                     </div>
                  )}
                  {(i === 1 || i === 3 || i === 5) && idx === 2 && (
                     <div className="bg-pastel-red/50 border border-brand-red/10 rounded-2xl p-4 h-full shadow-sm group-hover/cell:border-brand-red/40 transition-all">
                       <div className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-1">Recovery</div>
                       <div className="text-xs font-bold text-slate-900 mb-2 leading-tight">Lean Protein & Greens</div>
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Injured Group</span>
                       </div>
                     </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all scale-90 group-hover/cell:scale-100 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center shadow-xl shadow-brand-red/30">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

