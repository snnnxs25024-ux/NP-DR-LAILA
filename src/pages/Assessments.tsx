import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Save, Trash2, Plus, FileSpreadsheet, CheckCircle2, AlertCircle, Search, Filter, ArrowRight, Calendar, Table as TableIcon, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Athlete, AssessmentEntry } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

const bodyFatChartMen: Record<number, number> = {
  15: 4.8, 16: 5.44, 17: 6.08, 18: 6.72, 19: 7.36, 20: 8, 21: 8.5, 22: 9, 23: 9.5, 24: 10,
  25: 10.5, 26: 11, 27: 11.5, 28: 12, 29: 12.5, 30: 13, 31: 13.34, 32: 13.68, 33: 14.02, 34: 14.36,
  35: 14.7, 36: 15.06, 37: 15.42, 38: 15.78, 39: 16.14, 40: 16.5, 41: 16.74, 42: 16.98, 43: 17.22, 44: 17.46,
  45: 17.7, 46: 17.96, 47: 18.22, 48: 18.48, 49: 18.74, 50: 19, 51: 19.2, 52: 19.4, 53: 19.6, 54: 19.8,
  55: 20, 56: 20.24, 57: 20.48, 58: 20.72, 59: 20.96, 60: 21.2, 61: 21.4, 62: 21.6, 63: 21.8, 64: 22,
  65: 22.2, 66: 22.36, 67: 22.52, 68: 22.68, 69: 22.84, 70: 23, 75: 24, 80: 24.8, 85: 25.5, 90: 26.3,
  95: 27, 100: 27.5, 105: 28.2, 110: 28.8, 115: 29.5, 120: 30, 125: 30.5, 130: 31, 135: 31.5, 140: 32,
  150: 33, 160: 33.5, 170: 34.5, 180: 35.2, 190: 36, 200: 36.5
};

const bodyFatChartWomen: Record<number, number> = {
  15: 10.5, 16: 11.2, 17: 11.9, 18: 12.6, 19: 13.3, 20: 14, 21: 14.56, 22: 15.12, 23: 15.68, 24: 16.24,
  25: 16.8, 26: 17.5, 27: 18, 28: 18.5, 29: 19, 30: 19.5, 31: 19.9, 32: 20.3, 33: 20.7, 34: 21.1,
  35: 21.5, 36: 21.9, 37: 22.3, 38: 22.7, 39: 23.1, 40: 23.5, 41: 23.8, 42: 24.1, 43: 24.4, 44: 24.7,
  45: 25, 46: 25.3, 47: 25.6, 48: 25.9, 49: 26.2, 50: 26.5, 51: 26.76, 52: 27.02, 53: 27.28, 54: 27.54,
  55: 27.8, 56: 28.04, 57: 28.3, 58: 28.56, 59: 28.82, 60: 29, 61: 29.24, 62: 29.48, 63: 29.72, 64: 29.96,
  65: 30.2, 66: 30.4, 67: 30.6, 68: 30.8, 69: 31, 70: 31.2, 75: 32.2, 80: 33, 85: 34, 90: 34.8,
  95: 35.5, 100: 36.5, 105: 37, 110: 37.7, 115: 38.5, 120: 39, 125: 39.5, 130: 40.2, 135: 40.8, 140: 41.3,
  150: 42.3, 160: 43.2, 170: 44, 180: 45, 190: 45.8, 200: 46.5
};

function getBFFromTable(sum: number, gender: 'Laki-laki' | 'Perempuan'): number | null {
  if (sum < 15) return null;
  const chart = gender === 'Laki-laki' ? bodyFatChartMen : bodyFatChartWomen;
  if (chart[sum] !== undefined) return chart[sum];
  
  // Find closest lower bound
  const keys = Object.keys(chart).map(Number).sort((a, b) => a - b);
  let lowerBound = keys[0];
  for (const key of keys) {
    if (key <= sum) {
      lowerBound = key;
    } else {
      break;
    }
  }
  return chart[lowerBound];
}

