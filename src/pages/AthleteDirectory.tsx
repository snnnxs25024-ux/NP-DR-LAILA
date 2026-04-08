import { useState, useEffect, FormEvent } from 'react';
import { Filter, Search, ChevronRight, Activity, Droplets, Scale, UserPlus, Grid, List, X, Plus, Trash2, Edit2, Check, Save } from 'lucide-react';
import { athletes as initialAthletes, Athlete, Division, Sector } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AthleteDirectoryProps {
  onSelectAthlete: (id: string) => void;
}

export function AthleteDirectory({ onSelectAthlete }: AthleteDirectoryProps) {
  const [athletesList, setAthletesList] = useState<Athlete[]>(initialAthletes);
  const [divisions, setDivisions] = useState<string[]>(['U-13', 'U-15', 'U-17', 'U-19', 'Senior']);
  const [sectors, setSectors] = useState<string[]>(["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"]);
  
  const [selectedDivision, setSelectedDivision] = useState<string | 'All'>('All');
  const [selectedSector, setSelectedSector] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Filtered Athletes
  const filteredAthletes = athletesList.filter(a => {
    const matchDiv = selectedDivision === 'All' || a.division === selectedDivision;
    const matchSec = selectedSector === 'All' || a.sector === selectedSector;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiv && matchSec && matchSearch;
  });

  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletesList([...athletesList, newAthlete]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 h-full flex flex-col overflow-hidden custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Athlete Directory</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm font-semibold">Manage and monitor {athletesList.length} professional athletes.</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">PBSI National Training</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-64 focus-within:border-brand-red/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Athlete
          </button>
        </div>
      </div>

      {/* Advanced Filtering System */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filters & Categories</h2>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="text-[10px] font-black text-brand-red hover:text-rose-700 uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Manage Categories
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Division Filter</label>
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{selectedDivision}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...divisions].map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    selectedDivision === div 
                      ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sector Filter</label>
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{selectedSector}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...sectors].map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    selectedSector === sec 
                      ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {sec}
                </button>
              ))}
            </div>
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
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete.id)}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-red/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white border border-slate-200 hover:border-brand-red/30 rounded-3xl p-6 cursor-pointer transition-all shadow-sm group-hover:shadow-md">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={athlete.imageUrl} alt={athlete.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 group-hover:border-brand-red/50 transition-colors" />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                          athlete.status === 'Fit' ? "bg-green-500" : 
                          athlete.status === 'Injured' ? "bg-red-500" : "bg-yellow-500"
                        )}></div>
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold text-lg group-hover:text-brand-red transition-colors leading-tight">{athlete.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{athlete.division}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{athlete.sector}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-brand-red transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <MetricBox icon={Scale} label="Weight" value={`${athlete.weight}kg`} alert={Math.abs(athlete.weight - athlete.targetWeight) > 1.5} />
                    <MetricBox icon={Activity} label="Compliance" value={`${athlete.compliance}%`} color={athlete.compliance > 90 ? 'green' : athlete.compliance > 80 ? 'yellow' : 'red'} />
                    <MetricBox icon={Droplets} label="Hydration" value={`${athlete.hydrationLevel}%`} alert={athlete.hydrationLevel < 90} />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                          {i === 3 ? '+5' : <Utensils className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Check: 4h ago</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddAthleteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddAthlete}
        divisions={divisions}
        sectors={sectors}
      />
      <ManageCategoriesModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)}
        divisions={divisions}
        setDivisions={setDivisions}
        sectors={sectors}
        setSectors={setSectors}
      />
    </div>
  );
}

// --- Sub-components ---

