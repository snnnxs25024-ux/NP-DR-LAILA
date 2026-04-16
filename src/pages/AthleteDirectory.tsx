import { useState, useEffect, FormEvent, useRef, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Filter, Search, ChevronRight, Activity, Droplets, Scale, UserPlus, Grid, List, X, Plus, Trash2, Edit2, Check, Save, Ruler, Download, Upload, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Athlete, Category, AssessmentEntry, NoteEntry, InjuryEntry } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { differenceInYears, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';
import { uploadAthleteImage } from '../lib/storage';
import { getBFFromTable } from '../lib/bodyFat';

interface AthleteDirectoryProps {
  onSelectAthlete: (id: string) => void;
}

export function AthleteDirectory({ onSelectAthlete }: AthleteDirectoryProps) {
  const [athletesList, setAthletesList] = useState<Athlete[]>([]);
  const { categories, setCategories, isLoading: isCategoriesLoading, refreshCategories, deleteCategory } = useCategories();
  
  const fetchAthletes = async () => {
    const { data, error } = await supabase
      .from('athletes')
      .select(`
        *,
        categories:category_id (name),
        assessment_history:assessments(*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching athletes:', error);
    } else {
      const mappedData = data.map((a: any) => ({
        ...a,
        category_name: (Array.isArray(a.categories) 
          ? a.categories[0]?.name 
          : a.categories?.name) || 'Unknown',
        assessment_history: (a.assessment_history || []).sort((x: any, y: any) => 
          new Date(y.date).getTime() - new Date(x.date).getTime()
        )
      }));
      setAthletesList(mappedData as Athlete[]);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);
  
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: '',
    message: ''
  });

  const showNotification = (title: string, message: string) => {
    setNotification({ show: true, title, message });
    setTimeout(() => {
      setNotification({ show: false, title: '', message: '' });
    }, 3000);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsManageModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Filtered Athletes
  const filteredAthletes = athletesList.filter(a => {
    const matchCat = selectedCategory === 'All' || a.category_name === selectedCategory;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddAthlete = async (newAthlete: Athlete, initialAssessment: AssessmentEntry) => {
    try {
      // 1. Insert athlete
      const { data: athleteData, error: athleteError } = await supabase
        .from('athletes')
        .insert([{
          name: newAthlete.name,
          category_id: newAthlete.category_id,
          status: newAthlete.status,
          whatsapp: newAthlete.whatsapp,
          place_of_birth: newAthlete.place_of_birth,
          date_of_birth: newAthlete.date_of_birth,
          age: newAthlete.age,
          gender: newAthlete.gender,
          height: newAthlete.height,
          blood_type: newAthlete.blood_type,
          dominant_hand: newAthlete.dominant_hand,
          arm_circumference: newAthlete.arm_circumference,
          arm_circumference_category: newAthlete.arm_circumference_category,
          arm_circumference_range_bb: newAthlete.arm_circumference_range_bb,
          target_weight: newAthlete.target_weight,
          target_body_fat: newAthlete.target_body_fat,
          image_url: newAthlete.image_url,
          weight: initialAssessment.weight, // Snapshot
          bf_in_body: initialAssessment.bf_in_body, // Snapshot
          bf_caliper: initialAssessment.bf_caliper // Snapshot
        }])
        .select();

      if (athleteError) throw athleteError;

      const createdAthlete = athleteData[0];

      // 2. Insert initial assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert([{
          athlete_id: createdAthlete.id,
          date: initialAssessment.date,
          weight: initialAssessment.weight,
          bf_caliper: initialAssessment.bf_caliper,
          bf_in_body: initialAssessment.bf_in_body,
          bicep: initialAssessment.bicep,
          tricep: initialAssessment.tricep,
          subscapula: initialAssessment.subscapula,
          abdominal: initialAssessment.abdominal,
          total: initialAssessment.total,
          lbm: initialAssessment.lbm,
          fm: initialAssessment.fm
        }]);

      if (assessmentError) throw assessmentError;

      showNotification('Berhasil', 'Atlet berhasil ditambahkan!');
      fetchAthletes();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding athlete:', error);
      showNotification('Gagal', 'Gagal menambahkan atlet. Silakan cek koneksi atau database.');
    }
  };

  const handleDeleteAthlete = (id: string, name: string, e: any) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Atlet',
      message: `Apakah Anda yakin ingin menghapus atlet "${name}" beserta semua data riwayatnya? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('athletes').delete().eq('id', id);
          if (error) throw error;
          showNotification('Berhasil', 'Atlet berhasil dihapus.');
          fetchAthletes();
        } catch (error) {
          console.error('Error deleting athlete:', error);
          showNotification('Gagal', 'Gagal menghapus atlet.');
        }
      }
    });
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Atlet');

    worksheet.columns = [
      { header: 'Nama', key: 'name', width: 20 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'WhatsApp', key: 'whatsapp', width: 15 },
      { header: 'TempatLahir', key: 'placeOfBirth', width: 15 },
      { header: 'TanggalLahir', key: 'dateOfBirth', width: 15 },
      { header: 'Umur', key: 'age', width: 10 },
      { header: 'JenisKelamin', key: 'gender', width: 15 },
      { header: 'TinggiBadan', key: 'height', width: 15 },
      { header: 'BeratBadan', key: 'weight', width: 15 },
      { header: 'GolonganDarah', key: 'bloodType', width: 15 },
      { header: 'TanganDominan', key: 'dominantHand', width: 15 },
      { header: 'LingkarLengan', key: 'armCircumference', width: 15 },
      { header: 'KategoriLengan', key: 'armCircumferenceCategory', width: 20 },
      { header: 'RangeBBIdeal', key: 'armCircumferenceRangeBB', width: 15 },
      { header: 'TargetBB', key: 'targetWeight', width: 15 },
      { header: 'TargetBF', key: 'targetBodyFat', width: 15 },
      { header: 'BFInBody', key: 'bfInBody', width: 15 },
      { header: 'Bisep', key: 'bicep', width: 10 },
      { header: 'Trisep', key: 'tricep', width: 10 },
      { header: 'Subskapula', key: 'subscapula', width: 15 },
      { header: 'Abdominal', key: 'abdominal', width: 15 },
    ];

    worksheet.addRow({
      name: 'Contoh Atlet',
      category: categories[0] ? categories[0].name : 'U-15',
      status: 'AKTIF',
      whatsapp: '+628123456789',
      placeOfBirth: 'Jakarta',
      dateOfBirth: '2009-08-12', // Gunakan format standar agar tidak bentrok
      age: '', // Kosongkan agar di auto-calculate
      gender: 'Laki-laki',
      height: 168,
      weight: 65,
      bloodType: 'O',
      dominantHand: 'Kanan',
      armCircumference: 32,
      armCircumferenceCategory: 'BESAR',
      armCircumferenceRangeBB: '60-70',
      targetWeight: 63,
      targetBodyFat: 12,
      bfInBody: 15,
      bicep: 5,
      tricep: 8,
      subscapula: 10,
      abdominal: 12
    });

    const validCategories = categories.filter(c => c.name !== 'All').map(c => c.name);
    const categoryList = validCategories.join(',');
    
    for (let i = 2; i <= 1000; i++) {
      worksheet.getCell(`B${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categoryList}"`]
      };
      worksheet.getCell(`C${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"AKTIF,TIDAK AKTIF"']
      };
      
      worksheet.getCell(`H${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"Laki-laki,Perempuan"']
      };
      
      // Removed automatic formula from UI template definition so dates handle correctly during read
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'template_atlet.xlsx');
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Atlet');

    worksheet.columns = [
      { header: 'Nama', key: 'name', width: 20 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'WhatsApp', key: 'whatsapp', width: 15 },
      { header: 'TempatLahir', key: 'placeOfBirth', width: 15 },
      { header: 'TanggalLahir', key: 'dateOfBirth', width: 15 },
      { header: 'Umur', key: 'age', width: 10 },
      { header: 'JenisKelamin', key: 'gender', width: 15 },
      { header: 'TinggiBadan', key: 'height', width: 15 },
      { header: 'BeratBadan', key: 'weight', width: 15 },
      { header: 'GolonganDarah', key: 'bloodType', width: 15 },
      { header: 'TanganDominan', key: 'dominantHand', width: 15 },
      { header: 'LingkarLengan', key: 'armCircumference', width: 15 },
      { header: 'KategoriLengan', key: 'armCircumferenceCategory', width: 20 },
      { header: 'RangeBBIdeal', key: 'armCircumferenceRangeBB', width: 15 },
      { header: 'TargetBB', key: 'targetWeight', width: 15 },
      { header: 'TargetBF', key: 'targetBodyFat', width: 15 },
      { header: 'BFInBody', key: 'bfInBody', width: 15 },
      { header: 'Bisep', key: 'bicep', width: 10 },
      { header: 'Trisep', key: 'tricep', width: 10 },
      { header: 'Subskapula', key: 'subscapula', width: 15 },
      { header: 'Abdominal', key: 'abdominal', width: 15 },
    ];

    athletesList.forEach(a => {
      worksheet.addRow({
        name: a.name,
        category: a.category_name,
        status: a.status,
        whatsapp: a.whatsapp || '',
        placeOfBirth: a.place_of_birth || '',
        dateOfBirth: a.date_of_birth || '',
        age: a.age || 0,
        gender: (a.gender === 'P' || a.gender === 'Perempuan' as any) ? 'Perempuan' : 'Laki-laki',
        height: a.height || 0,
        weight: a.weight || 0,
        bloodType: a.blood_type || '',
        dominantHand: a.dominant_hand || '',
        armCircumference: a.arm_circumference || 0,
        armCircumferenceCategory: a.arm_circumference_category || '',
        armCircumferenceRangeBB: a.arm_circumference_range_bb || '',
        targetWeight: a.target_weight || 0,
        targetBodyFat: a.target_body_fat || 0,
        bfInBody: a.bf_in_body || 0,
        bicep: a.assessment_history?.[0]?.bicep || 0,
        tricep: a.assessment_history?.[0]?.tricep || 0,
        subscapula: a.assessment_history?.[0]?.subscapula || 0,
        abdominal: a.assessment_history?.[0]?.abdominal || 0
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'data_atlet.xlsx');
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.worksheets[0];
      
      const athletesToInsert: any[] = [];
      const assessmentsToInsert: any[] = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        
        const values = row.values as any[];
        const getVal = (idx: number) => {
          const v = values[idx];
          if (v && typeof v === 'object' && v.result !== undefined) return v.result;
          if (v && typeof v === 'object' && v.text !== undefined) return String(v.text);
          if (v instanceof Date) return v.toISOString().split('T')[0];
          return v;
        };

        const name = getVal(1) || 'Unknown';
        const categoryName = String(getVal(2) || '').trim();
        // Fallback robust mapping: match substring loosely if exact match fails
        let category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          category = categories.find(c => categoryName.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(categoryName.toLowerCase())) || categories.find(c => c.name !== 'All');
          
          if (!category) {
            console.warn(`Category ${categoryName} not found and no fallback available.`);
            return; // Skip if we really can't find a category
          }
        }
        
        const status = getVal(3) || 'AKTIF';
        const whatsapp = getVal(4) || '+62';
        const place_of_birth = getVal(5) || '';
        let date_of_birth = getVal(6) || '';
        
        // Auto-calculate Age if date is provided
        let age = parseInt(getVal(7)) || 0;
        
        let genderRaw = getVal(8) || 'Laki-laki';
        let genderDbVal = (String(genderRaw).toLowerCase().trim() === 'perempuan' || String(genderRaw).toLowerCase().trim() === 'p') ? 'P' : 'L';
        
        if (date_of_birth && typeof date_of_birth === 'string' || date_of_birth instanceof Date) {
          try {
             // Handle standard YYYY-MM-DD or excel date objects
             const dobDate = new Date(date_of_birth);
             if (!isNaN(dobDate.getTime())) {
                const diffMs = Date.now() - dobDate.getTime();
                const ageDate = new Date(diffMs);
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
                
                // standardizing date format to store
                date_of_birth = dobDate.toISOString().split('T')[0];
             }
          } catch(e) {
             console.error("error parsing age", e);
          }
        }

        const height = parseFloat(getVal(9)) || 0;
        const weight = parseFloat(getVal(10)) || 0;
        const blood_type = getVal(11) || '';
        const dominant_hand = getVal(12) || 'Kanan';
        const arm_circumference = parseFloat(getVal(13)) || 0;
        const arm_circumference_category = getVal(14) || '';
        const arm_circumference_range_bb = getVal(15) || '';
        const target_weight = parseFloat(getVal(16)) || 0;
        const target_body_fat = parseFloat(getVal(17)) || 0;
        const bf_in_body = parseFloat(getVal(18)) || 0;
        const bicep = parseFloat(getVal(19)) || 0;
        const tricep = parseFloat(getVal(20)) || 0;
        const subscapula = parseFloat(getVal(21)) || 0;
        const abdominal = parseFloat(getVal(22)) || 0;

        const total = bicep + tricep + subscapula + abdominal;
        
        // Use standard table if total >= 15, fallback to generic multiplier formula otherwise
        const mappedGenderName = genderDbVal === 'P' ? 'Perempuan' : 'Laki-laki';
        let bf_caliper = getBFFromTable(total, mappedGenderName);
        if (bf_caliper === null) bf_caliper = Number(((total * 0.25) + 2).toFixed(1));

        const fm = Number((weight * (bf_caliper / 100)).toFixed(2));
        const lbm = Number((weight - fm).toFixed(2));

        // Remove tempId math.random generation which causes Postgres UUID casting errors
        // Instead, just don't inject "id" to athletesToInsert, Supabase will generate a valid UUID.

        athletesToInsert.push({
          // Notice: 'id' property is removed
          name: String(name),
          category_id: category.id,
          status: String(status) as any,
          weight,
          target_weight,
          image_url: `https://picsum.photos/seed/${name}/200/200`,
          place_of_birth: String(place_of_birth),
          date_of_birth: String(date_of_birth),
          age,
          gender: genderDbVal as any,
          height,
          arm_circumference,
          arm_circumference_category: String(arm_circumference_category),
          arm_circumference_range_bb: String(arm_circumference_range_bb),
          target_body_fat,
          whatsapp: String(whatsapp),
          blood_type: String(blood_type),
          dominant_hand: String(dominant_hand) as any,
          bf_in_body
        });

        assessmentsToInsert.push({
          // temporary null will be replaced with realId during loop
          athlete_id: null,
          date: new Date().toISOString().split('T')[0],
          bf_in_body,
          bicep,
          tricep,
          subscapula,
          abdominal,
          total,
          bf_caliper,
          weight,
          lbm,
          fm
        });
      });

      // Batch insert into Supabase
      for (let i = 0; i < athletesToInsert.length; i++) {
        const { data: athleteData, error: athleteError } = await supabase
          .from('athletes')
          .insert([athletesToInsert[i]])
          .select();
        
        if (athleteError) throw athleteError;

        const realId = athleteData[0].id;
        const assessment = assessmentsToInsert[i];
        assessment.athlete_id = realId;

        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert([assessment]);
        
        if (assessmentError) throw assessmentError;
      }

      showNotification('Berhasil', 'Data atlet berhasil diimpor!');
      fetchAthletes();
    } catch (error) {
      console.error('Error importing athletes:', error);
      showNotification('Gagal', 'Gagal mengimpor data atlet.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col overflow-hidden custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Direktori Atlet</h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 md:w-64 focus-within:border-brand-red/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 flex-1 md:flex-none justify-center">
              <button 
                onClick={handleDownloadTemplate}
                title="Download Template CSV"
                className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-600 flex-1 md:flex-none flex justify-center"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Import CSV"
                className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-600 flex-1 md:flex-none flex justify-center"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button 
                onClick={handleExport}
                title="Export CSV"
                className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-600 flex-1 md:flex-none flex justify-center"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 flex-1 md:flex-none justify-center">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all flex-1 md:flex-none flex justify-center", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all flex-1 md:flex-none flex justify-center", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/20 flex-1 md:flex-none"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden md:inline">Tambah Atlet</span>
              <span className="md:hidden">Tambah</span>
            </button>
            <input 
              type="file" 
              accept=".xlsx" 
              ref={fileInputRef} 
              onChange={handleImport} 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 md:space-y-6">
        {/* Advanced Filtering System */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Kategori</h2>
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="text-[10px] font-black text-brand-red hover:text-rose-700 uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Kelola Kategori
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Filter berdasarkan Kategori</label>
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{selectedCategory === 'All' ? 'Semua' : selectedCategory}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                    selectedCategory === cat 
                      ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {cat === 'All' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Athlete Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={cn(
              "grid gap-4 md:gap-6 pb-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredAthletes.map(athlete => (
              <AthleteCard 
                key={athlete.id} 
                athlete={athlete} 
                viewMode={viewMode} 
                onClick={() => onSelectAthlete(athlete.id)} 
                onDelete={(e) => handleDeleteAthlete(athlete.id, athlete.name, e)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddAthleteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddAthlete}
        categories={categories}
      />
      <ManageCategoriesModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)}
        categories={categories}
        setCategories={setCategories}
        refreshCategories={refreshCategories}
        deleteCategory={deleteCategory}
        fetchAthletes={fetchAthletes}
        setConfirmConfig={setConfirmConfig}
        setNotification={setNotification}
      />

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

      {/* Success Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200]"
          >
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <div className="text-sm font-black uppercase tracking-tight">{notification.title}</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{notification.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Removed local bodyFatChart definitions and logic, now using centralized getBFFromTable from ../lib/bodyFat

interface AthleteCardProps {
  athlete: Athlete;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onDelete: (e: any) => void;
  key?: string | number;
}

function AthleteCard({ athlete, viewMode, onClick, onDelete }: AthleteCardProps) {
  const lastAssessment = athlete.assessment_history?.[0];
  const lastUpdateDate = lastAssessment?.date || 'N/A';
  
  // Calculate progress percentages (closeness to target)
  const calculateCloseness = (current: number, target: number) => {
    if (!target || target === 0) return 100;
    if (current === target) return 100;
    const diff = Math.abs(current - target);
    // Simple heuristic: if diff is 0, 100%. If diff is 10% of target, it's significantly off.
    const maxDev = target * 0.1; 
    const percentage = Math.max(0, 100 - (diff / maxDev) * 100);
    return Math.round(percentage);
  };

  const weightProgress = calculateCloseness(athlete.weight || 0, athlete.target_weight);
  const currentBF = (athlete.bf_caliper && athlete.bf_caliper > 0) ? athlete.bf_caliper : (athlete.bf_in_body || 0);
  const bfProgress = calculateCloseness(currentBF, athlete.target_body_fat);
  const totalProgress = Math.round((weightProgress + bfProgress) / 2);

  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="group relative bg-white border border-slate-200 hover:border-brand-red/30 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={athlete.image_url} alt={athlete.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
              athlete.status === 'AKTIF' ? "bg-green-500" : "bg-slate-400"
            )}></div>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-sm group-hover:text-brand-red transition-colors">{athlete.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">BB: {athlete.weight}kg</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BF (K): {athlete.bf_caliper || 0}%</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">IB: {athlete.bf_in_body || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end w-24">
            <div className="flex justify-between w-full mb-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-[8px] font-black text-brand-red uppercase tracking-widest">{totalProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-red transition-all duration-1000" 
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onDelete}
              className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-white hover:bg-rose-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="group relative"
    >
      <div className={cn(
        "absolute -inset-0.5 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500",
        athlete.status === 'AKTIF' ? "bg-green-500" : "bg-slate-400"
      )}></div>
      
      <div className="relative bg-white border border-slate-200 group-hover:border-brand-red/20 rounded-[2rem] p-5 cursor-pointer transition-all shadow-sm group-hover:shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10 space-y-6">
          {/* Header: Profile & Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "absolute -inset-1 rounded-2xl blur-sm opacity-0 group-hover:opacity-40 transition-opacity",
                  athlete.status === 'AKTIF' ? "bg-green-500" : "bg-slate-400"
                )}></div>
                <img 
                  src={athlete.image_url} 
                  alt={athlete.name} 
                  loading="lazy"
                  className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500" 
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                  athlete.status === 'AKTIF' ? "bg-green-500" : "bg-slate-400"
                )}></div>
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-lg group-hover:text-brand-red transition-colors leading-tight tracking-tight">
                  {athlete.name}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={onDelete}
                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-white hover:bg-rose-500 transition-all shadow-sm hover:shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all shadow-sm group-hover:shadow-brand-red/20">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white shadow-sm">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Berat Badan</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900">{athlete.weight}</span>
                <span className="text-[10px] font-bold text-slate-400">kg</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Target: {athlete.target_weight}kg</span>
                  <span className="text-brand-red">{weightProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-red transition-all duration-1000" 
                    style={{ width: `${weightProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Body Fat (K)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-brand-red">{athlete.bf_caliper || 0}</span>
                <span className="text-[10px] font-bold text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">InBody</span>
                <span className="text-[10px] font-black text-blue-600">{athlete.bf_in_body || 0}%</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Target: {athlete.target_body_fat}%</span>
                  <span className="text-emerald-600">{bfProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${bfProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Assessment History */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Asesmen: <span className="text-slate-900">{lastAssessment?.total || 'N/A'}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Update: <span className="text-slate-900">
                  {lastAssessment ? formatDistanceToNow(new Date(lastAssessment.date), { addSuffix: true, locale: id }).toUpperCase() : 'N/A'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddAthleteModal({ isOpen, onClose, onAdd, categories }: { isOpen: boolean, onClose: () => void, onAdd: (a: Athlete, ass: AssessmentEntry) => void, categories: Category[] }) {
  const initialFormState = {
    name: '',
    category_id: categories[0]?.id || '',
    status: 'AKTIF' as any,
    whatsapp: '+62',
    place_of_birth: '',
    date_of_birth: '',
    age: 0,
    height: 0,
    weight: 0,
    blood_type: '',
    dominant_hand: 'Kanan' as any,
    arm_circumference: 0,
    arm_circumference_category: '',
    arm_circumference_range_bb: '',
    target_weight: 0,
    target_body_fat: 0,
    bf_in_body: 0,
    bicep: 0,
    tricep: 0,
    subscapula: 0,
    abdominal: 0,
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Calculate initial assessment values
    const total = formData.bicep + formData.tricep + formData.subscapula + formData.abdominal;
    
    // Body fat calculation based on gender
    let bf_caliper = 0;
    if (total >= 15) {
      const bf = getBFFromTable(total, formData.gender);
      bf_caliper = bf !== null ? bf : Number(((total * 0.25) + 2).toFixed(1));
    } else {
      bf_caliper = Number(((total * 0.25) + 2).toFixed(1));
    }

    const fm = Number((formData.weight * (bf_caliper / 100)).toFixed(2));
    const lbm = Number((formData.weight - fm).toFixed(2));

    const initialAssessment: AssessmentEntry = {
      date: new Date().toISOString().split('T')[0],
      bf_in_body: formData.bf_in_body,
      bicep: formData.bicep,
      tricep: formData.tricep,
      subscapula: formData.subscapula,
      abdominal: formData.abdominal,
      total,
      bf_caliper,
      weight: formData.weight,
      lbm,
      fm
    };

    const handleFinalSubmit = async (finalImageUrl: string) => {
      const newAthlete: Athlete = {
        id: '', // Generated by DB
        name: formData.name,
        category_id: formData.category_id,
        status: formData.status,
        whatsapp: formData.whatsapp,
        place_of_birth: formData.place_of_birth,
        date_of_birth: formData.date_of_birth,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        blood_type: formData.blood_type,
        dominant_hand: formData.dominant_hand,
        arm_circumference: formData.arm_circumference,
        arm_circumference_category: formData.arm_circumference_category,
        arm_circumference_range_bb: formData.arm_circumference_range_bb,
        target_weight: formData.target_weight,
        target_body_fat: formData.target_body_fat,
        image_url: finalImageUrl
      };
      onAdd(newAthlete, initialAssessment);
    };

    if (imageFile) {
      uploadAthleteImage(imageFile, `new-${Date.now()}`).then(url => {
        handleFinalSubmit(url || `https://picsum.photos/seed/${formData.name}/200/200`);
      });
    } else {
      handleFinalSubmit(`https://picsum.photos/seed/${formData.name}/200/200`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Atlet Baru</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftarkan atlet profesional baru</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Info Dasar */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Dasar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                  placeholder="Nama Lengkap Atlet" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                <select 
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NON AKTIF">NON AKTIF</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="+62..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
                <select 
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Fisik & Pribadi */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Informasi Fisik & Pribadi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                <input 
                  type="text" 
                  value={formData.place_of_birth}
                  onChange={e => setFormData({...formData, place_of_birth: e.target.value})}
                  placeholder="Contoh: Jakarta" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                <input 
                  type="date" 
                  value={formData.date_of_birth}
                  onChange={e => {
                    const dob = e.target.value;
                    const date = new Date(dob);
                    let age = formData.age;
                    if (!isNaN(date.getTime())) {
                      age = differenceInYears(new Date(), date);
                    }
                    setFormData({...formData, date_of_birth: dob, age});
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Umur</label>
                <input 
                  type="number" 
                  value={formData.age || ''}
                  onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                  placeholder="16" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tinggi Badan (cm)</label>
                <input 
                  type="number" 
                  value={formData.height || ''}
                  onChange={e => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                  placeholder="168" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Golongan Darah</label>
                <input 
                  type="text"
                  value={formData.blood_type}
                  onChange={e => setFormData({...formData, blood_type: e.target.value})}
                  placeholder="Contoh: O"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tangan Dominan</label>
                <select 
                  value={formData.dominant_hand}
                  onChange={e => setFormData({...formData, dominant_hand: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  <option value="Kanan">Kanan</option>
                  <option value="Kidal">Kidal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Antropometri & Target */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Antropometri & Target</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Lingkar Lengan (cm)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.arm_circumference || ''}
                  onChange={e => setFormData({...formData, arm_circumference: parseFloat(e.target.value) || 0})}
                  placeholder="32.5" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori Lengan</label>
                <input 
                  type="text" 
                  value={formData.arm_circumference_category}
                  onChange={e => setFormData({...formData, arm_circumference_category: e.target.value})}
                  placeholder="BESAR" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Range BB Ideal</label>
                <input 
                  type="text" 
                  value={formData.arm_circumference_range_bb}
                  onChange={e => setFormData({...formData, arm_circumference_range_bb: e.target.value})}
                  placeholder="64-73" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Berat Badan (kg)</label>
                <input 
                  type="number" 
                  step="any" 
                  value={formData.target_weight || ''}
                  onChange={e => setFormData({...formData, target_weight: parseFloat(e.target.value) || 0})}
                  placeholder="72" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Body Fat (%)</label>
                <input 
                  type="number" 
                  step="any" 
                  value={formData.target_body_fat || ''}
                  onChange={e => setFormData({...formData, target_body_fat: parseFloat(e.target.value) || 0})}
                  placeholder="11" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Foto Profil</h4>
            <div className="space-y-1.5">
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              />
            </div>
          </div>

          {/* Asesmen Awal */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Asesmen Awal</h4>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Berat Badan (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.weight || ''}
                  onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                  placeholder="77.1" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">BF% In Body</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.bf_in_body || ''}
                  onChange={e => setFormData({...formData, bf_in_body: parseFloat(e.target.value) || 0})}
                  placeholder="20.4" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Bisep (B)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.bicep || ''}
                  onChange={e => setFormData({...formData, bicep: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Trisep (T)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.tricep || ''}
                  onChange={e => setFormData({...formData, tricep: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subskapula (SC)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.subscapula || ''}
                  onChange={e => setFormData({...formData, subscapula: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Abdominal (A)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.abdominal || ''}
                  onChange={e => setFormData({...formData, abdominal: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 mt-8 pb-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
              Batal
            </button>
            <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Tambah Atlet
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ManageCategoriesModal({ 
  isOpen, 
  onClose, 
  categories, 
  setCategories,
  refreshCategories,
  deleteCategory,
  fetchAthletes,
  setConfirmConfig,
  setNotification
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  categories: Category[], 
  setCategories: (c: Category[]) => void,
  refreshCategories: () => Promise<void>,
  deleteCategory: (id: string) => Promise<void>,
  fetchAthletes: () => Promise<void>,
  setConfirmConfig: Dispatch<SetStateAction<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>>,
  setNotification: Dispatch<SetStateAction<{
    show: boolean;
    title: string;
    message: string;
  }>>
}) {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!isOpen) return null;

  const showNotification = (title: string, message: string) => {
    setNotification({ show: true, title, message });
    setTimeout(() => {
      setNotification({ show: false, title: '', message: '' });
    }, 3000);
  };

  const handleAdd = async () => {
    if (newItem.trim()) {
      const { data, error } = await supabase.from('categories').insert([{ name: newItem.trim() }]).select();
      if (error) {
        console.error('Error adding category:', error);
        showNotification('Gagal', 'Gagal menambah kategori.');
      } else {
        setNewItem('');
        refreshCategories();
        showNotification('Berhasil', 'Kategori berhasil ditambah.');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${name}"? Tindakan ini dapat mempengaruhi data atlet terkait.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          await fetchAthletes();
          showNotification('Berhasil', 'Kategori berhasil dihapus.');
        } catch (error) {
          console.error('Error deleting category:', error);
          showNotification('Gagal', 'Gagal menghapus kategori.');
        }
      }
    });
  };

  const handleStartEdit = (id: string, value: string) => {
    setEditingId(id);
    setEditingValue(value);
  };

  const handleSaveEdit = async () => {
    if (editingId !== null && editingValue.trim()) {
      // Find current name for confirmation message
      const currentCat = categories.find(c => c.id === editingId);
      if (currentCat && currentCat.name === editingValue.trim()) {
        setEditingId(null);
        return;
      }

      setConfirmConfig({
        isOpen: true,
        title: 'Update Kategori',
        message: `Apakah Anda yakin ingin mengubah nama kategori menjadi "${editingValue.trim()}"?`,
        type: 'warning',
        onConfirm: async () => {
          try {
            const { error } = await supabase.from('categories').update({ name: editingValue.trim() }).eq('id', editingId);
            if (error) throw error;
            setEditingId(null);
            await refreshCategories();
            await fetchAthletes();
            showNotification('Berhasil', 'Kategori berhasil diupdate.');
          } catch (error) {
            console.error('Error updating category:', error);
            showNotification('Gagal', 'Gagal mengupdate kategori.');
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Kategori</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Konfigurasi kategori atlet</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-3 mb-8">
            <input 
              type="text" 
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Tambah kategori baru..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all"
            />
            <button 
              onClick={handleAdd}
              className="bg-slate-900 hover:bg-brand-red text-white px-6 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                {editingId === item.id ? (
                  <input 
                    autoFocus
                    type="text" 
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    className="flex-1 bg-white border border-brand-red rounded-xl px-3 py-1 text-sm font-bold outline-none"
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-700">{item.name}</span>
                )}
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === item.id ? (
                    <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => handleStartEdit(item.id, item.name)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
