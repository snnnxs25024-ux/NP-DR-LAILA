import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Printer, Download, Search, CheckSquare, Square, Filter } from 'lucide-react';
import { Athlete } from '../types';
import { calculateAssessmentMetrics } from './Assessments';
import { generateBulkAssessmentPDF } from '../lib/reportUtils';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';

export default function BulkExport() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [reportRange, setReportRange] = useState<string>('Bulan Ini');
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { categories, isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('athletes')
        .select(`
          *,
          categories(name),
          assessment_history:assessments(*)
        `)
        .order('name');
        
      if (error) throw error;
      
      const formattedData = (data as any[]).map(a => {
        const sortedHistory = (a.assessment_history || []).sort((x: any, y: any) => {
          return new Date(y.date).getTime() - new Date(x.date).getTime();
        });
        return {
          ...a,
          category_name: a.categories?.name,
          assessment_history: sortedHistory
        };
      });

      setAthletes(formattedData);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAthletes = useMemo(() => {
    return athletes.filter(athlete => {
      const matchSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || athlete.category_id === parseInt(selectedCategory);
      return matchSearch && matchCategory;
    });
  }, [athletes, searchQuery, selectedCategory]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAthletes.length && filteredAthletes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAthletes.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const prepareBulkData = () => {
    const selectedAthletes = athletes.filter(a => selectedIds.has(a.id));
    
    // Sort selected athletes by division, then name
    selectedAthletes.sort((a, b) => {
      const catA = a.category_name || '';
      const catB = b.category_name || '';
      if (catA < catB) return -1;
      if (catA > catB) return 1;
      return a.name.localeCompare(b.name);
    });

    const reportsData = selectedAthletes.map(athlete => {
      const historyInRange = (athlete.assessment_history || []).filter((h: any) => h.date >= startDate && h.date <= endDate);
      
      // We process diffs ONLY if there are at least 2 entries in total (metrics calculation needs it)
      // but we display historyInRange.
      
      let title = `Periode Asesmen Laporan`;
      if (reportRange === 'Bulan Ini') {
        title = `Laporan Periode Bulan ${format(new Date(), 'MMMM yyyy', { locale: id })}`;
      } else if (reportRange === '3 Bulan Terakhir') {
        title = `Laporan 3 Bulan Terakhir (${format(new Date(startDate), 'MMM', { locale: id })} - ${format(new Date(endDate), 'MMM yyyy', { locale: id })})`;
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        title = `Laporan Periode ${format(start, 'dd MMM yyyy', { locale: id })} - ${format(end, 'dd MMM yyyy', { locale: id })}`;
      }

      // Calculate diffs using the component's existing logic
      const historyAscending = [...(athlete.assessment_history || [])].reverse(); 
      // Reverse because we sorted it DESC when fetching, and calculateAssessmentMetrics might expect chronological or we can just pass the raw descending and it might work?
      // Wait, calculateAssessmentMetrics takes the original assessments array. The Assessments.tsx fetches DESC. 
      const metrics = calculateAssessmentMetrics(historyInRange.length > 0 ? historyInRange[0] || {} : {}, athlete.gender as string) as any;

      return {
        athlete,
        assessments: historyInRange,
        title,
        diffUpdate: metrics.diffUpdate || null,
        diffGlobal: metrics.diffGlobal || null
      };
    });

    return reportsData.filter(rd => rd.assessments.length > 0);
  };

  const handleBulkPrint = () => {
    if (selectedIds.size === 0) {
      alert('Pilih minimal satu atlet.');
      return;
    }
    
    const data = prepareBulkData();
    if (data.length === 0) {
      alert('Tidak ada data asesmen pada rentang tanggal tersebut untuk atlet yang dipilih.');
      return;
    }

    try {
      const doc = generateBulkAssessmentPDF(data);
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Print error:', error);
      alert('Gagal memproses cetak kolektif.');
    }
  };

  const handleBulkPDF = () => {
    if (selectedIds.size === 0) {
      alert('Pilih minimal satu atlet.');
      return;
    }

    const data = prepareBulkData();
    if (data.length === 0) {
      alert('Tidak ada data asesmen pada rentang tanggal tersebut untuk atlet yang dipilih.');
      return;
    }

    try {
      const doc = generateBulkAssessmentPDF(data);
      doc.save(`Rekapitulasi_Asesmen_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Gagal memproses PDF kolektif.');
    }
  };

  const handleBulkExcel = () => {
    if (selectedIds.size === 0) {
      alert('Pilih minimal satu atlet.');
      return;
    }

    const data = prepareBulkData();
    if (data.length === 0) {
      alert('Tidak ada data asesmen pada rentang tanggal tersebut untuk atlet yang dipilih.');
      return;
    }

    const wb = XLSX.utils.book_new();
    const allDataRows: any[] = [];

    data.forEach(rd => {
      rd.assessments.forEach((entry: any) => {
        allDataRows.push({
          'DIVISI': rd.athlete.category_name,
          'NAMA ATLET': rd.athlete.name,
          'TANGGAL': entry.date.split('-').reverse().join('-'),
          'BF% INB': entry.bf_in_body || 0,
          'B': entry.bicep || 0,
          'T': entry.tricep || 0,
          'SC': entry.subscapula || 0,
          'A': entry.abdominal || 0,
          'TOT': entry.total || 0,
          'BF% CAL': entry.bf_caliper || 0,
          'BB (KG)': entry.weight || 0,
          'LBM': entry.lbm || 0,
          'FM': entry.fm || 0
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(allDataRows);
    
    // widths
    const wscols = [
      {wch: 15}, // Divisi
      {wch: 25}, // Nama
      {wch: 12}, // Tanggal
      {wch: 10}, {wch: 5}, {wch: 5}, {wch: 5}, {wch: 5}, {wch: 8}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 10}
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Rekapitulasi Asesmen");
    XLSX.writeFile(wb, `Rekapitulasi_Asesmen_${format(new Date(), 'dd_MM_yyyy')}.xlsx`);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 overflow-hidden space-y-6 custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Ekspor Kolektif</h1>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Cetak laporan spesifik untuk multi-atlet sekaligus</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-end bg-slate-50/50">
          <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
            <div className="md:w-64">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Cari Atlet</label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Divisi Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="all">Semua Kategori</option>
                {!categoriesLoading && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Rentang Laporan</label>
              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="relative flex-1 border-r border-slate-200">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Mulai Tanggal"
                    className="w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none transition-all text-slate-700"
                  />
                </div>
                <div className="relative flex-1">
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="Sampai Tanggal"
                    className="w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              {selectedIds.size === filteredAthletes.length && filteredAthletes.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedIds.size === filteredAthletes.length && filteredAthletes.length > 0 ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
            <span className="text-sm font-medium text-slate-500 flex items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <span className="text-blue-600 font-bold mr-1">{selectedIds.size}</span> atlet terpilih
            </span>
            
            <div className="flex-1"></div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handleBulkPrint}
                disabled={selectedIds.size === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak </span>
              </button>
              <button
                onClick={handleBulkPDF}
                disabled={selectedIds.size === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-red text-white hover:bg-brand-red-hover rounded-xl text-sm font-bold shadow-lg shadow-brand-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>PDF Kolektif</span>
              </button>
              <button
                onClick={handleBulkExcel}
                disabled={selectedIds.size === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#21A366] text-white hover:bg-[#1e8f59] rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Excel Kolektif</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 p-1">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">Memuat data atlet...</div>
            ) : filteredAthletes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Tidak ada atlet yang ditemukan
              </div>
            ) : (
              filteredAthletes.map(athlete => {
                const isSelected = selectedIds.has(athlete.id);
                const assessmentCount = (athlete.assessment_history || []).length;
                
                return (
                  <motion.div
                    key={athlete.id}
                    layoutId={`bulk-card-${athlete.id}`}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-brand-red bg-red-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                    onClick={() => toggleSelect(athlete.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-brand-red border-brand-red' : 'bg-white border-slate-300'
                      }`}>
                        {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {athlete.image_url ? (
                          <img src={athlete.image_url} alt={athlete.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-400">{athlete.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 truncate max-w-[120px]">{athlete.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{athlete.category_name}</div>
                        </div>
                      </div>
                    </div>
                    {assessmentCount === 0 && (
                      <div className="absolute top-3 right-3 flex items-center z-10 w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Belum pernah asesmen"></div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