function AddAthleteModal({ isOpen, onClose, onAdd, divisions, sectors }: { isOpen: boolean, onClose: () => void, onAdd: (a: Athlete) => void, divisions: string[], sectors: string[] }) {
  const [formData, setFormData] = useState({
    name: '',
    division: divisions[0],
    sector: sectors[0],
    weight: 70,
    targetWeight: 70,
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    age: 20
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newAthlete: Athlete = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      division: formData.division as any,
      sector: formData.sector as any,
      weight: formData.weight,
      targetWeight: formData.targetWeight,
      status: 'Fit',
      hydrationLevel: 90,
      sleepHours: 8,
      rpe: 5,
      imageUrl: `https://picsum.photos/seed/${formData.name}/200/200`,
      compliance: 100,
      placeOfBirth: 'Jakarta',
      dateOfBirth: '2000-01-01',
      age: formData.age,
      gender: formData.gender,
      height: 175,
      armCircumference: 28,
      category: 'Ideal',
      idealWeightRange: '68-72kg',
      bodyFatCaliper: 10,
      bodyFatInBody: 11,
      targetBodyFat: 10,
      skeletalMuscleMass: 35,
      bmr: 1700,
      exerciseCalories: 1000,
      presentEnergy: 2700,
      dailyCalories: 2700,
      foodAllergies: [],
      foodPreferences: [],
      supplements: [],
      bloodLab: { hb: 15, ferritin: 100, vitD: 40 },
      sweatRate: 1.0,
      whatsapp: '+628000000000',
      email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@pbsi.id`,
      bloodType: 'O',
      dominantHand: 'Kanan',
      joinYear: new Date().getFullYear(),
      apparelSize: { shirt: 'M', shoe: 42 },
      socialMedia: { instagram: '@' + formData.name.toLowerCase().replace(/\s+/g, '') },
      emergencyContact: { name: 'Keluarga', relation: 'Wali', phone: '+628000000001' }
    };
    onAdd(newAthlete);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Athlete</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Register a new professional athlete</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all"
                placeholder="Enter athlete name..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                <select 
                  value={formData.division}
                  onChange={e => setFormData({...formData, division: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all appearance-none"
                >
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector</label>
                <select 
                  value={formData.sector}
                  onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all appearance-none"
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.targetWeight}
                  onChange={e => setFormData({...formData, targetWeight: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-red hover:bg-brand-red-hover text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-red/20 transition-all flex items-center justify-center gap-3">
            <UserPlus className="w-5 h-5" />
            Register Athlete
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ManageCategoriesModal({ isOpen, onClose, divisions, setDivisions, sectors, setSectors }: { isOpen: boolean, onClose: () => void, divisions: string[], setDivisions: (d: string[]) => void, sectors: string[], setSectors: (s: string[]) => void }) {
  const [activeTab, setActiveTab] = useState<'division' | 'sector'>('division');
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!isOpen) return null;

  const items = activeTab === 'division' ? divisions : sectors;
  const setItems = activeTab === 'division' ? setDivisions : setSectors;

  const handleAdd = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleDelete = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleStartEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newItems = [...items];
      newItems[editingIndex] = editingValue.trim();
      setItems(newItems);
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Categories</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure divisions and sectors</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('division')}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'division' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              Divisions
            </button>
            <button 
              onClick={() => setActiveTab('sector')}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'sector' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              Sectors
            </button>
          </div>

          <div className="flex gap-3 mb-8">
            <input 
              type="text" 
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder={`Add new ${activeTab}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all"
            />
            <button 
              onClick={handleAdd}
              className="bg-slate-900 hover:bg-brand-red text-white px-6 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item, idx) => (
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

function MetricBox({ icon: Icon, label, value, alert, color }: { icon: any, label: string, value: string, alert?: boolean, color?: 'red' | 'yellow' | 'green' }) {
  const colorMap = {
    red: 'text-brand-red',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center group/metric hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
      <Icon className={cn("w-4 h-4 mb-1.5 transition-transform group-hover/metric:scale-110", alert ? "text-brand-red" : "text-slate-400")} />
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
      <span className={cn(
        "text-xs font-black tracking-tight",
        alert ? "text-brand-red" : color ? colorMap[color] : "text-slate-900"
      )}>
        {value}
      </span>
    </div>
  );
}

import { Utensils } from 'lucide-react';