export function Assessments() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    const fetchAthletes = async () => {
      const { data, error } = await supabase
        .from('athletes')
        .select(`
          *,
          categories:category_id (name),
          assessment_history:assessments (
            id,
            date,
            weight,
            bf_in_body,
            bicep,
            tricep,
            subscapula,
            abdominal,
            total,
            bf_caliper,
            lbm,
            fm,
            notes
          )
        `);
      if (error) {
        console.error('Error fetching athletes:', error);
      } else {
        const mappedData = data.map((a: any) => {
          // Sort assessment history descending by date
          const sortedHistory = (a.assessment_history || []).sort((a: any, b: any) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          return {
            ...a,
            category_name: a.categories?.name || 'Unknown',
            assessment_history: sortedHistory
          };
        });
        setAthletes(mappedData as Athlete[]);
      }
    };
    fetchAthletes();
  }, []);
  
  // Local state for batch input
  const [batchData, setBatchData] = useState<Record<string, Partial<AssessmentEntry>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedAthleteId, setFocusedAthleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'reference'>('input');
  
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
    const matchesDivision = selectedDivision === 'All' || a.category_name === selectedDivision;
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
        
        // Use the Body Fat Chart logic based on gender
        const athlete = athletes.find(a => a.id === athleteId);
        if (athlete && updated.total >= 15) {
          const bf = getBFFromTable(updated.total, athlete.gender as any);
          if (bf !== null) {
            updated.bf_caliper = bf;
          }
        } else {
          // Fallback if total < 15 or athlete not found
          updated.bf_caliper = Number(((updated.total * 0.25) + 2).toFixed(1));
        }
      }

      if (field === 'weight' || field === 'bf_caliper') {
        const weight = Number(updated.weight || 0);
        const bf = Number(updated.bf_caliper || 0);
        if (weight > 0) {
          updated.fm = Number((weight * (bf / 100)).toFixed(2));
          updated.lbm = Number((weight - updated.fm).toFixed(2));
        }
      }

      return { ...prev, [athleteId]: updated };
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const entries = Object.entries(batchData).filter(([_, data]) => (data as any).weight);
      
      for (const [athleteId, data] of entries) {
        const newData = data as any;
        const assessment = {
          athlete_id: athleteId,
          date: assessmentDate,
          bf_in_body: Number(newData.bf_in_body || 0),
          bicep: Number(newData.bicep || 0),
          tricep: Number(newData.tricep || 0),
          subscapula: Number(newData.subscapula || 0),
          abdominal: Number(newData.abdominal || 0),
          total: Number(newData.total || 0),
          bf_caliper: Number(newData.bf_caliper || 0),
          weight: Number(newData.weight || 0),
          lbm: Number(newData.lbm || 0),
          fm: Number(newData.fm || 0),
          notes: newData.notes || '',
        };

        // 1. Insert assessment
        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert([assessment]);
        if (assessmentError) throw assessmentError;

        // 2. Update athlete snapshot
        const { error: athleteError } = await supabase
          .from('athletes')
          .update({
            weight: assessment.weight,
            bf_in_body: assessment.bf_in_body
          })
          .eq('id', athleteId);
        if (athleteError) throw athleteError;
      }

      setBatchData({});
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error saving assessments:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadTemplate = () => {
    const header = [
      'ID', 'Nama', 'Divisi', 'Sektor', 'Tanggal (YYYY-MM-DD)', 
      'BF% InBody', 'Bicep (mm)', 'Tricep (mm)', 'Subscapula (mm)', 'Abdominal (mm)', 
      'TOT (mm)', 'BF% Caliper (%)', 'BB (kg)', 'FM (kg)', 'LBM (kg)', 'Catatan'
    ];

    const data = athletes.map((a, index) => {
      const rowNum = index + 2; // Excel rows are 1-indexed, header is row 1
      return [
        a.id, 
        a.name, 
        a.division, 
        a.sector, 
        assessmentDate,
        '', // BF% InBody
        '', // Bicep
        '', // Tricep
        '', // Subscapula
        '', // Abdominal
        { f: `SUM(G${rowNum}:J${rowNum})` }, // TOT
        { f: `(K${rowNum}*0.25)+2` }, // BF% Caliper
        '', // BB (kg)
        { f: `M${rowNum}*(L${rowNum}/100)` }, // FM
        { f: `M${rowNum}-N${rowNum}` }, // LBM
        '' // Catatan
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Asesmen");
    
    // Set column widths
    const wscols = [
      {wch: 5}, {wch: 25}, {wch: 10}, {wch: 15}, {wch: 20}, 
      {wch: 12}, {wch: 10}, {wch: 10}, {wch: 15}, {wch: 15}, 
      {wch: 10}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 25}
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
          const notes = row['Catatan'] || '';

          newBatchData[athleteId] = {
            bf_in_body: bfInBody,
            bicep: b,
            tricep: t,
            subscapula: sc,
            abdominal: a,
            total,
            bf_caliper: bfCaliper,
            weight,
            fm,
            lbm,
            notes
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

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('input')}
          className={cn(
            "pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative",
            activeTab === 'input' ? "border-brand-red text-brand-red" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Input Data
        </button>
        <button
          onClick={() => setActiveTab('reference')}
          className={cn(
            "pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative",
            activeTab === 'reference' ? "border-brand-red text-brand-red" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Referensi Body Fat
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'input' ? (
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
          {/* Main Table */}
          <div className="flex-1 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col rounded-3xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest sticky left-0 bg-blue-50 z-10">Atlet</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BF% InBody</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Bicep</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Tricep</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Subscap</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Abdom</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">TOT</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BF% Cal</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BB (kg)</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">LBM</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">FM</th>
                  <th className="px-2 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAthletes.map((athlete) => {
                  const data = batchData[athlete.id] || {};
                  const lastAssessment = (athlete.assessment_history || [])[0];
                  const isFocused = focusedAthleteId === athlete.id;

                  return (
                    <React.Fragment key={athlete.id}>
                      {isFocused && lastAssessment && (
                        <tr className="bg-blue-50/50 border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td className="px-6 py-2 sticky left-0 bg-blue-50/95 z-10">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Data Terakhir</span>
                              <span className="text-[9px] font-bold text-blue-500">{lastAssessment.date}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.bf_in_body}%</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.bicep}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.tricep}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.subscapula}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.abdominal}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400 bg-blue-100/30">{lastAssessment.total}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400 bg-blue-100/30">{lastAssessment.bf_caliper}%</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.weight}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400 bg-blue-100/30">{lastAssessment.lbm}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400 bg-blue-100/30">{lastAssessment.fm}</td>
                          <td className="px-2 py-2 text-center text-[10px] font-black text-blue-400">{lastAssessment.notes || '-'}</td>
                        </tr>
                      )}
                      <tr 
                        className={cn(
                          "hover:bg-blue-50/30 transition-colors group even:bg-slate-50/50",
                          isFocused && "bg-blue-50/20"
                        )}
                        onClick={() => setFocusedAthleteId(athlete.id)}
                      >
                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10">
                          <div className="flex items-center gap-3">
                            <img src={athlete.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="text-sm font-black text-slate-900">{athlete.name}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">{athlete.category_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
                            value={data.bf_in_body || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'bf_in_body', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            placeholder="0.0"
                            className="w-16 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
                            value={data.bicep || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'bicep', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
                            value={data.tricep || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'tricep', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
                            value={data.subscapula || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'subscapula', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            className="w-12 mx-auto bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-slate-900 outline-none transition-all"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
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
                          <div className="text-xs font-black text-brand-red text-center">{data.bf_caliper ? `${data.bf_caliper}%` : '-'}</div>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            step="any"
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
                        <td className="px-2 py-4">
                          <input 
                            type="text" 
                            value={data.notes || ''} 
                            onChange={(e) => handleInputChange(athlete.id, 'notes', e.target.value)}
                            onFocus={() => setFocusedAthleteId(athlete.id)}
                            placeholder="..."
                            className="w-24 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-1 text-xs font-bold focus:border-slate-900 outline-none transition-all"
                          />
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
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.category_name}</div>
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
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.place_of_birth}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Lahir</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.date_of_birth}</div>
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
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.blood_type}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tangan</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.dominant_hand}</div>
                        </div>
                      </div>
                    </div>

                    {/* Antropometri */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Antropometri</h3>
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Lingkar Lengan</div>
                            <div className="text-sm font-black text-slate-900">{(focusedAthlete.arm_circumference || 0).toFixed(1)} cm</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Kategori Lengan</div>
                            <div className="text-sm font-black text-slate-900 uppercase">{focusedAthlete.arm_circumference_category}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Range BB</div>
                          <div className="text-sm font-black text-slate-900">{focusedAthlete.arm_circumference_range_bb}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Body Fat (Kaliper)</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.bf_caliper} %</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Body Fat (InBody)</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.bf_in_body} %</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Target Berat Badan</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.target_weight} kg</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">Target Body Fat</div>
                            <div className="text-sm font-black text-slate-900">{focusedAthlete.target_body_fat} %</div>
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
      ) : (
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Body Fat Chart Reference</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tabel konversi Skinfold SUM ke BF%</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Men Chart */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl text-center">Body Fat Chart - Man</h3>
              <div className="grid grid-cols-2 gap-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">SUM</th>
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">BF %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bodyFatChartMen).slice(0, 38).map(([sum, bf]) => (
                      <tr key={sum} className="even:bg-slate-50">
                        <td className="px-3 py-1.5 font-bold text-slate-700 border border-slate-200 text-center">{sum}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-600 border border-slate-200 text-center">{bf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">SUM</th>
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">BF %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bodyFatChartMen).slice(38).map(([sum, bf]) => (
                      <tr key={sum} className="even:bg-slate-50">
                        <td className="px-3 py-1.5 font-bold text-slate-700 border border-slate-200 text-center">{sum}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-600 border border-slate-200 text-center">{bf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Women Chart */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl text-center">Body Fat Chart - Women</h3>
              <div className="grid grid-cols-2 gap-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">SUM</th>
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">BF %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bodyFatChartWomen).slice(0, 38).map(([sum, bf]) => (
                      <tr key={sum} className="even:bg-slate-50">
                        <td className="px-3 py-1.5 font-bold text-slate-700 border border-slate-200 text-center">{sum}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-600 border border-slate-200 text-center">{bf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">SUM</th>
                      <th className="px-3 py-2 font-black text-slate-900 border border-slate-200">BF %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bodyFatChartWomen).slice(38).map(([sum, bf]) => (
                      <tr key={sum} className="even:bg-slate-50">
                        <td className="px-3 py-1.5 font-bold text-slate-700 border border-slate-200 text-center">{sum}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-600 border border-slate-200 text-center">{bf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
