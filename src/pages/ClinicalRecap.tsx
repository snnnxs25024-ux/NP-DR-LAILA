import { useState } from 'react';
import { athletes as initialAthletes, Sector, AssessmentEntry } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Printer, 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Minus, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function ClinicalRecap() {
  const [athletesData, setAthletesData] = useState(initialAthletes);
  const [selectedSector, setSelectedSector] = useState<Sector | 'All'>('Ganda Putri');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const sectors: (Sector | 'All')[] = ['All', "Tunggal Putra", "Tunggal Putri", "Ganda Putra", "Ganda Putri", "Ganda Campuran"];

  const filteredAthletes = athletesData.filter(a => {
    const matchSector = selectedSector === 'All' || a.sector === selectedSector;
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSector && matchSearch;
  });

  const getTargetIndicator = (current: number, target: number) => {
    if (current > target) return <ArrowDown className="w-3 h-3 text-brand-red inline" />;
    if (current < target) return <ArrowUp className="w-3 h-3 text-emerald-500 inline" />;
    return <Minus className="w-3 h-3 text-slate-300 inline" />;
  };

  const handleUpdateAssessment = (athleteId: string, field: keyof AssessmentEntry, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const history = [...athlete.assessmentHistory];
        if (history.length > 0) {
          history[0] = { ...history[0], [field]: numValue };
        } else {
          // Create first entry if none exists
          const newEntry: AssessmentEntry = {
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
            weight: field === 'weight' ? numValue : athlete.weight,
            bfCaliper: field === 'bfCaliper' ? numValue : athlete.bodyFatCaliper,
            bfInBody: athlete.bodyFatInBody,
            bicep: 0,
            tricep: 0,
            subscapula: 0,
            abdominal: 0,
            total: 0,
            lbm: 0,
            fm: 0
          };
          history.push(newEntry);
        }
        return { ...athlete, assessmentHistory: history };
      }
      return athlete;
    }));
  };

  const handleAddAssessment = (athleteId: string) => {
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const latest = athlete.assessmentHistory[0] || athlete;
        const newEntry: AssessmentEntry = {
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
          weight: (latest as any).weight || athlete.weight,
          bfCaliper: (latest as any).bfCaliper || athlete.bodyFatCaliper,
          bfInBody: (latest as any).bfInBody || athlete.bodyFatInBody,
          bicep: (latest as any).bicep || 0,
          tricep: (latest as any).tricep || 0,
          subscapula: (latest as any).subscapula || 0,
          abdominal: (latest as any).abdominal || 0,
          total: (latest as any).total || 0,
          lbm: (latest as any).lbm || 0,
          fm: (latest as any).fm || 0
        };
        return { ...athlete, assessmentHistory: [newEntry, ...athlete.assessmentHistory] };
      }
      return athlete;
    }));
    
    // Show feedback
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeleteLatest = (athleteId: string) => {
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId && athlete.assessmentHistory.length > 0) {
        return { ...athlete, assessmentHistory: athlete.assessmentHistory.slice(1) };
      }
      return athlete;
    }));
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const getConclusion = (isWeightAchieved: boolean, isBFAchieved: boolean) => {
    if (isWeightAchieved && isBFAchieved) return { text: "TARGET TERCAPAI", color: "text-emerald-600" };
    if (!isWeightAchieved && !isBFAchieved) return { text: "PERLU PENURUNAN BB & BF", color: "text-brand-red" };
    if (!isWeightAchieved) return { text: "FOKUS PENURUNAN BERAT BADAN", color: "text-amber-600" };
    return { text: "FOKUS PENURUNAN BODY FAT", color: "text-rose-600" };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Rekapitulasi Klinis</h1>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manajemen Data & Analisis Pencapaian Target</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveAll}
            disabled={saveStatus === 'saving'}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg",
              saveStatus === 'saving' ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
            )}
          >
            {saveStatus === 'saving' ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari atlet..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold focus:border-slate-900 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold focus:border-slate-900 outline-none transition-all appearance-none"
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Unified Clinical & Status Table */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-[0.3em]">{selectedSector === 'All' ? 'REKAPITULASI KOLEKTIF' : selectedSector.toUpperCase()}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Analysis</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-[10px] border-collapse clinical-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 border border-slate-200 text-center font-black uppercase sticky left-0 bg-slate-50 z-20">NO</th>
                <th className="p-4 border border-slate-200 text-left font-black uppercase sticky left-[41px] bg-slate-50 z-20 min-w-[180px]">NAMA</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-100/30">TB</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-100/30">BB</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-blue-50/50">TARGET BB</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-blue-50">STATUS BB</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-rose-50/30">BF %</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-rose-50/50">TARGET BF</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-rose-50">STATUS BF</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-900 text-white min-w-[200px]">KESIMPULAN & ARAHAN</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-50 no-print">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAthletes.map((athlete, index) => {
                const latestAssessment = athlete.assessmentHistory[0];
                const currentWeight = latestAssessment?.weight || athlete.weight;
                const currentBF = latestAssessment?.bfCaliper || athlete.bodyFatCaliper;
                
                const isWeightAchieved = currentWeight <= athlete.targetWeight;
                const isBFAchieved = currentBF <= athlete.targetBodyFat;
                const conclusion = getConclusion(isWeightAchieved, isBFAchieved);

                return (
                  <tr key={athlete.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10">{index + 1}</td>
                    <td className="p-4 border border-slate-100 text-left font-black text-slate-900 sticky left-[41px] bg-white group-hover:bg-slate-50/50 z-10">
                      <div className="truncate max-w-[150px]">{athlete.name}</div>
                      {latestAssessment && (
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Update: {latestAssessment.date}</div>
                      )}
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-900">{athlete.height}</td>
                    <td className="p-4 border border-slate-100 text-center">
                      <input 
                        type="number"
                        value={currentWeight || ''}
                        onChange={(e) => handleUpdateAssessment(athlete.id, 'weight', e.target.value)}
                        className="w-12 bg-transparent border-none text-center font-black text-slate-900 focus:ring-0 outline-none"
                      />
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-blue-600 bg-blue-50/5">
                      {athlete.targetWeight}
                    </td>
                    <td className="p-4 border border-slate-100 text-center bg-blue-50/10">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter",
                        isWeightAchieved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-brand-red"
                      )}>
                        {isWeightAchieved ? 'TERCAPAI' : 'BELUM TERCAPAI'}
                      </span>
                    </td>
                    <td className="p-4 border border-slate-100 text-center">
                      <input 
                        type="number"
                        value={currentBF || ''}
                        onChange={(e) => handleUpdateAssessment(athlete.id, 'bfCaliper', e.target.value)}
                        className="w-10 bg-transparent border-none text-center font-black text-brand-red focus:ring-0 outline-none"
                      />
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-900 bg-rose-50/5">
                      {athlete.targetBodyFat}%
                    </td>
                    <td className="p-4 border border-slate-100 text-center bg-rose-50/10">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter",
                        isBFAchieved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-brand-red"
                      )}>
                        {isBFAchieved ? 'TERCAPAI' : 'BELUM TERCAPAI'}
                      </span>
                    </td>
                    <td className="p-4 border border-slate-100 text-center">
                      <div className={cn("text-[9px] font-black uppercase tracking-tight leading-tight", conclusion.color)}>
                        {conclusion.text}
                      </div>
                    </td>
                    <td className="p-4 border border-slate-100 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleAddAssessment(athlete.id)}
                          title="Tambah Asesmen"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLatest(athlete.id)}
                          disabled={athlete.assessmentHistory.length === 0}
                          title="Hapus Terakhir"
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            athlete.assessmentHistory.length === 0 
                              ? "bg-slate-50 text-slate-200 cursor-not-allowed" 
                              : "bg-rose-50 text-brand-red hover:bg-brand-red hover:text-white"
                          )}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {saveStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200]"
          >
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <div className="text-sm font-black uppercase tracking-tight">Berhasil Diperbarui</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Data klinis atlet telah disinkronkan</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; background: white; }
          .clinical-table { font-size: 8px; }
          .clinical-table th, .clinical-table td { padding: 4px; border: 1px solid #e2e8f0 !important; }
          .sticky { position: static !important; }
        }
        .clinical-table th { white-space: nowrap; }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}} />
    </div>
  );
}
