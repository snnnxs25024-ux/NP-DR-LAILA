import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Save, Trash2, Plus, FileSpreadsheet, CheckCircle2, AlertCircle, Search, Filter, ArrowRight, Calendar } from 'lucide-react';
import { athletes as initialAthletes, AssessmentEntry, Athlete } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

export function Assessments() {
  const [athletes, setAthletes] = useState<Athlete[]>(initialAthletes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Local state for batch input
  const [batchData, setBatchData] = useState<Record<string, Partial<AssessmentEntry>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedAthleteId, setFocusedAthleteId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // No modals here yet, but good for consistency
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const divisions = ['All', 'U-13', 'U-15', 'U-17', 'U-19', 'Senior'];

  const filteredAthletes = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === 'All' || a.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });

  const focusedAthlete = athletes.find(a => a.id === focusedAthleteId);

  const handleInputChange = (athleteId: string, field: keyof AssessmentEntry, value: string | number) => {
    setBatchData(prev => {
      const current = prev[athleteId] || {};
      const updated = { ...current, [field]: value };
      
      // Auto-calculate if possible
      if (['bicep', 'tricep', 'subscapula', 'abdominal'].includes(field as string)) {
        const b = Number(updated.bicep || 0);
        const t = Number(updated.tricep || 0);
        const sc = Number(updated.subscapula || 0);
        const a = Number(updated.abdominal || 0);
        updated.total = b + t + sc + a;
        
        // Simple BF% calculation (placeholder formula)
        // BF% = (Total * 0.25) + 2
        updated.bfCaliper = Number(((updated.total * 0.25) + 2).toFixed(1));
      }

      if (field === 'weight' || field === 'bfCaliper') {
        const weight = Number(updated.weight || 0);
        const bf = Number(updated.bfCaliper || 0);
        if (weight > 0) {
          updated.fm = Number((weight * (bf / 100)).toFixed(2));
          updated.lbm = Number((weight - updated.fm).toFixed(2));
        }
      }

      return { ...prev, [athleteId]: updated };
    });
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setSaveStatus('idle');

    // Simulate API call
    setTimeout(() => {
      const updatedAthletes = athletes.map(athlete => {
        const newData = batchData[athlete.id];
        if (newData && newData.weight) {
          const newEntry: AssessmentEntry = {
            date: new Date(assessmentDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
            bfInBody: Number(newData.bfInBody || 0),
            bicep: Number(newData.bicep || 0),
            tricep: Number(newData.tricep || 0),
            subscapula: Number(newData.subscapula || 0),
            abdominal: Number(newData.abdominal || 0),
            total: Number(newData.total || 0),
            bfCaliper: Number(newData.bfCaliper || 0),
            weight: Number(newData.weight || 0),
            lbm: Number(newData.lbm || 0),
            fm: Number(newData.fm || 0),
          };
          return {
            ...athlete,
            weight: newEntry.weight,
            bodyFatCaliper: newEntry.bfCaliper,
            bodyFatInBody: newEntry.bfInBody,
            assessmentHistory: [newEntry, ...athlete.assessmentHistory]
          };
        }
        return athlete;
      });

      setAthletes(updatedAthletes);
      
      // Mutate global mock data so it persists across views
      updatedAthletes.forEach(updated => {
        const idx = initialAthletes.findIndex(a => a.id === updated.id);
        if (idx !== -1) initialAthletes[idx] = updated;
      });

      setBatchData({});
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const downloadTemplate = () => {
    const data = athletes.map(a => ({
      'ID': a.id,
      'Nama': a.name,
      'Divisi': a.division,
      'Sektor': a.sector,
      'Tanggal (YYYY-MM-DD)': assessmentDate,
      'BF% InBody': '',
      'Bicep (mm)': '',
      'Tricep (mm)': '',
      'Subscapula (mm)': '',
      'Abdominal (mm)': '',
      'BB (kg)': '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Asesmen");
    
    // Set column widths
    const wscols = [
      {wch: 5}, {wch: 25}, {wch: 10}, {wch: 15}, {wch: 20}, {wch: 12}, {wch: 10}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 10}
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `Template_Asesmen_${assessmentDate}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newBatchData: Record<string, Partial<AssessmentEntry>> = {};
      
      data.forEach(row => {
        const athleteId = String(row['ID']);
        if (athleteId) {
          const b = Number(row['Bicep (mm)'] || 0);
          const t = Number(row['Tricep (mm)'] || 0);
          const sc = Number(row['Subscapula (mm)'] || 0);
          const a = Number(row['Abdominal (mm)'] || 0);
          const weight = Number(row['BB (kg)'] || 0);
          const bfInBody = Number(row['BF% InBody'] || 0);
          
          const total = b + t + sc + a;
          const bfCaliper = Number(((total * 0.25) + 2).toFixed(1));
          const fm = Number((weight * (bfCaliper / 100)).toFixed(2));
          const lbm = Number((weight - fm).toFixed(2));

          newBatchData[athleteId] = {
            bfInBody,
            bicep: b,
            tricep: t,
            subscapula: sc,
            abdominal: a,
            total,
            bfCaliper,
            weight,
            fm,
            lbm
          };
        }
      });

      setBatchData(prev => ({ ...prev, ...newBatchData }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Batch Assessment</h1>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Input data komposisi tubuh secara massal</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
          <div className="flex gap-2">
            <button 
              onClick={downloadTemplate}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> <span className="hidden md:inline">Download Template</span><span className="md:hidden">Template</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" /> <span className="hidden md:inline">Upload Excel (.xlsx)</span><span className="md:hidden">Upload</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={handleSaveAll}
            disabled={Object.keys(batchData).length === 0 || isSaving}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
              Object.keys(batchData).length === 0 || isSaving
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
            )}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Date */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama atlet..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm appearance-none"
          >
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            value={assessmentDate}
            onChange={(e) => setAssessmentDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Main Table */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50/50 z-10">Atlet</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">BF% InBody</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bicep</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tricep</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Subscap</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Abdom</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/80">TOT</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/80">BF% Cal</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">BB (kg)</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/80">LBM</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/80">FM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAthletes.map((athlete) => {
                  const data = batchData[athlete.id] || {};
                  const lastAssessment = athlete.assessmentHistory[0];
                  const isFocused = focusedAthleteId === athlete.id;

                  return (
                    <React.Fragment key={athlete.id}>
                      {isFocused && lastAssessment && (
                        <tr className="bg-slate-50/80 border-l-4 border-slate-900 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td className="px-6 py-2 sticky left-0 bg-slate-50/95 z-10">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Terakhir</span>
                              <span className="text-[9px] font-bold text-slate-500">{lastAssessment.date}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.bfInBody}%</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.bicep}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.tricep}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.subscapula}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.abdominal}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400 bg-slate-100/30">{lastAssessment.total}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400 bg-slate-100/30">{lastAssessment.bfCaliper}%</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400">{lastAssessment.weight}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400 bg-slate-100/30">{lastAssessment.lbm}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-slate-400 bg-slate-100/30">{lastAssessment.fm}</td>
                        </tr>
                      )}
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/30 transition-colors group",
                          isFocused && "bg-slate-50/50"
                        )}
                        onClick={() => setFocusedAthleteId(athlete.id)}
                      >
                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10">
                          <div className="flex items-center gap-3">
                            <img src={athlete.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="text-sm font-black text-slate-900">{athlete.name}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">{athlete.division} • {athlete.sector}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.bfInBody || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'bfInBody', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            placeholder="0.0"
                            className="w-16 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.bicep || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'bicep', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.tricep || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'tricep', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.subscapula || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'subscapula', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.abdominal || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'abdominal', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4 bg-slate-50/30">
                          <div className="text-xs font-black text-slate-900 text-center">{data.total || '-'}</div>
                        </td>
                        <td className="px-2 py-4 bg-slate-50/30">
                          <div className="text-xs font-black text-brand-red text-center">{data.bfCaliper ? `${data.bfCaliper}%` : '-'}</div>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            value={data.weight || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'weight', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            placeholder="0.0"
                            className="w-16 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4 bg-slate-50/30">
                          <div className="text-xs font-black text-emerald-600 text-center">{data.lbm ? `${data.lbm} kg` : '-'}</div>
                        </td>
                        <td className="px-2 py-4 bg-slate-50/30">
                          <div className="text-xs font-black text-orange-600 text-center">{data.fm ? `${data.fm} kg` : '-'}</div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAthletes.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tidak ada atlet ditemukan</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Coba sesuaikan pencarian atau filter divisi Anda</p>
            </div>
          )}
        </div>

        {/* Side Info Panel */}
        <AnimatePresence mode="wait">
          {focusedAthlete && (
            <motion.div
              key={focusedAthlete.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-[32rem] bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identitas & Fisik Atlet</h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Status Aktif</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                  {/* Left Column */}
                  <div className="space-y-10">
                    {/* Profil Dasar */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Profil Dasar</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</div>
                          <div className="text-sm font-black text-slate-900 leading-tight">{focusedAthlete.name}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.division}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor WhatsApp</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.whatsapp}</div>
                        </div>
                      </div>
                    </div>

                    {/* Kelahiran */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Kelahiran</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempat Lahir</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.placeOfBirth}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Lahir</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.dateOfBirth}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Umur</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.age} Tahun</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-10">
                    {/* Metrik Fisik */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Metrik Fisik</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tinggi</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.height} cm</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Berat</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.weight} kg</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gol. Darah</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.bloodType}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tangan</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.dominantHand}</div>
                        </div>
                      </div>
                    </div>

                    {/* Antropometri */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Antropometri</h3>
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Lingkar Lengan</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.armCircumference} cm</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Kategori Lengan</div>
                            <div className="text-sm font-black text-slate-900 uppercase">{focusedAthlete.armCircumferenceCategory}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Range BB</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.armCircumferenceRangeBB}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Body Fat (Kaliper)</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.bodyFatCaliper} %</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Body Fat (InBody)</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.bodyFatInBody} %</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Target Berat Badan</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.targetWeight} kg</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Target Body Fat</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.targetBodyFat} %</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Notification */}
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
              <div className="text-sm font-black uppercase tracking-tight">Berhasil Disimpan</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Data asesmen telah diperbarui untuk semua atlet</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
