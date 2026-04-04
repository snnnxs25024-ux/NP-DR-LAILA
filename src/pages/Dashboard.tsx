import { Activity, AlertTriangle, CheckCircle2, Droplets, Scale, TrendingUp, Users, ArrowUpRight, Calendar, Download } from 'lucide-react';
import { athletes } from '../data/mockData';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { downloadCSV } from '../lib/exportUtils';

export function Dashboard() {
  const injuredCount = athletes.filter(a => a.status === 'Injured').length;
  const recoveryCount = athletes.filter(a => a.status === 'Recovery').length;
  const avgCompliance = Math.round(athletes.reduce((acc, curr) => acc + curr.compliance, 0) / athletes.length);
  const weightAlerts = athletes.filter(a => Math.abs(a.weight - a.targetWeight) > 1.5).length;

  const handleDownloadSummary = () => {
    const summaryData = [{
      Date: 'April 03, 2026',
      TotalAthletes: athletes.length,
      InjuredOrRecovery: injuredCount + recoveryCount,
      AvgCompliance: `${avgCompliance}%`,
      WeightAlerts: weightAlerts
    }];
    downloadCSV(summaryData, 'Dashboard_Summary_Report');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Welcome back, Dr. Laila. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadSummary}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            Download Summary
          </button>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-brand-red" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">April 03, 2026</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Widget 
          variants={item}
          title="Active Athletes" 
          value={athletes.length.toString()} 
          icon={Users} 
          trend="+2" 
          trendLabel="vs last month"
          color="blue" 
        />
        <Widget 
          variants={item}
          title="Medical Status" 
          value={`${injuredCount + recoveryCount}`} 
          icon={Activity} 
          trend={injuredCount.toString()} 
          trendLabel="currently injured"
          color="red" 
        />
        <Widget 
          variants={item}
          title="Avg Compliance" 
          value={`${avgCompliance}%`} 
          icon={CheckCircle2} 
          trend="+5%" 
          trendLabel="improvement"
          color="green" 
        />
        <Widget 
          variants={item}
          title="Weight Alerts" 
          value={weightAlerts.toString()} 
          icon={AlertTriangle} 
          trend="Critical" 
          trendLabel="needs review"
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Alerts - Bento Style */}
        <motion.div 
          variants={item}
          className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-200 relative overflow-hidden group shadow-sm"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-32 h-32 text-yellow-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pastel-orange flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                Priority Alerts
              </h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
            </div>

            <div className="space-y-4">
              {athletes.filter(a => a.hydrationLevel < 90).map(athlete => (
                <div key={`hyd-${athlete.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-red/30 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pastel-red flex items-center justify-center text-brand-red group-hover/item:scale-110 transition-transform">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{athlete.name}</div>
                      <div className="text-[10px] font-bold text-brand-red uppercase tracking-wider">Low Hydration: {athlete.hydrationLevel}%</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/item:text-slate-900 transition-colors" />
                </div>
              ))}
              {athletes.filter(a => Math.abs(a.weight - a.targetWeight) > 1.5).map(athlete => (
                <div key={`wt-${athlete.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-yellow-500/30 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pastel-orange flex items-center justify-center text-yellow-600 group-hover/item:scale-110 transition-transform">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{athlete.name}</div>
                      <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Weight Dev: {Math.abs(athlete.weight - athlete.targetWeight).toFixed(1)}kg</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/item:text-slate-900 transition-colors" />
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200">
              View All Alerts
            </button>
          </div>
        </motion.div>

        {/* Analytics Summary - Bento Style */}
        <motion.div 
          variants={item}
          className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              Performance Trends
            </h2>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg bg-slate-900 text-[10px] font-bold text-white">Weekly</button>
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Monthly</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-40">Compliance Analytics Chart</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Performer</div>
                <div className="text-sm font-bold text-slate-900">Jonatan Christie</div>
                <div className="text-[10px] font-bold text-green-600 mt-1">98% Compliance</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Needs Attention</div>
                <div className="text-sm font-bold text-slate-900">Alwi Farhan</div>
                <div className="text-[10px] font-bold text-red-600 mt-1">78% Compliance</div>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-red/50 border border-brand-red/10">
                <div className="text-[10px] font-bold text-brand-red uppercase tracking-widest mb-1">System Health</div>
                <div className="text-sm font-bold text-slate-900">All Systems Nominal</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">Last Sync: 2m ago</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Widget({ title, value, icon: Icon, trend, trendLabel, color, variants }: { title: string, value: string, icon: any, trend: string, trendLabel: string, color: 'blue' | 'red' | 'green' | 'yellow', variants: any }) {
  const colorStyles = {
    blue: 'bg-pastel-blue text-blue-600 border-blue-100',
    red: 'bg-pastel-red text-brand-red border-red-100',
    green: 'bg-pastel-green text-green-600 border-green-100',
    yellow: 'bg-pastel-orange text-yellow-600 border-yellow-100',
  };

  const trendColors = {
    blue: 'text-blue-600',
    red: 'text-brand-red',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
  };

  return (
    <motion.div 
      variants={variants}
      className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col relative overflow-hidden group hover:border-brand-red/20 transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl border transition-transform group-hover:scale-110 duration-500", colorStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-end">
          <span className={cn("text-xs font-extrabold tracking-tight", trendColors[color])}>{trend}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{trendLabel}</span>
        </div>
      </div>
      <div>
        <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">{title}</div>
      </div>
    </motion.div>
  );
}

// Need to import BarChart3 since it's used
import { BarChart3 } from 'lucide-react';

