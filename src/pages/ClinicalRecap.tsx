import { useState } from 'react';
import { athletes, Sector } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Download, Printer, Search, Filter, ArrowDown, ArrowUp, Minus } from 'lucide-react';

export function ClinicalRecap() {
  const [selectedSector, setSelectedSector] = useState<Sector | 'All'>('Ganda Putri');
  const [searchTerm, setSearchTerm] = useState('');

  const sectors: (Sector | 'All')[] = ['All', "Tunggal Putra", "Tunggal Putri", "Ganda Putra", "Ganda Putri", "Ganda Campuran"];

  const filteredAthletes = athletes.filter(a => {
    const matchSector = selectedSector === 'All' || a.sector === selectedSector;
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSector && matchSearch;
  });

  const calculateIdealWeight = (height: number) => {
    return (height - 100) * 0.95;
  };

  const getTargetIndicator = (current: number, target: number) => {
    if (current > target) return <ArrowDown className="w-3 h-3 text-brand-red inline" />;
    if (current < target) return <ArrowUp className="w-3 h-3 text-emerald-500 inline" />;
    return <Minus className="w-3 h-3 text-slate-300 inline" />;
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
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Laporan Kolektif Komposisi Tubuh & Nutrisi</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-red-hover transition-all shadow-lg shadow-brand-red/20">
            <Download className="w-4 h-4" />
            Ekspor Excel
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

      {/* Clinical Table */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-center">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-[0.3em]">{selectedSector === 'All' ? 'SEMUA KATEGORI' : selectedSector.toUpperCase()}</h2>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-[10px] border-collapse clinical-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 border border-slate-200 text-center font-black uppercase sticky left-0 bg-slate-50 z-20">NO</th>
                <th className="p-4 border border-slate-200 text-left font-black uppercase sticky left-[41px] bg-slate-50 z-20 min-w-[200px]">NAMA</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-100/50">TB (cm)</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-slate-100/50">BB (kg)</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-blue-50">TARGET BB (kg)</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-rose-50">BF KALIPER (%)</th>
                <th className="p-4 border border-slate-200 text-center font-black uppercase bg-rose-50/30">TARGET BF (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAthletes.map((athlete, index) => {
                const latestAssessment = athlete.assessmentHistory[0];
                const currentWeight = latestAssessment?.weight || athlete.weight;
                const currentBF = latestAssessment?.bfCaliper || athlete.bodyFatCaliper;
                
                return (
                  <tr key={athlete.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10">{index + 1}</td>
                    <td className="p-4 border border-slate-100 text-left font-black text-slate-900 sticky left-[41px] bg-white group-hover:bg-slate-50/50 z-10">{athlete.name}</td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-900">{athlete.height}</td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-900">{currentWeight}</td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-blue-600 bg-blue-50/10">
                      {getTargetIndicator(currentWeight, athlete.targetWeight)} {athlete.targetWeight}
                    </td>
                    <td className="p-4 border border-slate-100 text-center font-black text-brand-red bg-rose-50/10">{currentBF}%</td>
                    <td className="p-4 border border-slate-100 text-center font-bold text-slate-900 bg-rose-50/10">
                      {getTargetIndicator(currentBF, athlete.targetBodyFat)} {athlete.targetBodyFat}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; background: white; }
          .clinical-table { font-size: 8px; }
          .clinical-table th, .clinical-table td { padding: 4px; border: 1px solid #e2e8f0 !important; }
          .sticky { position: static !important; }
        }
        .clinical-table th { white-space: nowrap; }
      `}} />
    </div>
  );
}
