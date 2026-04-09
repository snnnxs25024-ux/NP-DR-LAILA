import { useState, useEffect, FormEvent } from 'react';
import { Filter, Search, ChevronRight, Activity, Droplets, Scale, UserPlus, Grid, List, X, Plus, Trash2, Edit2, Check, Save } from 'lucide-react';
import { athletes as initialAthletes, Athlete, Division, Sector, AssessmentEntry } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AthleteDirectoryProps {
  onSelectAthlete: (id: string) => void;
}

export function AthleteDirectory({ onSelectAthlete }: AthleteDirectoryProps) {
  const [athletesList, setAthletesList] = useState<Athlete[]>(initialAthletes);
  const [categories, setCategories] = useState<string[]>(['U-13', 'U-15', 'U-17', 'U-19', 'Senior', "Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

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
    const matchCat = selectedCategory === 'All' || a.division === selectedCategory || a.sector === selectedCategory;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletesList([...athletesList, newAthlete]);
    initialAthletes.push(newAthlete); // Mutate global mock data
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 h-full flex flex-col overflow-hidden custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Direktori Atlet</h1>
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
          </div>
        </div>
      </div>

      {/* Advanced Filtering System */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
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
          <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
            {['All', ...categories].map(cat => (
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
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={cn(
              "grid gap-6 pb-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredAthletes.map(athlete => (
              <AthleteCard 
                key={athlete.id} 
                athlete={athlete} 
                viewMode={viewMode} 
                onClick={() => onSelectAthlete(athlete.id)} 
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
      />
    </div>
  );
}

// --- Sub-components ---

interface AthleteCardProps {
  athlete: Athlete;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  key?: string | number;
}

function AthleteCard({ athlete, viewMode, onClick }: AthleteCardProps) {
  const isAlert = Math.abs(athlete.weight - athlete.targetWeight) > 1.5;
  
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
            <img src={athlete.imageUrl} alt={athlete.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
              athlete.status === 'Fit' ? "bg-green-500" : athlete.status === 'Cedera' ? "bg-red-500" : "bg-yellow-500"
            )}></div>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-sm group-hover:text-brand-red transition-colors">{athlete.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">Target: {athlete.targetWeight}kg</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                athlete.weight > athlete.targetWeight ? "text-orange-600" : "text-emerald-600"
              )}>
                {athlete.weight > athlete.targetWeight 
                  ? `Sisa ${(athlete.weight - athlete.targetWeight).toFixed(1)}kg` 
                  : "Target Tercapai"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Berat Badan</span>
            <span className={cn("text-xs font-black", isAlert ? "text-brand-red" : "text-slate-900")}>{athlete.weight} kg</span>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kepatuhan</span>
            <span className="text-xs font-black text-emerald-600">{athlete.compliance}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all">
            <ChevronRight className="w-4 h-4" />
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
      {/* Glow Effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-[2.5rem] blur opacity-0 group-hover:opacity-20 transition duration-500",
        athlete.status === 'Fit' ? "bg-green-500" : athlete.status === 'Cedera' ? "bg-brand-red" : "bg-yellow-500"
      )}></div>
      
      <div className="relative bg-white border border-slate-200 group-hover:border-brand-red/20 rounded-[2.5rem] p-6 cursor-pointer transition-all shadow-sm group-hover:shadow-xl overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "absolute -inset-1 rounded-2xl blur-sm opacity-0 group-hover:opacity-40 transition-opacity",
                  athlete.status === 'Fit' ? "bg-green-500" : athlete.status === 'Cedera' ? "bg-brand-red" : "bg-yellow-500"
                )}></div>
                <img 
                  src={athlete.imageUrl} 
                  alt={athlete.name} 
                  className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500" 
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                  athlete.status === 'Fit' ? "bg-green-500" : athlete.status === 'Cedera' ? "bg-red-500" : "bg-yellow-500"
                )}></div>
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-xl group-hover:text-brand-red transition-colors leading-tight tracking-tight">
                  {athlete.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target:</span>
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{athlete.targetWeight}kg</span>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg border uppercase tracking-widest text-[9px] font-black",
                    athlete.weight > athlete.targetWeight 
                      ? "bg-rose-50 text-brand-red border-rose-100/50" 
                      : "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                  )}>
                    {athlete.weight > athlete.targetWeight 
                      ? `Sisa ${(athlete.weight - athlete.targetWeight).toFixed(1)}kg` 
                      : "Tercapai"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="p-2 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all shadow-sm group-hover:shadow-brand-red/20">
                <ChevronRight className="w-5 h-5" />
              </div>
              {/* Compliance Ring - Repositioned and Styled */}
              <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-slate-100"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className={cn(
                      athlete.compliance > 90 ? "stroke-emerald-500" : "stroke-yellow-500"
                    )}
                    strokeWidth="3.5"
                    strokeDasharray={`${athlete.compliance}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-black text-slate-900">{athlete.compliance}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center group/metric hover:bg-white hover:border-brand-red/20 hover:shadow-sm transition-all">
              <Scale className={cn("w-4 h-4 mb-1.5 transition-transform group-hover/metric:scale-110", isAlert ? "text-brand-red" : "text-slate-400")} />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Berat</span>
              <span className={cn("text-xs font-black tracking-tight", isAlert ? "text-brand-red" : "text-slate-900")}>
                {athlete.weight}kg
              </span>
            </div>
            
            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center group/metric hover:bg-white hover:border-blue-500/20 hover:shadow-sm transition-all">
              <Ruler className="w-4 h-4 mb-1.5 text-slate-400 group-hover/metric:text-blue-500 transition-colors" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tinggi</span>
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {athlete.height}cm
              </span>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center group/metric hover:bg-white hover:border-emerald-500/20 hover:shadow-sm transition-all">
              <Activity className="w-4 h-4 mb-1.5 text-slate-400 group-hover/metric:text-emerald-500 transition-colors" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lengan</span>
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {athlete.armCircumference}cm
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Asesmen: <span className="text-slate-900">{athlete.assessmentHistory[0]?.date || 'N/A'}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Update: 4j lalu</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddAthleteModal({ isOpen, onClose, onAdd, categories }: { isOpen: boolean, onClose: () => void, onAdd: (a: Athlete) => void, categories: string[] }) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0],
    status: 'Fit' as any,
    whatsapp: '+62',
    placeOfBirth: '',
    dateOfBirth: '',
    age: 16,
    height: 168,
    weight: 77.1,
    bloodType: 'O',
    dominantHand: 'Kanan' as any,
    armCircumference: 32.5,
    armCircumferenceCategory: 'BESAR',
    armCircumferenceRangeBB: '64-73',
    targetWeight: 72,
    targetBodyFat: 11,
    bfInBody: 20.4,
    bicep: 3,
    tricep: 5,
    subscapula: 14,
    abdominal: 15
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Calculate initial assessment values
    const total = formData.bicep + formData.tricep + formData.subscapula + formData.abdominal;
    const bfCaliper = Number((total * 0.4).toFixed(1)); // Mock formula
    const fm = Number((formData.weight * (bfCaliper / 100)).toFixed(2));
    const lbm = Number((formData.weight - fm).toFixed(2));

    const initialAssessment: AssessmentEntry = {
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
      bfInBody: formData.bfInBody,
      bicep: formData.bicep,
      tricep: formData.tricep,
      subscapula: formData.subscapula,
      abdominal: formData.abdominal,
      total,
      bfCaliper,
      weight: formData.weight,
      lbm,
      fm
    };

    const newAthlete: Athlete = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      division: formData.category as any,
      sector: '' as any,
      status: formData.status,
      weight: formData.weight,
      targetWeight: formData.targetWeight,
      hydrationLevel: 95,
      sleepHours: 8,
      rpe: 5,
      imageUrl: `https://picsum.photos/seed/${formData.name}/200/200`,
      compliance: 100,
      placeOfBirth: formData.placeOfBirth,
      dateOfBirth: formData.dateOfBirth,
      age: formData.age,
      gender: 'Laki-laki',
      height: formData.height,
      armCircumference: formData.armCircumference,
      armCircumferenceCategory: formData.armCircumferenceCategory,
      armCircumferenceRangeBB: formData.armCircumferenceRangeBB,
      bodyFatCaliper: bfCaliper,
      bodyFatInBody: formData.bfInBody,
      targetBodyFat: formData.targetBodyFat,
      skeletalMuscleMass: lbm,
      bmr: 1700,
      exerciseCalories: 1447,
      presentEnergy: 4230,
      dailyCalories: 3500,
      foodAllergies: [],
      foodPreferences: [],
      supplements: [],
      bloodLab: { hb: 15, ferritin: 100, vitD: 40 },
      sweatRate: 1.0,
      whatsapp: formData.whatsapp,
      email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@pbsi.id`,
      bloodType: formData.bloodType,
      dominantHand: formData.dominantHand,
      joinYear: new Date().getFullYear(),
      apparelSize: { shirt: 'M', shoe: 42 },
      socialMedia: { instagram: '@' + formData.name.toLowerCase().replace(/\s+/g, '') },
      emergencyContact: { name: 'Keluarga', relation: 'Wali', phone: '+628000000001' },
      assessmentHistory: [initialAssessment],
      notes: [],
      injuries: []
    };
    onAdd(newAthlete);
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  <option value="Fit">Fit</option>
                  <option value="Cedera">Cedera</option>
                  <option value="Recovery">Pemulihan</option>
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
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
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
                  value={formData.placeOfBirth}
                  onChange={e => setFormData({...formData, placeOfBirth: e.target.value})}
                  placeholder="Contoh: Jakarta" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                <input 
                  type="text" 
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  placeholder="Contoh: 12 Agustus 2009" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Umur</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                  placeholder="16" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tinggi Badan (cm)</label>
                <input 
                  type="number" 
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: parseInt(e.target.value)})}
                  placeholder="168" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Golongan Darah</label>
                <select 
                  value={formData.bloodType}
                  onChange={e => setFormData({...formData, bloodType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tangan Dominan</label>
                <select 
                  value={formData.dominantHand}
                  onChange={e => setFormData({...formData, dominantHand: e.target.value as any})}
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
                  value={formData.armCircumference}
                  onChange={e => setFormData({...formData, armCircumference: parseFloat(e.target.value)})}
                  placeholder="32.5" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori Lengan</label>
                <input 
                  type="text" 
                  value={formData.armCircumferenceCategory}
                  onChange={e => setFormData({...formData, armCircumferenceCategory: e.target.value})}
                  placeholder="BESAR" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Range BB Ideal</label>
                <input 
                  type="text" 
                  value={formData.armCircumferenceRangeBB}
                  onChange={e => setFormData({...formData, armCircumferenceRangeBB: e.target.value})}
                  placeholder="64-73" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Berat Badan (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.targetWeight}
                  onChange={e => setFormData({...formData, targetWeight: parseFloat(e.target.value)})}
                  placeholder="72" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Body Fat (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.targetBodyFat}
                  onChange={e => setFormData({...formData, targetBodyFat: parseFloat(e.target.value)})}
                  placeholder="11" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
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
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                  placeholder="77.1" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">BF% In Body</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.bfInBody}
                  onChange={e => setFormData({...formData, bfInBody: parseFloat(e.target.value)})}
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
                  value={formData.bicep}
                  onChange={e => setFormData({...formData, bicep: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Trisep (T)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.tricep}
                  onChange={e => setFormData({...formData, tricep: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subskapula (SC)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.subscapula}
                  onChange={e => setFormData({...formData, subscapula: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Abdominal (A)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.abdominal}
                  onChange={e => setFormData({...formData, abdominal: parseFloat(e.target.value)})}
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

function ManageCategoriesModal({ isOpen, onClose, categories, setCategories }: { isOpen: boolean, onClose: () => void, categories: string[], setCategories: (c: string[]) => void }) {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newItem.trim()) {
      setCategories([...categories, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleDelete = (index: number) => {
    const newItems = [...categories];
    newItems.splice(index, 1);
    setCategories(newItems);
  };

  const handleStartEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newItems = [...categories];
      newItems[editingIndex] = editingValue.trim();
      setCategories(newItems);
      setEditingIndex(null);
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
            {categories.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                {editingIndex === idx ? (
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
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                )}
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingIndex === idx ? (
                    <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => handleStartEdit(idx, item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(idx)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-rose-50 rounded-lg transition-colors">
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

import { Utensils, Ruler } from 'lucide-react';


