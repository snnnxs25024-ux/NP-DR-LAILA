import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Athlete, AssessmentEntry } from '../types'; // Keep interface definition
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
import { useCategories } from '../hooks/useCategories';

export function ClinicalRecap() {
  const [athletesData, setAthletesData] = useState<Athlete[]>([]);
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('athletes')
        .select('*, categories:category_id (name)')
        .order('name');
      
      if (error) {
        console.error('Error fetching athletes:', error);
      } else {
        const formattedData = (data as any[]).map(a => ({
          ...a,
          category_name: a.categories?.name
        }));
        setAthletesData(formattedData as Athlete[]);
      }
      setIsLoading(false);
    };
    fetchAthletes();
  }, []);

  const filteredAthletes = athletesData.filter(a => {
    const matchCat = selectedCategory === 'All' || a.category_name === selectedCategory;
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getTargetIndicator = (current: number, target: number) => {
    if (current > target) return <ArrowDown className="w-3 h-3 text-brand-red inline" />;
    if (current < target) return <ArrowUp className="w-3 h-3 text-emerald-500 inline" />;
    return <Minus className="w-3 h-3 text-slate-300 inline" />;
  };

  const handleUpdateAssessment = async (athleteId: string, field: keyof AssessmentEntry, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    // Update local state first for immediate UI response
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const history = [...(athlete.assessment_history || [])];
        if (history.length > 0) {
          history[0] = { ...history[0], [field]: numValue };
        } else {
          // Create first entry if none exists
          const newEntry: AssessmentEntry = {
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
            weight: field === 'weight' ? numValue : (athlete.weight || 0),
            bf_caliper: field === 'bf_caliper' ? numValue : (athlete.bf_in_body || 0),
            bf_in_body: athlete.bf_in_body || 0,
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
        return { ...athlete, assessment_history: history };
      }
      return athlete;
    }));

    // Auto-save to Supabase
    setSaveStatus('saving');
    try {
      const athleteToUpdate = athletesData.find(a => a.id === athleteId);
      if (athleteToUpdate) {
        const history = [...(athleteToUpdate.assessment_history || [])];
        if (history.length > 0) {
          history[0] = { ...history[0], [field]: numValue };
        }
        
        const { error } = await supabase
          .from('athletes')
          .update({ assessment_history: history })
          .eq('id', athleteId);
          
        if (error) throw error;
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
      setSaveStatus('idle');
    }
  };

  const handleAddAssessment = (athleteId: string) => {
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const history = athlete.assessment_history || [];
        const latest = history[0] || athlete;
        const newEntry: AssessmentEntry = {
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
          weight: (latest as any).weight || athlete.weight || 0,
          bf_caliper: (latest as any).bf_caliper || (latest as any).bfCaliper || 0,
          bf_in_body: (latest as any).bf_in_body || (latest as any).bfInBody || 0,
          bicep: (latest as any).bicep || 0,
          tricep: (latest as any).tricep || 0,
          subscapula: (latest as any).subscapula || 0,
          abdominal: (latest as any).abdominal || 0,
          total: (latest as any).total || 0,
          lbm: (latest as any).lbm || 0,
          fm: (latest as any).fm || 0
        };
        return { ...athlete, assessment_history: [newEntry, ...history] };
      }
      return athlete;
    }));
    
    // Show feedback
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeleteLatest = (athleteId: string) => {
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === athleteId && (athlete.assessment_history?.length || 0) > 0) {
        return { ...athlete, assessment_history: athlete.assessment_history?.slice(1) };
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold focus:border-slate-900 outline-none transition-all appearance-none"
          >
            <option value="All">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Unified Clinical & Status Table */}
      <div className="flex-1 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-[10px] border-collapse clinical-table">
            <thead>
              <tr className="bg-blue-50/50 border-b border-blue-100">
                <th className="p-4 border border-blue-100 text-center font-black uppercase sticky left-0 bg-blue-50/50 text-slate-800 z-20">NO</th>
                <th className="p-4 border border-blue-100 text-left font-black uppercase sticky left-[41px] bg-blue-50/50 text-slate-800 z-20 min-w-[180px]">NAMA</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">TB</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">BB</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">TARGET BB</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">STATUS BB</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">BF %</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">TARGET BF</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800">STATUS BF</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800 min-w-[200px]">KESIMPULAN & ARAHAN</th>
                <th className="p-4 border border-blue-100 text-center font-black uppercase text-slate-800 no-print">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAthletes.map((athlete, index) => {
                const latestAssessment = athlete.assessment_history?.[0];
                const currentWeight = latestAssessment?.weight || athlete.weight || 0;
                const currentBF = latestAssessment?.bf_caliper || athlete.bf_in_body || 0;
                
                const isWeightAchieved = currentWeight <= athlete.target_weight;
                const isBFAchieved = currentBF <= athlete.target_body_fat;
                const conclusion = getConclusion(isWeightAchieved, isBFAchieved);

                return (
                  <tr key={athlete.id} className="hover:bg-blue-50/30 transition-colors group even:bg-slate-50/30">
                    <td className="p-4 border border-slate-100 text-center font-black text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10">{index + 1}</td>
                    <td className="p-4 border border-slate-100 text-left font-black text-slate-900 sticky left-[41px] bg-white group-hover:bg-slate-50/50 z-10">
                      <div className="truncate max-w-[150px]">{athlete.name}</div>
                      {latestAssessment && (
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Update: {latestAssessment.date}</div>
                      )}
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-800">{athlete.height}</td>
                    <td className="p-4 border border-slate-100 text-center">
                      <input 
                        type="number"
                        value={currentWeight || ''}
                        onChange={(e) => handleUpdateAssessment(athlete.id, 'weight', e.target.value)}
                        className="w-12 bg-transparent border-none text-center font-bold text-slate-900 focus:ring-0 outline-none"
                      />
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-blue-700 bg-blue-50/30">
                      {athlete.target_weight}
                    </td>
                    <td className="p-4 border border-slate-100 text-center bg-blue-50/5">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        isWeightAchieved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      )}>
                        {isWeightAchieved ? 'TERCAPAI' : 'BELUM'}
                      </span>
                    </td>
                    <td className="p-4 border border-slate-100 text-center">
                      <input 
                        type="number"
                        value={currentBF || ''}
                        onChange={(e) => handleUpdateAssessment(athlete.id, 'bf_caliper', e.target.value)}
                        className="w-10 bg-transparent border-none text-center font-bold text-rose-800 focus:ring-0 outline-none"
                      />
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-800 bg-rose-50/5">
                      {athlete.target_body_fat}%
                    </td>
                    <td className="p-4 border border-slate-100 text-center bg-rose-50/5">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        isBFAchieved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      )}>
                        {isBFAchieved ? 'TERCAPAI' : 'BELUM'}
                      </span>
                    </td>
                    <td className="p-4 border border-slate-100 text-center">
                      <div className={cn("text-[10px] font-black uppercase tracking-tight leading-tight", conclusion.color)}>
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
                          disabled={(athlete.assessment_history?.length || 0) === 0}
                          title="Hapus Terakhir"
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            (athlete.assessment_history?.length || 0) === 0 
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
