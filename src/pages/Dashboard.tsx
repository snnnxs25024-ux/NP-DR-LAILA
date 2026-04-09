import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Droplets, Scale, TrendingUp, Users, ArrowUpRight, Calendar, Download, X, BarChart3 } from 'lucide-react';
import { athletes } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { downloadCSV } from '../lib/exportUtils';

export function Dashboard() {
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAlertsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const injuredCount = athletes.filter(a => a.status === 'Cedera').length;
  const recoveryCount = athletes.filter(a => a.status === 'Pemulihan').length;
  const avgCompliance = Math.round(athletes.reduce((acc, curr) => acc + curr.compliance, 0) / athletes.length);
  const weightAlerts = athletes.filter(a => Math.abs(a.weight - a.targetWeight) > 1.5).length;

  const handleDownloadSummary = () => {
    const summaryData = [{
      Tanggal: '03 April 2026',
      TotalAtlet: athletes.length,
      CederaAtauPemulihan: injuredCount + recoveryCount,
      RataRataKepatuhan: `${avgCompliance}%`,
      PeringatanBerat: weightAlerts
    }];
    downloadCSV(summaryData, 'Laporan_Ringkasan_Dashboard');
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
      className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar bg-grid-slate-100"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ringkasan Performa</h1>
          <p className="text-slate-500 text-sm mt-1 font-semibold flex items-center gap-2">
            Selamat datang kembali, Dr. Laila
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-brand-red">Ahli Gizi Utama</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadSummary}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            Ekspor Ringkasan
          </button>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/10">
            <Calendar className="w-4 h-4 text-brand-red" />
            <span className="text-xs font-black text-white uppercase tracking-widest">03 April 2026</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Widget 
          variants={item}
          title="Atlet Aktif" 
          value={athletes.length.toString()} 
          icon={Users} 
          trend="+2" 
          trendLabel="vs bulan lalu"
          color="blue" 
        />
        <Widget 
          variants={item}
          title="Status Medis" 
          value={`${injuredCount + recoveryCount}`} 
          icon={Activity} 
          trend={injuredCount.toString()} 
          trendLabel="sedang cedera"
          color="red" 
        />
        <Widget 
          variants={item}
          title="Rata-rata Kepatuhan" 
          value={`${avgCompliance}%`} 
          icon={CheckCircle2} 
          trend="+5%" 
          trendLabel="peningkatan"
          color="green" 
        />
        <Widget 
          variants={item}
          title="Peringatan Berat" 
          value={weightAlerts.toString()} 
          icon={AlertTriangle} 
          trend="Kritis" 
          trendLabel="perlu tinjauan"
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Alerts - Bento Style */}
        <motion.div 
          variants={item}
          className="lg:col-span-1 bg-white rounded-[2rem] p-8 border border-slate-200 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-32 h-32 text-yellow-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pastel-orange flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                Peringatan Prioritas
              </h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Umpan Langsung</span>
            </div>

            <div className="space-y-3">
              {athletes.filter(a => a.hydrationLevel < 90).map(athlete => (
                <div key={`hyd-${athlete.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-red/30 hover:shadow-lg hover:shadow-brand-red/5 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pastel-red flex items-center justify-center text-brand-red group-hover/item:scale-110 transition-transform shadow-sm">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{athlete.name}</div>
                      <div className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Hidrasi Rendah: {athlete.hydrationLevel}%</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-900 transition-colors" />
                </div>
              ))}
              {athletes.filter(a => Math.abs(a.weight - a.targetWeight) > 1.5).map(athlete => (
                <div key={`wt-${athlete.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pastel-orange flex items-center justify-center text-yellow-600 group-hover/item:scale-110 transition-transform shadow-sm">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{athlete.name}</div>
                      <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Deviasi Berat: {Math.abs(athlete.weight - athlete.targetWeight).toFixed(1)}kg</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-900 transition-colors" />
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setIsAlertsModalOpen(true)}
              className="w-full mt-6 py-3.5 rounded-xl bg-slate-900 hover:bg-brand-red text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10 hover:shadow-brand-red/20"
            >
              Lihat Semua Peringatan Sistem
            </button>
          </div>
        </motion.div>

        {/* Analytics Summary - Bento Style */}
        <motion.div 
          variants={item}
          className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              Tren Performa
            </h2>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button className="px-5 py-2 rounded-lg bg-white shadow-sm text-[10px] font-black text-slate-900 uppercase tracking-widest">Mingguan</button>
              <button className="px-5 py-2 rounded-lg text-[10px] font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Bulanan</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-72 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 group/chart relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-100/30 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity duration-700"></div>
              <BarChart3 className="w-12 h-12 mb-4 opacity-20 group-hover/chart:scale-110 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Analitik Kepatuhan Aktif</span>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-500/20 transition-colors">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Performa Terbaik</div>
                <div className="text-base font-black text-slate-900">Jonatan Christie</div>
                <div className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-[10px] font-black text-green-700 mt-2 uppercase tracking-widest">Kepatuhan 98%</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-red/20 transition-colors">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Perlu Perhatian</div>
                <div className="text-base font-black text-slate-900">Alwi Farhan</div>
                <div className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-[10px] font-black text-red-700 mt-2 uppercase tracking-widest">Kepatuhan 78%</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg shadow-slate-900/10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kesehatan Sistem</div>
                <div className="text-sm font-black text-white">Semua Sistem Normal</div>
                <div className="text-[10px] font-bold text-brand-red mt-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse"></span>
                  Sinkronisasi Terakhir: 2m lalu
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alerts Modal */}
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Semua Peringatan Sistem</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar lengkap anomali data atlet</p>
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
                      Perlu Tinjauan
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
// Already imported at top

