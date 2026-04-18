import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Activity, Scale, ChevronRight, Share2, Download, Printer, ArrowUpRight, ArrowDownRight, X, Plus, User, MapPin, Ruler, Zap, Droplet, Hand, CalendarDays, Info, Edit2, HeartPulse, Flame, Apple, Target, History, Table, Trash2, Stethoscope, MessageSquareQuote, Filter, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAssessmentMetrics } from './Assessments';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { downloadCSV, triggerPrint } from '../lib/exportUtils';
import { generateAssessmentPDF, shareToWhatsApp } from '../lib/reportUtils';
import { format, isWithinInterval, startOfMonth, endOfMonth, parse, differenceInYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { Athlete, AssessmentEntry, NoteEntry, InjuryEntry } from '../types'; // Keep interface definition
import { useCategories } from '../hooks/useCategories';
import { uploadAthleteImage } from '../lib/storage';

interface AthleteProfileProps {
  athleteId: string;
  onBack: () => void;
}

export function AthleteProfile({ athleteId, onBack }: AthleteProfileProps) {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [isEditAssessmentModalOpen, setIsEditAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentEntry | null>(null);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryEntry | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [reportRange, setReportRange] = useState<'currentMonth' | 'custom'>('currentMonth');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'notes'>('overview');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Note' | 'Injury'>('All');

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useCategories();

  // Calculate differences for the assessment table summary
  const history = useMemo(() => {
    if (!athlete) return [];
    return [...(athlete.assessment_history || [])].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [athlete?.assessment_history]);

  // Calculate filtered history and title for report
  const { filteredHistory, reportTitle } = useMemo(() => {
    if (!athlete) return { filteredHistory: [], reportTitle: '' };
    let history = athlete.assessment_history || [];
    let title = '';

    if (reportRange === 'currentMonth') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      history = (athlete.assessment_history || []).filter(entry => {
        const entryDate = parse(entry.date, 'yyyy-MM-dd', new Date(), { locale: id });
        return isWithinInterval(entryDate, { start, end });
      });
      title = `Laporan Bulan ${format(new Date(), 'MMMM yyyy', { locale: id })}`;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      history = (athlete.assessment_history || []).filter(entry => {
        const entryDate = parse(entry.date, 'yyyy-MM-dd', new Date(), { locale: id });
        return isWithinInterval(entryDate, { start, end });
      });
      title = `Laporan Periode ${format(start, 'dd MMM yyyy', { locale: id })} - ${format(end, 'dd MMM yyyy', { locale: id })}`;
    }
    return { filteredHistory: history, reportTitle: title };
  }, [athlete, reportRange, startDate, endDate]);

  const fetchAthlete = async () => {
    setIsLoading(true);
    const { data: athleteData, error: athleteError } = await supabase
      .from('athletes')
      .select(`
        *,
        categories:category_id (name)
      `)
      .eq('id', athleteId)
      .single();
    
    if (athleteError) {
      console.error('Error fetching athlete:', athleteError);
    } else {
      // Fetch related data
      const [assessmentsRes, notesRes, injuriesRes] = await Promise.all([
        supabase.from('assessments').select('*').eq('athlete_id', athleteId).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('athlete_id', athleteId).order('date', { ascending: false }),
        supabase.from('injuries').select('*').eq('athlete_id', athleteId).order('date', { ascending: false })
      ]);

      const fullAthlete: Athlete = {
        ...athleteData,
        category_name: (Array.isArray(athleteData.categories) 
          ? athleteData.categories[0]?.name 
          : athleteData.categories?.name) || 'Unknown',
        assessment_history: assessmentsRes.data || [],
        notes_history: notesRes.data || [],
        injuries_history: injuriesRes.data || []
      };
      setAthlete(fullAthlete);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAthlete();
  }, [athleteId]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInputModalOpen(false);
        setIsEditProfileModalOpen(false);
        setIsHistoryModalOpen(false);
        setIsNoteModalOpen(false);
        setIsInjuryModalOpen(false);
        setIsShareModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500">Memuat data...</div>;
  if (!athlete) return <div className="p-8 text-center font-bold text-slate-500">Atlet tidak ditemukan</div>;

  const chartData = [...(athlete.assessment_history || [])].reverse().map(entry => ({
    date: entry.date,
    weight: entry.weight,
    target: athlete.target_weight,
    bodyFat: entry.bf_caliper,
    targetBodyFat: athlete.target_body_fat
  }));

  const startWeight = athlete.assessment_history && athlete.assessment_history.length > 0 
    ? athlete.assessment_history[athlete.assessment_history.length - 1].weight 
    : athlete.weight || 0;
  
  const startBF = athlete.assessment_history && athlete.assessment_history.length > 0
    ? athlete.assessment_history[athlete.assessment_history.length - 1].bf_caliper
    : 0;
  
  const calculateProgress = (start: number, current: number, target: number) => {
    if (start === target) return 100;
    const progress = ((start - current) / (start - target)) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  const weightProgress = calculateProgress(startWeight, athlete.weight || 0, athlete.target_weight);
  const bfProgress = calculateProgress(startBF, athlete.bf_caliper || 0, athlete.target_body_fat);

  const latest = history[0];
  const previous = history[1];
  const first = history[history.length - 1];

  const getDiff = (curr: number, prev: number) => {
    const diff = Number((curr - prev).toFixed(1));
    return {
      value: (diff > 0 ? '+' : '') + diff.toFixed(1),
      isPositive: diff > 0,
      isNegative: diff < 0,
      raw: diff
    };
  };

  const diffUpdate = previous ? {
    bfInBody: getDiff(latest.bf_in_body, previous.bf_in_body),
    total: getDiff(latest.total, previous.total),
    bfCaliper: getDiff(latest.bf_caliper, previous.bf_caliper),
    weight: getDiff(latest.weight, previous.weight),
    lbm: getDiff(latest.lbm, previous.lbm),
    fm: getDiff(latest.fm, previous.fm),
  } : null;

  const diffGlobal = first && first !== latest ? {
    bfInBody: getDiff(latest.bf_in_body, first.bf_in_body),
    total: getDiff(latest.total, first.total),
    bfCaliper: getDiff(latest.bf_caliper, first.bf_caliper),
    weight: getDiff(latest.weight, first.weight),
    lbm: getDiff(latest.lbm, first.lbm),
    fm: getDiff(latest.fm, first.fm),
  } : null;

  // Data untuk "Kemarin" (Mock)
  const yesterdayData = {
    weight: (athlete.weight - 0.4).toFixed(1),
  };

  const handleUpdateData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const weight = Number(formData.get('weight'));
    const bf_in_body = Number(formData.get('bf_in_body'));
    const bicep = Number(formData.get('bicep'));
    const tricep = Number(formData.get('tricep'));
    const subscapula = Number(formData.get('subscapula'));
    const abdominal = Number(formData.get('abdominal'));
    const dateInput = formData.get('date') as string;
    const notes = formData.get('notes') as string;
    
    const assessmentBase = {
      bicep,
      tricep,
      subscapula,
      abdominal,
      weight
    };
    const calculated = calculateAssessmentMetrics(assessmentBase, athlete.gender);
    const { total, bf_caliper, fm, lbm } = calculated;

    const date = dateInput || new Date().toISOString().split('T')[0];

    // Capture the absolute local time of the user's browser down to the minute to avoid UTC mismatches
    const localNow = new Date();
    // Keep it compatible with ISO format for DB, but ensure the string we save exactly represents their local time
    // We achieve this by offsetting the ISO string back to look like local time, effectively freezing it.
    const tzOffset = localNow.getTimezoneOffset() * 60000;
    const localIsoString = (new Date(localNow.getTime() - tzOffset)).toISOString().slice(0, -1) + '+07:00'; 
    // We force the UTC offset string to represent the exact local time perceived by the user.

    try {
      // 1. Insert assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert([{
          athlete_id: athleteId,
          date,
          created_at: localIsoString, // Force absolute local time stamp
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
        }]);

      if (assessmentError) throw assessmentError;

      // 2. Update athlete snapshot
      const { error: athleteError } = await supabase
        .from('athletes')
        .update({
          weight,
          bf_in_body,
          bf_caliper
        })
        .eq('id', athleteId);

      if (athleteError) throw athleteError;

      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsInputModalOpen(false);
        fetchAthlete();
      }, 1500);
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleEditAssessmentSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAssessment || !editingAssessment.id) return;

    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const bf_in_body = Number(formData.get('bf_in_body'));
    const bicep = Number(formData.get('bicep'));
    const tricep = Number(formData.get('tricep'));
    const subscapula = Number(formData.get('subscapula'));
    const abdominal = Number(formData.get('abdominal'));
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string;
    
    const assessmentBase = {
      bicep,
      tricep,
      subscapula,
      abdominal,
      weight
    };
    const calculated = calculateAssessmentMetrics(assessmentBase, athlete.gender);
    const { total, bf_caliper, fm, lbm } = calculated;

    try {
      setConfirmConfig({
        isOpen: true,
        title: 'Konfirmasi Simpan',
        message: 'Apakah Anda yakin ingin menyimpan perubahan data asesmen ini?',
        type: 'warning',
        onConfirm: async () => {
          const { error } = await supabase
            .from('assessments')
            .update({
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
            })
            .eq('id', editingAssessment.id);

          if (error) throw error;

          // Update athlete snapshot if this is the latest assessment
          const isLatest = athlete?.assessment_history?.[0]?.id === editingAssessment.id;
          if (isLatest) {
            await supabase
              .from('athletes')
              .update({ weight, bf_in_body, bf_caliper })
              .eq('id', athleteId);
          }

          setSaveStatus('success');
          setTimeout(() => {
            setSaveStatus('idle');
            setIsEditAssessmentModalOpen(false);
            fetchAthlete();
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Error updating assessment:', error);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Asesmen',
      message: 'Apakah Anda yakin ingin menghapus data asesmen ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('assessments')
            .delete()
            .eq('id', assessmentId);

          if (error) throw error;

          // If we deleted the latest assessment, we need to update the athlete snapshot with the new latest
          const isLatest = athlete?.assessment_history?.[0]?.id === assessmentId;
          if (isLatest && athlete.assessment_history.length > 1) {
            const nextLatest = athlete.assessment_history[1];
            await supabase
              .from('athletes')
              .update({ 
                weight: nextLatest.weight, 
                bf_in_body: nextLatest.bf_in_body,
                bf_caliper: nextLatest.bf_caliper
              })
              .eq('id', athleteId);
          } else if (isLatest && athlete.assessment_history.length === 1) {
            // No more assessments left
            await supabase
              .from('athletes')
              .update({ weight: 0, bf_in_body: 0, bf_caliper: 0 })
              .eq('id', athleteId);
          }

          fetchAthlete();
        } catch (error) {
          console.error('Error deleting assessment:', error);
        }
      }
    });
  };

  const handleExport = () => {
    const exportData = [{
      Nama: athlete.name,
      Divisi: athlete.category_name,
      Status: athlete.status,
      Berat: athlete.weight,
      TargetBerat: athlete.target_weight,
      Tinggi: athlete.height,
      Umur: athlete.age,
      CekTerakhir: '4j lalu'
    }];
    downloadCSV(exportData, `Laporan_Atlet_${athlete.name.replace(/\s+/g, '_')}`);
  };

  const handleEditProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const imageFile = formData.get('imageFile') as File;
    let image_url = athlete.image_url;

    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadAthleteImage(imageFile, athleteId);
      if (uploadedUrl) {
        image_url = uploadedUrl;
      }
    }
    
    const updatedData = {
      name: formData.get('name') as string,
      status: formData.get('status') as any,
      whatsapp: formData.get('whatsapp') as string,
      blood_type: formData.get('blood_type') as string,
      dominant_hand: formData.get('dominant_hand') as any,
      place_of_birth: formData.get('place_of_birth') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      height: Number(formData.get('height')),
      age: Number(formData.get('age')),
      gender: formData.get('gender') as any,
      weight: Number(formData.get('weight')),
      bf_caliper: Number(formData.get('bf_caliper')),
      bf_in_body: Number(formData.get('bf_in_body')),
      target_weight: Number(formData.get('target_weight')),
      target_body_fat: Number(formData.get('target_body_fat')),
      arm_circumference: Number(formData.get('arm_circumference')),
      arm_circumference_category: formData.get('arm_circumference_category') as string,
      arm_circumference_range_bb: formData.get('arm_circumference_range_bb') as string,
      category_id: formData.get('category') as string,
      image_url
    };

    try {
      setConfirmConfig({
        isOpen: true,
        title: 'Simpan Profil',
        message: 'Apakah Anda yakin ingin memperbarui data profil atlet ini?',
        type: 'warning',
        onConfirm: async () => {
          const { error } = await supabase
            .from('athletes')
            .update(updatedData)
            .eq('id', athleteId);

          if (error) throw error;

          setSaveStatus('success');
          setTimeout(() => {
            setSaveStatus('idle');
            setIsEditProfileModalOpen(false);
            fetchAthlete();
          }, 1500);
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Notes CRUD
  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const date = new Date().toISOString().split('T')[0];

    try {
      setConfirmConfig({
        isOpen: true,
        title: 'Simpan Catatan',
        message: `Apakah Anda yakin ingin menyimpan perubahan pada catatan ini?`,
        type: 'warning',
        onConfirm: async () => {
          if (editingNote) {
            const { error } = await supabase
              .from('notes')
              .update({ title, content })
              .eq('id', editingNote.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('notes')
              .insert([{ athlete_id: athleteId, title, content, date }]);
            if (error) throw error;
          }
          setSaveStatus('success');
          setTimeout(() => {
            setSaveStatus('idle');
            setIsNoteModalOpen(false);
            fetchAthlete();
          }, 1500);
        }
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Catatan',
      message: 'Apakah Anda yakin ingin menghapus catatan ini?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('notes').delete().eq('id', id);
          if (error) throw error;
          fetchAthlete();
        } catch (error) {
          console.error('Error deleting note:', error);
        }
      }
    });
  };

  // Injuries CRUD
  const handleSaveInjury = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const severity = formData.get('severity') as InjuryEntry['severity'];
    const status = formData.get('status') as InjuryEntry['status'];
    const notes = formData.get('notes') as string;
    const date = new Date().toISOString().split('T')[0];

    try {
      setConfirmConfig({
        isOpen: true,
        title: 'Simpan Data Cedera',
        message: 'Apakah Anda yakin ingin menyimpan perubahan pada data cedera ini?',
        type: 'warning',
        onConfirm: async () => {
          if (editingInjury) {
            const { error } = await supabase
              .from('injuries')
              .update({ type, severity, status, notes })
              .eq('id', editingInjury.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('injuries')
              .insert([{ athlete_id: athleteId, type, severity, status, notes, date }]);
            if (error) throw error;
          }
          setSaveStatus('success');
          setTimeout(() => {
            setSaveStatus('idle');
            setIsInjuryModalOpen(false);
            fetchAthlete();
          }, 1500);
        }
      });
    } catch (error) {
      console.error('Error saving injury:', error);
    }
  };

  const handleDeleteInjury = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Data Cedera',
      message: 'Apakah Anda yakin ingin menghapus data cedera ini?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('injuries').delete().eq('id', id);
          if (error) throw error;
          fetchAthlete();
        } catch (error) {
          console.error('Error deleting injury:', error);
        }
      }
    });
  };

  const handleShareReport = (type: 'pdf' | 'jpg' | 'whatsapp') => {
    if (!athlete) return;
    if (filteredHistory.length === 0) {
      setShareError('Tidak ada data asesmen pada rentang waktu tersebut.');
      setTimeout(() => setShareError(null), 3000);
      return;
    }

    try {
      if (type === 'pdf') {
        const doc = generateAssessmentPDF(athlete, filteredHistory, reportTitle, diffUpdate, diffGlobal);
        doc.save(`Laporan_Asesmen_${athlete.name.replace(/\s+/g, '_')}.pdf`);
      } else if (type === 'whatsapp') {
        // Download PDF first so user can attach it manually
        const doc = generateAssessmentPDF(athlete, filteredHistory, reportTitle, diffUpdate, diffGlobal);
        doc.save(`Laporan_Asesmen_${athlete.name.replace(/\s+/g, '_')}.pdf`);

        const message = `Halo ${athlete.name}, berikut adalah Laporan Asesmen Fisik Klinis kamu untuk ${reportTitle}.\n\n*RINGKASAN PROFIL:*\n- Nama: ${athlete.name}\n- Berat Badan: ${athlete.weight} kg (Target: ${athlete.target_weight} kg)\n- Body Fat: ${athlete.bf_caliper}% (Target: ${athlete.target_body_fat}%)\n\nDetail riwayat asesmen lengkap telah dilampirkan dalam dokumen PDF. Silakan cek perkembangannya. Semangat terus latihannya!`;
        shareToWhatsApp(athlete.whatsapp, message);
      }
      
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing report:', error);
      setShareError('Gagal memproses laporan. Silakan coba lagi.');
      setTimeout(() => setShareError(null), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full overflow-y-auto custom-scrollbar print-container relative bg-white"
    >
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
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Data atlet telah diperbarui</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Report Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Kirim Laporan</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pilih rentang waktu laporan</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {shareError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {shareError}
                </motion.div>
              )}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setReportRange('currentMonth')}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    reportRange === 'currentMonth' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Bulan Ini
                </button>
                <button 
                  onClick={() => setReportRange('custom')}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    reportRange === 'custom' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Kustom
                </button>
              </div>

              {reportRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Mulai</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Selesai</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 outline-none" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => handleShareReport('pdf')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Unduh Laporan PDF</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button 
                  onClick={() => handleShareReport('whatsapp')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-emerald-700">Kirim ke WhatsApp</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Input Modal */}
      {isInputModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Input Asesmen Berkala</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Input data untuk {athlete.name}</p>
              </div>
              <button onClick={() => setIsInputModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateData} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Seksi Tanggal & Info Dasar */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Dasar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Pengukuran</label>
                    <input 
                      name="date" 
                      type="date" 
                      defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Berat Badan (kg)</label>
                    <input name="weight" type="number" step="any" defaultValue={athlete.weight} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Seksi Biometrik */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Data Asesmen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Body Fat % (In Body)</label>
                    <input name="bf_in_body" type="number" step="any" defaultValue={athlete.bf_in_body} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Tambahan</label>
                    <input name="notes" type="text" placeholder="Contoh: Diukur pagi hari, kondisi fit" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Seksi Kaliper */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Data Kaliper (mm)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bisep (B)</label>
                    <input name="bicep" type="number" step="any" defaultValue={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Trisep (T)</label>
                    <input name="tricep" type="number" step="any" defaultValue={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Subskapula (SC)</label>
                    <input name="subscapula" type="number" step="any" defaultValue={7} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Abdominal (A)</label>
                    <input name="abdominal" type="number" step="any" defaultValue={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsInputModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200"
            >
              <div className="p-6 text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg",
                  confirmConfig.type === 'danger' ? "bg-red-50 text-red-600 shadow-red-100" : "bg-orange-50 text-orange-600 shadow-orange-100"
                )}>
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">{confirmConfig.title}</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                  {confirmConfig.message}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      confirmConfig.onConfirm();
                      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    }}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                      confirmConfig.type === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-brand-red hover:bg-brand-red-hover shadow-brand-red/20"
                    )}
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Assessment Modal */}
      <AnimatePresence>
        {isEditAssessmentModalOpen && editingAssessment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Asesmen Fisik</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update data untuk {athlete.name}</p>
                </div>
                <button onClick={() => setIsEditAssessmentModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleEditAssessmentSave} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Pengukuran</label>
                      <input 
                        name="date" 
                        type="date" 
                        defaultValue={editingAssessment.date} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Berat Badan (kg)</label>
                      <input name="weight" type="number" step="any" defaultValue={editingAssessment.weight} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Data Asesmen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Body Fat % (In Body)</label>
                      <input name="bf_in_body" type="number" step="any" defaultValue={editingAssessment.bf_in_body} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Tambahan</label>
                      <input name="notes" type="text" defaultValue={editingAssessment.notes || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Data Kaliper (mm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Bisep (B)</label>
                      <input name="bicep" type="number" step="any" defaultValue={editingAssessment.bicep} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Trisep (T)</label>
                      <input name="tricep" type="number" step="any" defaultValue={editingAssessment.tricep} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Subskapula (SC)</label>
                      <input name="subscapula" type="number" step="any" defaultValue={editingAssessment.subscapula} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Abdominal (A)</label>
                      <input name="abdominal" type="number" step="any" defaultValue={editingAssessment.abdominal} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsEditAssessmentModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Profil</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Perbarui data untuk {athlete.name}</p>
              </div>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleEditProfileSave} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                {/* Info Dasar */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                      <input name="name" type="text" defaultValue={athlete.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Foto Profil</label>
                      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                        <img src={athlete.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                        <input 
                          name="imageFile" 
                          type="file" 
                          accept="image/*"
                          className="flex-1 text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                      <select name="gender" defaultValue={athlete.gender} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                      <select name="status" defaultValue={athlete.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="AKTIF">AKTIF</option>
                        <option value="NON AKTIF">NON AKTIF</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
                      <select name="category" defaultValue={athlete.category_id} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        {categories.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor WhatsApp</label>
                      <input name="whatsapp" type="text" defaultValue={athlete.whatsapp} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Fisik & Medis */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Fisik & Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tinggi Badan (cm)</label>
                      <input name="height" type="number" defaultValue={athlete.height} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Umur</label>
                      <input id="edit-age" name="age" type="number" defaultValue={athlete.age} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-red uppercase">Berat Badan Saat Ini (kg)</label>
                      <input name="weight" type="number" step="any" defaultValue={athlete.weight} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5 flex gap-2">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-red uppercase">Body Fat (Kaliper) %</label>
                        <input name="bf_caliper" type="number" step="any" defaultValue={athlete.bf_caliper} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-blue-600 uppercase">Body Fat (InBody) %</label>
                        <input name="bf_in_body" type="number" step="any" defaultValue={athlete.bf_in_body} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Golongan Darah</label>
                      <input name="blood_type" defaultValue={athlete.blood_type} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tangan Dominan</label>
                      <select name="dominant_hand" defaultValue={athlete.dominant_hand} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="Kanan">Kanan</option>
                        <option value="Kidal">Kidal</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                      <input name="place_of_birth" type="text" defaultValue={athlete.place_of_birth} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                      <input 
                        name="date_of_birth" 
                        type="date" 
                        defaultValue={athlete.date_of_birth} 
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            const age = differenceInYears(new Date(), date);
                            const ageInput = document.getElementById('edit-age') as HTMLInputElement;
                            if (ageInput) ageInput.value = age.toString();
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Target & Komposisi */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Target & Komposisi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Target Berat Badan (kg)</label>
                      <input name="target_weight" type="number" step="any" defaultValue={athlete.target_weight} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Target Body Fat (%)</label>
                      <input name="target_body_fat" type="number" step="any" defaultValue={athlete.target_body_fat} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Lingkar Lengan (cm)</label>
                      <input name="arm_circumference" type="number" step="any" defaultValue={athlete.arm_circumference} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori Lengan</label>
                      <input name="arm_circumference_category" type="text" defaultValue={athlete.arm_circumference_category} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Range BB Lengan</label>
                      <input name="arm_circumference_range_bb" type="text" defaultValue={athlete.arm_circumference_range_bb} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-8 flex gap-3 border-t border-slate-100 mt-8">
                <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20">
                  Simpan Profil
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Table className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Tabel Riwayat Asesmen</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Data Historis Komposisi Tubuh - {athlete.name}</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="overflow-x-auto" id="assessment-history-table">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">No</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">Hari Tanggal</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">BF % In Body</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center border border-slate-200" colSpan={4}>Body Fat % (Kaliper)</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">TOT</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">BF%</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">BB (kg)</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">LBM (kg)</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">FM (kg)</th>
                      <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">Catatan</th>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-100/50">
                      <th colSpan={3} className="border border-slate-200"></th>
                      <th className="py-2 px-2 text-[8px] font-bold text-slate-700 uppercase text-center border border-slate-200">B</th>
                      <th className="py-2 px-2 text-[8px] font-bold text-slate-700 uppercase text-center border border-slate-200">T</th>
                      <th className="py-2 px-2 text-[8px] font-bold text-slate-700 uppercase text-center border border-slate-200">SC</th>
                      <th className="py-2 px-2 text-[8px] font-bold text-slate-700 uppercase text-center border border-slate-200">A</th>
                      <th colSpan={5} className="border border-slate-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(athlete.assessment_history || []).map((entry, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-4 text-xs font-bold text-slate-400 border border-slate-100">{index + 1}</td>
                        <td className="py-4 px-4 text-xs font-black text-slate-900 border border-slate-100">{entry.date}</td>
                        <td className="py-4 px-4 text-xs font-black text-blue-600 border border-slate-100">{entry.bf_in_body}%</td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-600 text-center border border-slate-100">{entry.bicep}</td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-600 text-center border border-slate-100">{entry.tricep}</td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-600 text-center border border-slate-100">{entry.subscapula}</td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-600 text-center border border-slate-100">{entry.abdominal}</td>
                        <td className="py-4 px-4 text-xs font-black text-slate-900 border border-slate-100">{entry.total}</td>
                        <td className="py-4 px-4 text-xs font-black text-brand-red border border-slate-100">{entry.bf_caliper}%</td>
                        <td className="py-4 px-4 text-xs font-black text-slate-900 border border-slate-100 bg-yellow-50/50">{entry.weight}</td>
                        <td className="py-4 px-4 text-xs font-black text-emerald-600 border border-slate-100">{entry.lbm}</td>
                        <td className="py-4 px-4 text-xs font-black text-orange-600 border border-slate-100">{entry.fm}</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-500 border border-slate-100 italic">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest border border-slate-200 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Ekspor CSV
              </button>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header Section */}
      <div id="athlete-profile-content" className="p-4 md:p-8 space-y-6 md:space-y-8 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <button 
            onClick={onBack}
            className="self-start md:self-auto p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 md:gap-5">
            <div className="relative">
              <img src={athlete.image_url} alt={athlete.name} className="w-16 h-16 md:w-20 md:h-20 rounded-3xl border-2 border-slate-100 object-cover shadow-lg" />
              <div className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white",
                athlete.status === 'Fit' ? "bg-green-500" : 
                athlete.status === 'Cedera' ? "bg-red-500" : "bg-yellow-500"
              )}></div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">{athlete.name}</h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  athlete.status === 'Fit' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                  athlete.status === 'Cedera' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                )}>
                  {athlete.status}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 mt-1.5">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Kategori {athlete.category_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 no-print">
          <button 
            onClick={() => setIsEditProfileModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden md:inline">Edit Profil</span>
            <span className="md:hidden">Edit</span>
          </button>
          <button 
            onClick={() => setIsInputModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-lg shadow-slate-900/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Input Asesmen</span>
            <span className="md:hidden">Input</span>
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Kirim Hasil</span>
            <span className="md:hidden">Kirim</span>
          </button>
          <button 
            onClick={triggerPrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Cetak</span>
            <span className="md:hidden">Cetak</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition-all shadow-lg shadow-brand-red/20"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Ekspor</span>
            <span className="md:hidden">Ekspor</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 md:gap-8 border-b border-slate-100 no-print overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === 'overview' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Ringkasan Profil
          {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('assessment')}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === 'assessment' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Asesmen Fisik
          {activeTab === 'assessment' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === 'notes' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Catatan
          {activeTab === 'notes' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red rounded-t-full" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Hero Section: Anatomical Mapping & Personal Data */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Anatomical Mapping */}
              <div className="lg:col-span-6 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[650px]">
                <div className="absolute top-8 left-8 flex flex-col z-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Komposisi Tubuh</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Visualisasi Klinis</span>
                </div>
                
                <BodyVisualization athlete={athlete} />
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Data Terverifikasi</span>
                </div>
              </div>

              {/* Right: Comprehensive Personal Data Card */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Identitas & Fisik Atlet</h3>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={cn("w-2 h-2 rounded-full", athlete.status === 'AKTIF' ? "bg-green-500" : "bg-slate-400")}></div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Status {athlete.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-grow">
                    {/* Identity Group */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Profil Dasar</h4>
                        <ProfileItem label="Nama Lengkap" value={athlete.name} />
                        <ProfileItem label="Kategori" value={athlete.category_name} />
                        <ProfileItem label="Nomor WhatsApp" value={athlete.whatsapp} />
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Kelahiran</h4>
                        <ProfileItem label="Tempat Lahir" value={athlete.place_of_birth} />
                        <ProfileItem label="Tanggal Lahir" value={athlete.date_of_birth} />
                        <ProfileItem label="Umur" value={`${athlete.age} Tahun`} />
                      </div>
                    </div>

                    {/* Physical Group */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Metrik Fisik</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <ProfileItem label="Tinggi" value={`${athlete.height} cm`} />
                          <ProfileItem label="Berat" value={`${athlete.weight} kg`} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <ProfileItem label="Gol. Darah" value={athlete.blood_type} />
                          <ProfileItem label="Tangan" value={athlete.dominant_hand} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Antropometri</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <ProfileItem label="Lingkar Lengan" value={`${(athlete.arm_circumference || 0).toFixed(1)} cm`} />
                          <ProfileItem label="Kategori Lengan" value={athlete.arm_circumference_category} />
                        </div>
                        <ProfileItem label="Range BB" value={athlete.arm_circumference_range_bb} />
                        <div className="grid grid-cols-2 gap-4">
                          <ProfileItem label="Body Fat (Kaliper)" value={`${athlete.bf_caliper || 0} %`} />
                          <ProfileItem label="Body Fat (In Body)" value={`${athlete.bf_in_body || 0} %`} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <ProfileItem label="Target Berat Badan" value={`${athlete.target_weight} kg`} />
                          <ProfileItem label="Target Body Fat" value={`${athlete.target_body_fat} %`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Analysis Section: Trends & Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Weight Trend Chart */}
              <div className="lg:col-span-12 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tren Komposisi Tubuh</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Perubahan Berat & Lemak 6 Bulan Terakhir</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Berat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Target BB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Body Fat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Target BF</span>
                    </div>
                  </div>
                </div>

                <div className="h-[350px] w-full mb-10 overflow-hidden">
                  <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        hide 
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        hide 
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 900, marginBottom: '8px', fontSize: '11px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        itemStyle={{ padding: '2px 0', fontWeight: 700, fontSize: '12px' }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#e11d48" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Berat (kg)"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="target" 
                        stroke="#94a3b8" 
                        strokeWidth={1.5} 
                        strokeDasharray="4 4"
                        dot={false}
                        name="Target BB"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="bodyFat" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Body Fat (%)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="targetBodyFat" 
                        stroke="#64748b" 
                        strokeWidth={1.5} 
                        strokeDasharray="4 4"
                        dot={false}
                        name="Target BF"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Bars Section - Moved to Bottom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Berat Badan</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-brand-red bg-red-50 px-2 py-0.5 rounded-full">{weightProgress}%</span>
                        <span className="text-xs font-black text-slate-900">{athlete.weight} kg</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${weightProgress}%` }}
                        className="h-full bg-brand-red rounded-full shadow-sm"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span>Mulai: {startWeight} kg</span>
                      <span className="text-slate-600">Target: {athlete.target_weight} kg</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Body Fat</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{bfProgress}%</span>
                        <span className="text-xs font-black text-slate-900">{athlete.bf_caliper || 0}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${bfProgress}%` }}
                        className="h-full bg-blue-500 rounded-full shadow-sm"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span>Mulai: {startBF}%</span>
                      <span className="text-slate-600">Target: {athlete.target_body_fat}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="lg:col-span-12 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-brand-red rounded-full"></div>
                    <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Perbandingan Asesmen</h2>
                  </div>
                  <button 
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-brand-red uppercase tracking-widest transition-all border border-slate-100"
                  >
                    <Table className="w-3 h-3" />
                    Lihat Riwayat Lengkap
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AssessmentSummaryCard 
                    title="Asesmen Terbaru" 
                    data={athlete.assessment_history?.[0] as AssessmentEntry} 
                    targetWeight={athlete.target_weight}
                    type="current"
                  />
                  <AssessmentSummaryCard 
                    title="3 Bulan Lalu" 
                    data={athlete.assessment_history?.[athlete.assessment_history.length - 1] as AssessmentEntry} 
                    type="past"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'assessment' ? (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Riwayat Asesmen Fisik</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data komposisi tubuh historis</p>
              </div>
              <button 
                onClick={() => setIsInputModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" /> Input Asesmen Baru
              </button>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-100">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest">Tanggal</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BF% InB</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">B</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">T</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">SC</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">A</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">TOT</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BF% Cal</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">BB (kg)</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">LBM</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">FM</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(athlete.assessment_history || []).map((entry, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors even:bg-slate-50/50">
                        <td className="px-6 py-4 text-xs font-black text-slate-900">{entry.date}</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-blue-600">{entry.bf_in_body}%</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{entry.bicep}</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{entry.tricep}</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{entry.subscapula}</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{entry.abdominal}</td>
                        <td className="px-4 py-4 text-center text-xs font-black text-slate-900 bg-slate-50/30">{entry.total}</td>
                        <td className="px-4 py-4 text-center text-xs font-black text-brand-red bg-slate-50/30">{entry.bf_caliper}%</td>
                        <td className="px-4 py-4 text-center text-xs font-black text-slate-900">{entry.weight}</td>
                        <td className="px-4 py-4 text-center text-xs font-black text-emerald-600 bg-slate-50/30">{entry.lbm}</td>
                        <td className="px-4 py-4 text-center text-xs font-black text-orange-600 bg-slate-50/30">{entry.fm}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingAssessment(entry);
                                setIsEditAssessmentModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => entry.id && handleDeleteAssessment(entry.id)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Summary Rows */}
                    {diffUpdate && (
                      <tr className="bg-slate-50/80 border-t-2 border-slate-100">
                        <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Terupdate</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black", diffUpdate.bfInBody.raw === 0 ? "text-slate-400" : diffUpdate.bfInBody.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.bfInBody.value}%</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffUpdate.total.raw === 0 ? "text-slate-400" : diffUpdate.total.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.total.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffUpdate.bfCaliper.raw === 0 ? "text-slate-400" : diffUpdate.bfCaliper.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.bfCaliper.value}%</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black", diffUpdate.weight.raw === 0 ? "text-slate-400" : diffUpdate.weight.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.weight.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffUpdate.lbm.raw === 0 ? "text-slate-400" : diffUpdate.lbm.isPositive ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.lbm.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffUpdate.fm.raw === 0 ? "text-slate-400" : diffUpdate.fm.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffUpdate.fm.value}</td>
                        <td className="px-4 py-4"></td>
                      </tr>
                    )}
                    {diffGlobal && (
                      <tr className="bg-slate-100/30">
                        <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Global</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black", diffGlobal.bfInBody.raw === 0 ? "text-slate-400" : diffGlobal.bfInBody.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.bfInBody.value}%</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">-</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffGlobal.total.raw === 0 ? "text-slate-400" : diffGlobal.total.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.total.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffGlobal.bfCaliper.raw === 0 ? "text-slate-400" : diffGlobal.bfCaliper.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.bfCaliper.value}%</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black", diffGlobal.weight.raw === 0 ? "text-slate-400" : diffGlobal.weight.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.weight.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffGlobal.lbm.raw === 0 ? "text-slate-400" : diffGlobal.lbm.isPositive ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.lbm.value}</td>
                        <td className={cn("px-4 py-4 text-center text-xs font-black bg-slate-100/50", diffGlobal.fm.raw === 0 ? "text-slate-400" : diffGlobal.fm.isNegative ? "text-emerald-600" : "text-brand-red")}>{diffGlobal.fm.value}</td>
                        <td className="px-4 py-4"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formula Note Card - Standalone Version */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-red/10 transition-colors" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Panduan Cara Membaca Data</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Penjelasan rumus & logika perhitungan progres</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Komposisi Tubuh Section */}
                <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-blue-900 uppercase tracking-widest">Komposisi Tubuh</h5>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight mb-1">Massa Lemak</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Dihitung dari <span className="text-slate-900 font-bold">Berat Badan</span> dikalikan dengan <span className="text-slate-900 font-bold">Persentase Lemak</span> tubuh atlet.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight mb-1">Massa Otot</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Dihitung dari <span className="text-slate-900 font-bold">Berat Badan</span> dikurangi dengan <span className="text-slate-900 font-bold">Massa Lemak</span> (hasil berat bersih tanpa lemak).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logika Progres Section */}
                <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Logika Perubahan</h5>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight mb-1">Total Terupdate</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Melihat selisih antara <span className="text-slate-900 font-bold">data terbaru</span> dengan <span className="text-slate-900 font-bold">data tepat sebelumnya</span> (progres jangka pendek).
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight mb-1">Total Global</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Melihat selisih antara <span className="text-slate-900 font-bold">data terbaru</span> dengan <span className="text-slate-900 font-bold">data pertama kali</span> atlet diukur (progres jangka panjang).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Catatan & Feedback</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Memo khusus perkembangan atlet</p>
              </div>
              <button 
                onClick={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" /> Tambah Catatan Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(athlete.notes_history || []).length > 0 ? (
                (athlete.notes_history || []).map((note) => (
                  <div key={note.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all group relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{note.date}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">{note.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{note.content}</p>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => {
                          setEditingNote(note);
                          setIsNoteModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-brand-red transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <MessageSquareQuote className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada catatan untuk atlet ini</p>
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="mt-4 text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline"
                  >
                    Tambah Catatan Pertama
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{editingNote ? 'Edit Catatan' : 'Tambah Catatan'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Berikan feedback untuk perkembangan atlet</p>
              </div>
              <button onClick={() => setIsNoteModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveNote} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Judul</label>
                <input name="title" type="text" defaultValue={editingNote?.title} required placeholder="Contoh: Fokus Power" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-slate-900 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Isi Catatan</label>
                <textarea name="content" defaultValue={editingNote?.content} required rows={4} placeholder="Tulis detail catatan di sini..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-slate-900 outline-none transition-all resize-none" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsNoteModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Injury Modal */}
      {isInjuryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{editingInjury ? 'Edit Data Cedera' : 'Lapor Cedera'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pantau kesehatan dan progres pemulihan</p>
              </div>
              <button onClick={() => setIsInjuryModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveInjury} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jenis Cedera</label>
                <input name="type" type="text" defaultValue={editingInjury?.type} required placeholder="Contoh: Strain Hamstring" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-brand-red outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Keparahan</label>
                  <select name="severity" defaultValue={editingInjury?.severity || 'Ringan'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-brand-red outline-none transition-all">
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                  <select name="status" defaultValue={editingInjury?.status || 'Active'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-brand-red outline-none transition-all">
                    <option value="Active">Aktif</option>
                    <option value="Recovered">Sembuh</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catatan Medis</label>
                <textarea name="notes" defaultValue={editingInjury?.notes} required rows={4} placeholder="Tulis detail cedera dan progres pemulihan..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-brand-red outline-none transition-all resize-none" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsInjuryModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-brand-red hover:bg-brand-red-hover text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-red/20">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, alert, color, delta }: { icon: any, label: string, value: string, subValue: string, alert?: boolean, color: string, delta?: string }) {
  const colorStyles = {
    red: 'bg-pastel-red text-brand-red',
    blue: 'bg-pastel-blue text-blue-600',
    indigo: 'bg-pastel-indigo text-indigo-600',
    orange: 'bg-pastel-orange text-orange-600',
  };

  const isPositive = delta ? delta.startsWith('+') : false;

  return (
    <div className={cn(
      "bg-white rounded-3xl p-6 border transition-all relative overflow-hidden group shadow-sm",
      alert ? "border-brand-red/30 shadow-[0_0_20px_rgba(225,29,72,0.05)]" : "border-slate-200 hover:border-slate-300"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-500", colorStyles[color as keyof typeof colorStyles])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        {delta && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
            isPositive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subValue}</div>
      
      {alert && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse shadow-[0_0_10px_rgba(225,29,72,1)]"></div>
        </div>
      )}
    </div>
  );
}

function AssessmentSummaryCard({ title, data, targetWeight, type }: { title: string, data: AssessmentEntry, targetWeight?: number, type: 'current' | 'past' }) {
  if (!data) return null;

  const isAlert = targetWeight ? Math.abs(data.weight - targetWeight) > 1.5 : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className={cn("w-1 h-3 rounded-full", type === 'current' ? "bg-brand-red/50" : "bg-slate-200")}></div>
        <h2 className="text-[10px] font-black text-slate-400 tracking-tight uppercase">{title}</h2>
      </div>
      
      <div className={cn(
        "bg-white rounded-[2rem] p-6 border transition-all shadow-sm relative overflow-hidden",
        type === 'past' ? "opacity-60 grayscale-[0.5]" : "",
        isAlert && type === 'current' ? "border-brand-red/30" : "border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              type === 'current' ? "bg-pastel-red text-brand-red" : "bg-slate-100 text-slate-400"
            )}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Berat Badan</div>
              <div className="text-2xl font-black text-slate-900">{data.weight} kg</div>
            </div>
          </div>
          {targetWeight && (
            <div className="text-right">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target</div>
              <div className="text-xs font-black text-slate-600">{targetWeight} kg</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Body Fat %</div>
            <div className="text-sm font-black text-brand-red">{data.bf_caliper}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">In Body %</div>
            <div className="text-sm font-black text-blue-600">{data.bf_in_body}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">LBM (Otot)</div>
            <div className="text-sm font-black text-emerald-600">{data.lbm} kg</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">FM (Lemak)</div>
            <div className="text-sm font-black text-orange-600">{data.fm} kg</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{data.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">TOT: {data.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ icon: Icon, label, sub, color }: { icon: any, label: string, sub: string, color: 'blue' | 'orange' | 'red' | 'green' }) {
  const styles = {
    blue: 'bg-pastel-blue text-blue-600 border-blue-100',
    orange: 'bg-pastel-orange text-orange-600 border-orange-100',
    red: 'bg-pastel-red text-brand-red border-red-100',
    green: 'bg-pastel-green text-green-600 border-green-100',
  };

  return (
    <div className="flex-1 w-full md:w-auto p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 border", styles[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-sm font-bold text-slate-900">{label}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{sub}</div>
    </div>
  );
}


function BodyVisualization({ athlete }: { athlete: any }) {
  const latestAssessment = athlete.assessment_history?.[0] || {};

  return (
    <div className="relative w-full max-w-[700px] h-[600px] flex items-center justify-center">
      {/* Height Scale Axis - Moved closer to body to avoid overlapping with text */}
      <div className="absolute left-[28%] top-1/2 -translate-y-1/2 h-[400px] flex flex-col items-center z-10 pointer-events-none">
        <div className="w-px h-full bg-slate-300 relative opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-px bg-slate-400"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-px bg-slate-400"></div>
        </div>
        <div className="absolute -top-14 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{athlete.height}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">cm</span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tinggi</span>
        </div>
      </div>

      {/* Anatomical Image */}
      <div className="relative h-full w-full flex items-center justify-center z-0">
        <img 
          src="https://i.imgur.com/P0mCrTm.png" 
          alt="Anatomical Mapping" 
          className="h-[550px] w-auto object-contain opacity-90 grayscale-[0.2]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Clean Stats Layout - Pushed to the edges to ensure no overlap */}
      <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
        {/* Left Column: Weight Metrics */}
        <div className="flex flex-col gap-16 pl-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Berat Badan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">{athlete.weight}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">kg</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Target Berat Badan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900/40">{athlete.target_weight}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">kg</span>
            </div>
          </div>
        </div>

        {/* Right Column: Body Fat Metrics */}
        <div className="flex flex-col gap-16 text-right pr-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Body Fat</span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-4xl font-black text-brand-red">{athlete.bf_caliper}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Target Body Fat</span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-4xl font-black text-brand-red/40">{athlete.target_body_fat}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BodyCallout({ label, value, sub, position, align = 'left', alert, highlight }: { label: string, value: string, sub: string, position: string, align?: 'left' | 'right', alert?: boolean, highlight?: boolean }) {
  return (
    <div className={cn("z-10 flex flex-col", position, align === 'right' ? "items-end" : "items-start")}>
      <div className={cn(
        "px-4 py-2.5 rounded-2xl border transition-all duration-300 hover:shadow-lg min-w-[110px]",
        highlight ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm",
        alert ? "border-brand-red/50 bg-red-50" : ""
      )}>
        <span className={cn("text-[8px] font-black uppercase tracking-widest block mb-0.5", highlight ? "text-slate-400" : "text-slate-400")}>{label}</span>
        <span className={cn("text-sm font-black block leading-none", highlight ? "text-white" : "text-slate-900", alert ? "text-brand-red" : "")}>{value}</span>
        <span className={cn("text-[7px] font-bold uppercase tracking-widest block mt-1", highlight ? "text-brand-red" : "text-slate-300")}>{sub}</span>
      </div>
      {/* Visual Connector Dot */}
      <div className={cn(
        "w-1.5 h-1.5 rounded-full mt-2",
        highlight ? "bg-brand-red" : "bg-slate-300",
        align === 'right' ? "mr-4" : "ml-4"
      )}></div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
