import { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Search,
  TrendingUp, 
  Calendar, 
  Download, 
  X, 
  Target,
  UserCheck,
  UserMinus,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { athletes } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { downloadCSV } from '../lib/exportUtils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function Dashboard() {
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [activeAthleteId, setActiveAthleteId] = useState<string | null>(null);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M'>('6M');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAlertsModalOpen(false);
        setActiveAthleteId(null);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.athlete-detail-trigger')) {
        setActiveAthleteId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Stats Calculations
  const activeCount = athletes.filter(a => a.status === 'Fit').length;
  const nonActiveCount = athletes.filter(a => a.status === 'Cedera' || a.status === 'Pemulihan').length;
  const avgCompliance = Math.round(athletes.reduce((acc, curr) => acc + curr.compliance, 0) / athletes.length);
  
  // Target Achievement Logic
  const targetStatus = athletes.map(a => {
    // Strict logic: must exactly match target to be considered "reached"
    const weightDiff = Math.abs(a.weight - a.targetWeight);
    const bfDiff = Math.abs(a.bodyFatInBody - a.targetBodyFat);
    
    const weightReached = a.weight === a.targetWeight;
    const bfReached = a.bodyFatInBody === a.targetBodyFat;
    const reached = weightReached && bfReached;

    let missedLabel = "";
    if (!reached) {
      if (!weightReached && !bfReached) missedLabel = "BB & BF";
      else if (!weightReached) missedLabel = "BB";
      else if (!bfReached) missedLabel = "BF";
    }

    return { ...a, reached, weightDiff, bfDiff, weightReached, bfReached, missedLabel };
  });

  const reachedAthletes = targetStatus.filter(a => a.reached && a.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase()));
  const inProgressAthletes = targetStatus.filter(a => !a.reached && a.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase()));

  // Category Summary
  const divisions = Array.from(new Set(athletes.map(a => a.division)));
  const categorySummary = divisions.map(div => {
    const divAthletes = targetStatus.filter(a => a.division === div);
    const reachedCount = divAthletes.filter(a => a.reached).length;
    const percentage = Math.round((reachedCount / divAthletes.length) * 100);
    return { name: div, percentage, total: divAthletes.length, reached: reachedCount };
  });

  // Mock Global Performance Data
  const performanceData = {
    '1M': [
      { name: 'W1', performance: 88, target: 90 },
      { name: 'W2', performance: 90, target: 90 },
      { name: 'W3', performance: 89, target: 90 },
      { name: 'W4', performance: 92, target: 90 },
    ],
    '3M': [
      { name: 'Apr', performance: 85, target: 85 },
      { name: 'Mei', performance: 88, target: 90 },
      { name: 'Jun', performance: 92, target: 90 },
    ],
    '6M': [
      { name: 'Jan', performance: 78, target: 85 },
      { name: 'Feb', performance: 82, target: 85 },
      { name: 'Mar', performance: 80, target: 85 },
      { name: 'Apr', performance: 85, target: 85 },
      { name: 'Mei', performance: 88, target: 90 },
      { name: 'Jun', performance: 92, target: 90 },
    ]
  };

  const currentPerformanceData = performanceData[timeRange];

  const handleDownloadSummary = () => {
    const summaryData = [{
      Tanggal: '14 April 2026',
      TotalAtlet: athletes.length,
      Aktif: activeCount,
      NonAktif: nonActiveCount,
      RataRataKepatuhan: `${avgCompliance}%`,
      TargetTercapai: reachedAthletes.length
    }];
    downloadCSV(summaryData, 'Laporan_Dashboard_Gizi');
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
      className="p-4 md:p-8 space-y-6 md:space-y-8 h-full overflow-y-auto custom-scrollbar bg-slate-50/50"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Mission Control</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-semibold flex items-center gap-2">
            Ringkasan Strategis Performa Atlet
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-brand-red">Dr. Laila</span>
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={handleDownloadSummary}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-4 md:px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Ekspor Data</span>
            <span className="md:hidden">Ekspor</span>
          </button>
          <div className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 bg-slate-900 border border-slate-800 px-4 md:px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/10">
            <Calendar className="w-4 h-4 text-brand-red" />
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">14 April 2026</span>
          </div>
        </div>
      </div>

      {/* Top Stats: Active vs Non-Active */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Widget 
          variants={item}
          title="Total Atlet" 
          value={athletes.length.toString()} 
          icon={Users} 
          color="blue" 
        />
        <Widget 
          variants={item}
          title="Atlet Aktif" 
          value={activeCount.toString()} 
          icon={UserCheck} 
          color="green" 
        />
        <Widget 
          variants={item}
          title="Non-Aktif" 
          value={nonActiveCount.toString()} 
          icon={UserMinus} 
          color="red" 
        />
        <Widget 
          variants={item}
          title="Target Tercapai" 
          value={reachedAthletes.length.toString()} 
          icon={Target} 
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Achievement Lists */}
        <motion.div 
          variants={item}
          className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <PieChartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Status Pencapaian Target</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit Real-Time Komposisi Tubuh</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Aesthetic Search Bar */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-red to-rose-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
                <div className="relative flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:border-brand-red/30 focus-within:shadow-xl focus-within:shadow-brand-red/5 transition-all duration-300">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand-red transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atlet..." 
                    value={dashboardSearchQuery}
                    onChange={(e) => setDashboardSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-900 w-full md:w-48 placeholder:text-slate-400 font-bold"
                  />
                  {dashboardSearchQuery && (
                    <button 
                      onClick={() => setDashboardSearchQuery('')}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200/50 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tercapai</span>
                  <span className="text-xs font-black text-emerald-600">{reachedAthletes.length}</span>
                </div>
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proses</span>
                  <span className="text-xs font-black text-brand-red">{inProgressAthletes.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reached Target */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Target Tercapai
              </h3>
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {reachedAthletes.map(athlete => (
                  <div key={athlete.id} className="athlete-detail-trigger">
                    <div 
                      onClick={() => setActiveAthleteId(activeAthleteId === athlete.id ? null : athlete.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                        activeAthleteId === athlete.id 
                          ? "bg-emerald-100 border-emerald-400 shadow-md" 
                          : "bg-emerald-50/30 border-emerald-100/50 hover:border-emerald-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img src={athlete.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-sm font-bold text-slate-700">{athlete.name}</span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase">{athlete.division}</div>
                    </div>
                    
                    {/* Detail Card (Expanded) */}
                    <AnimatePresence>
                      {activeAthleteId === athlete.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-4 bg-white border border-emerald-100 rounded-2xl shadow-inner space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Tinggi Badan</span>
                                <span className="text-xs font-black text-slate-700">{athlete.height} cm</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Status</span>
                                <span className="text-xs font-black text-emerald-600">Target Tercapai</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">BB / Target</span>
                                <span className="text-xs font-black text-slate-700">{athlete.weight} / {athlete.targetWeight} kg</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">BF / Target</span>
                                <span className="text-xs font-black text-slate-700">{athlete.bodyFatInBody}% / {athlete.targetBodyFat}%</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {reachedAthletes.length === 0 && (
                  <div className="text-xs text-slate-400 font-medium italic p-4 text-center">Belum ada data tercapai</div>
                )}
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Masih Dalam Proses
              </h3>
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {inProgressAthletes.map(athlete => (
                  <div key={athlete.id} className="athlete-detail-trigger">
                    <div 
                      onClick={() => setActiveAthleteId(activeAthleteId === athlete.id ? null : athlete.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                        activeAthleteId === athlete.id
                          ? "bg-slate-200 border-brand-red shadow-md"
                          : "bg-slate-50 border-slate-100 hover:border-brand-red/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img src={athlete.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-sm font-bold text-slate-700">{athlete.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{athlete.division}</span>
                        <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">{athlete.missedLabel}</span>
                      </div>
                    </div>

                    {/* Detail Card (Expanded) */}
                    <AnimatePresence>
                      {activeAthleteId === athlete.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-inner space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Tinggi Badan</span>
                                <span className="text-xs font-black text-slate-700">{athlete.height} cm</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Fokus Perbaikan</span>
                                <span className="text-xs font-black text-brand-red">{athlete.missedLabel}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">BB / Target</span>
                                <span className={cn("text-xs font-black", athlete.weightReached ? "text-emerald-600" : "text-brand-red")}>
                                  {athlete.weight} / {athlete.targetWeight} kg
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">BF / Target</span>
                                <span className={cn("text-xs font-black", athlete.bfReached ? "text-emerald-600" : "text-brand-red")}>
                                  {athlete.bodyFatInBody}% / {athlete.targetBodyFat}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Summary */}
        <motion.div 
          variants={item}
          className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-pastel-orange flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            Ringkasan Kategori
          </h2>
          <div className="space-y-6">
            {categorySummary.map(cat => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm font-black text-slate-900">{cat.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.reached} dari {cat.total} atlet tercapai</div>
                  </div>
                  <div className="text-sm font-black text-brand-red">{cat.percentage}%</div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-brand-red rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Global Performance Chart */}
      <motion.div 
        variants={item}
        className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-green flex items-center justify-center shadow-inner">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              Tren Performa Global
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-13">Analisis Kepatuhan & Target Tim</p>
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {(['1M', '3M', '6M'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                  timeRange === range 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {range === '1M' ? '1 Bulan' : range === '3M' ? '3 Bulan' : '6 Bulan'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentPerformanceData}>
              <defs>
                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="performance" 
                stroke="#E11D48" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorPerf)" 
                name="Performa Tim"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#94a3b8" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
                name="Target Baseline"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Alerts Modal (Kept for functionality) */}
      <AnimatePresence>
        {isAlertsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Peringatan Sistem</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Anomali data yang perlu perhatian segera</p>
                </div>
                <button onClick={() => setIsAlertsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                {athletes.filter(a => a.hydrationLevel < 90 || Math.abs(a.weight - a.targetWeight) > 1.5).map(athlete => (
                  <div key={athlete.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={athlete.imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                      <div>
                        <div className="text-base font-black text-slate-900">{athlete.name}</div>
                        <div className="flex gap-3 mt-1">
                          {athlete.hydrationLevel < 90 && (
                            <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Hidrasi: {athlete.hydrationLevel}%</span>
                          )}
                          {Math.abs(athlete.weight - athlete.targetWeight) > 1.5 && (
                            <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Berat: {athlete.weight}kg (Target: {athlete.targetWeight}kg)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Kritis
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsAlertsModalOpen(false)} className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Widget({ title, value, icon: Icon, color, variants }: { title: string, value: string, icon: any, color: 'blue' | 'red' | 'green' | 'yellow', variants: any }) {
  const colorStyles = {
    blue: 'bg-pastel-blue text-blue-600 border-blue-100',
    red: 'bg-pastel-red text-brand-red border-red-100',
    green: 'bg-pastel-green text-green-600 border-green-100',
    yellow: 'bg-pastel-orange text-yellow-600 border-yellow-100',
  };

  return (
    <motion.div 
      variants={variants}
      className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-200 flex flex-col relative overflow-hidden group hover:border-brand-red/20 transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className={cn("p-2 md:p-3 rounded-xl md:rounded-2xl border transition-transform group-hover:scale-110 duration-500", colorStyles[color])}>
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
        <div className="text-[8px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">{title}</div>
      </div>
    </motion.div>
  );
}

// Need to import BarChart3 since it's used
// Already imported at top

