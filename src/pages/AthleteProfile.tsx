import React, { useState } from 'react';
import { ArrowLeft, Calendar, Activity, Scale, Droplets, Moon, HeartPulse, Utensils, Stethoscope, ChevronRight, Share2, Download, Printer, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownRight, X, Plus, User, MapPin, Ruler, Percent, Flame, Zap, Apple, Syringe, MessageCircle, Mail, Instagram, Droplet, Hand, CalendarDays, Shirt, PhoneCall, Info, Edit2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { athletes, weightHistory, nutritionBalance } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { downloadCSV, triggerPrint } from '../lib/exportUtils';

interface AthleteProfileProps {
  athleteId: string;
  onBack: () => void;
}

export function AthleteProfile({ athleteId, onBack }: AthleteProfileProps) {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const athleteData = athletes.find(a => a.id === athleteId);
  
  // Local state for the athlete's current data to allow real-time updates
  const [athlete, setAthlete] = useState(athleteData);
  const [nutrition, setNutrition] = useState(nutritionBalance);

  if (!athlete) return <div>Athlete not found</div>;

  // Mock data for "Kemarin"
  const yesterdayData = {
    weight: (athlete.weight - 0.4).toFixed(1),
    hydration: athlete.hydrationLevel + 2,
    sleep: athlete.sleepHours - 1.5,
    rpe: athlete.rpe + 1
  };

  const handleUpdateData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Update Biometrics
    const updatedAthlete = {
      ...athlete,
      weight: Number(formData.get('weight')),
      hydrationLevel: Number(formData.get('hydration')),
      sleepHours: Number(formData.get('sleep')),
      rpe: Number(formData.get('rpe')),
    };
    
    // Update Nutrition Chart Data
    const updatedNutrition = nutrition.map(item => {
      const newValue = Number(formData.get(`nutri_${item.subject.toLowerCase()}`));
      return { ...item, A: newValue };
    });

    setAthlete(updatedAthlete);
    setNutrition(updatedNutrition);
    setIsInputModalOpen(false);
  };

  const handleExport = () => {
    const exportData = [{
      Name: athlete.name,
      Division: athlete.division,
      Sector: athlete.sector,
      Status: athlete.status,
      Weight: athlete.weight,
      TargetWeight: athlete.targetWeight,
      Hydration: athlete.hydrationLevel,
      Sleep: athlete.sleepHours,
      RPE: athlete.rpe,
      Compliance: athlete.compliance,
      LastCheck: '4h ago'
    }];
    downloadCSV(exportData, `Athlete_Report_${athlete.name.replace(/\s+/g, '_')}`);
  };

  const handleEditProfileSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedAthlete = {
      ...athlete,
      name: formData.get('name') as string,
      division: formData.get('division') as any,
      sector: formData.get('sector') as any,
      status: formData.get('status') as any,
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      bloodType: formData.get('bloodType') as string,
      dominantHand: formData.get('dominantHand') as any,
      placeOfBirth: formData.get('placeOfBirth') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      joinYear: Number(formData.get('joinYear')),
      apparelSize: {
        shirt: formData.get('shirtSize') as string,
        shoe: Number(formData.get('shoeSize')),
      },
      socialMedia: {
        instagram: formData.get('instagram') as string,
      },
      emergencyContact: {
        name: formData.get('emergencyName') as string,
        relation: formData.get('emergencyRelation') as string,
        phone: formData.get('emergencyPhone') as string,
      }
    };

    // Update local state
    setAthlete(updatedAthlete);
    
    // Mutate global mock data so it persists across views
    const index = athletes.findIndex(a => a.id === athlete.id);
    if (index !== -1) {
      athletes[index] = updatedAthlete;
    }

    setIsEditProfileModalOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar print-container relative"
    >
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Input data for {athlete.name}</p>
              </div>
              <button onClick={() => setIsInputModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateData} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Date & Time Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal Asesmen</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                    <input 
                      name="logDate" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Time</label>
                    <input 
                      name="logTime" 
                      type="time" 
                      defaultValue={new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Biometrics Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Biometrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                    <input name="weight" type="number" step="0.1" defaultValue={athlete.weight} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Hydration (%)</label>
                    <input name="hydration" type="number" defaultValue={athlete.hydrationLevel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sleep (hours)</label>
                    <input name="sleep" type="number" step="0.5" defaultValue={athlete.sleepHours} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Exertion (RPE 1-10)</label>
                    <input name="rpe" type="number" min="1" max="10" defaultValue={athlete.rpe} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Nutrition Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Nutrition Balance (0-150)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {nutrition.map(item => (
                    <div key={item.subject} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{item.subject}</label>
                      <input name={`nutri_${item.subject.toLowerCase()}`} type="number" defaultValue={item.A} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsInputModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update data for {athlete.name}</p>
              </div>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleEditProfileSave} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input name="name" type="text" defaultValue={athlete.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                      <select name="status" defaultValue={athlete.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="Fit">Fit</option>
                        <option value="Injured">Injured</option>
                        <option value="Recovery">Recovery</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Division</label>
                      <select name="division" defaultValue={athlete.division} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="U-13">U-13</option>
                        <option value="U-15">U-15</option>
                        <option value="U-17">U-17</option>
                        <option value="U-19">U-19</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Sector</label>
                      <select name="sector" defaultValue={athlete.sector} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="Men's Singles">Men's Singles</option>
                        <option value="Women's Singles">Women's Singles</option>
                        <option value="Men's Doubles">Men's Doubles</option>
                        <option value="Women's Doubles">Women's Doubles</option>
                        <option value="Mixed Doubles">Mixed Doubles</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Contact & Social</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp</label>
                      <input name="whatsapp" type="text" defaultValue={athlete.whatsapp} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                      <input name="email" type="email" defaultValue={athlete.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Instagram</label>
                      <input name="instagram" type="text" defaultValue={athlete.socialMedia.instagram} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Physical & Medical */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Physical & Medical</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Type</label>
                      <select name="bloodType" defaultValue={athlete.bloodType} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Dominant Hand</label>
                      <select name="dominantHand" defaultValue={athlete.dominantHand} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all">
                        <option value="Kanan">Kanan</option>
                        <option value="Kidal">Kidal</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Place of Birth</label>
                      <input name="placeOfBirth" type="text" defaultValue={athlete.placeOfBirth} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
                      <input name="dateOfBirth" type="text" defaultValue={athlete.dateOfBirth} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Logistics & Emergency */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Logistics & Emergency</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Join Year</label>
                      <input name="joinYear" type="number" defaultValue={athlete.joinYear} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Shirt Size</label>
                      <input name="shirtSize" type="text" defaultValue={athlete.apparelSize.shirt} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Shoe Size</label>
                      <input name="shoeSize" type="number" defaultValue={athlete.apparelSize.shoe} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Name</label>
                      <input name="emergencyName" type="text" defaultValue={athlete.emergencyContact.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Relation</label>
                      <input name="emergencyRelation" type="text" defaultValue={athlete.emergencyContact.relation} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Phone</label>
                      <input name="emergencyPhone" type="text" defaultValue={athlete.emergencyContact.phone} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 mt-8 pb-2">
                <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20">
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all border border-slate-200 shadow-sm no-print"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={athlete.imageUrl} alt={athlete.name} className="w-20 h-20 rounded-3xl border-2 border-slate-100 object-cover shadow-lg" />
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white",
                athlete.status === 'Fit' ? "bg-green-500" : 
                athlete.status === 'Injured' ? "bg-red-500" : "bg-yellow-500"
              )}></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{athlete.name}</h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  athlete.status === 'Fit' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                  athlete.status === 'Injured' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                )}>
                  {athlete.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{athlete.division} Division</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{athlete.sector}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">PBSI National Training</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={() => setIsEditProfileModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
          <button 
            onClick={() => setIsInputModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-lg shadow-slate-900/20"
          >
            <Plus className="w-4 h-4" />
            Input Asesmen Berkala
          </button>
          <button 
            onClick={triggerPrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition-all shadow-lg shadow-brand-red/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Biodata & Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-grid-cols-1">
        {/* Contact & Social */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <User className="w-4 h-4 text-brand-red" />
            Contact & Social
          </h3>
          <div className="space-y-3">
            <a href={`https://wa.me/${athlete.whatsapp.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-600 transition-colors border border-slate-100 hover:border-green-200 group">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</div>
                <div className="text-xs font-black">{athlete.whatsapp}</div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href={`mailto:${athlete.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-100 hover:border-blue-200 group">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Email</div>
                <div className="text-xs font-black">{athlete.email}</div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href={`https://instagram.com/${athlete.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 transition-colors border border-slate-100 hover:border-pink-200 group">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                <Instagram className="w-4 h-4 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Instagram</div>
                <div className="text-xs font-black">{athlete.socialMedia.instagram}</div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Physical & Medical */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Physical & Medical
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Type</span>
              </div>
              <div className="text-sm font-black text-slate-900">{athlete.bloodType}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Hand className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dominant Hand</span>
              </div>
              <div className="text-sm font-black text-slate-900">{athlete.dominantHand}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Birthplace</span>
              </div>
              <div className="text-sm font-black text-slate-900">{athlete.placeOfBirth}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</span>
              </div>
              <div className="text-sm font-black text-slate-900">{athlete.dateOfBirth}</div>
            </div>
          </div>
        </div>

        {/* Logistics & Emergency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Shirt className="w-4 h-4 text-purple-500" />
            Logistics & Emergency
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Apparel Size</div>
                  <div className="text-xs font-black text-slate-900">Shirt: {athlete.apparelSize.shirt} • Shoe: {athlete.apparelSize.shoe}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Join Year</div>
                  <div className="text-xs font-black text-slate-900">{athlete.joinYear} (Pelatnas)</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-red-400 uppercase">Emergency Contact</div>
                  <div className="text-xs font-black text-red-900">{athlete.emergencyContact.name} ({athlete.emergencyContact.relation})</div>
                  <div className="text-xs font-bold text-red-700">{athlete.emergencyContact.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Profile Section - NEW LAYOUT */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print-break-inside-avoid overflow-hidden">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Column: Interactive Anatomy */}
          <div className="xl:w-[45%] flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-100 relative p-8 min-h-[600px]">
            <div className="absolute top-6 left-6 flex flex-col z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Anatomical Mapping</span>
              <span className="text-[8px] font-bold text-brand-red uppercase tracking-widest">Interactive Performance Analysis</span>
            </div>
            
            {/* Control Panel (Visual only as per reference) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 no-print">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-red cursor-pointer transition-all hover:scale-110">
                  {i === 1 ? <Activity className="w-4 h-4" /> : i === 2 ? <Ruler className="w-4 h-4" /> : i === 3 ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <BodyVisualization athlete={athlete} />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Biometric Feed</span>
            </div>
          </div>

          {/* Right Column: Data Cards Grid */}
          <div className="xl:w-[55%] space-y-6">
            {/* Health Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Health Overview</h3>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Heart Rate
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-bold text-green-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Blood Pressure
                  </span>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightHistory.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="target" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Tests Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Recent Tests</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-900">Blood Test</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Tomorrow, 10:00 AM</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-[7px] font-black text-white uppercase">Scheduled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-900">ECG Analysis</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Jan 15, 2026</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-500 text-[7px] font-black text-white uppercase">Completed</span>
                  </div>
                </div>
              </div>

              {/* Fitness Rate Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Fitness Rate</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-brand-red" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Heart Rate</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">72 bpm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Blood Pressure</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">120/80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Blood Sugar</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">95 mg/dL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Team Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Medical Support Team</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src="https://picsum.photos/seed/doctor/100/100" alt="Doctor" className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  <div>
                    <div className="text-xs font-black text-slate-900">Dr. Sarah Wilson</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Primary Cardiologist</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-brand-red text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-red-hover transition-all">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-6 bg-brand-red rounded-full"></div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Asesmen Terbaru</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard icon={Scale} label="Weight" value={`${athlete.weight} kg`} subValue={`Target: ${athlete.targetWeight} kg`} alert={Math.abs(athlete.weight - athlete.targetWeight) > 1.5} color="red" />
            <StatCard icon={Droplets} label="Hydration" value={`${athlete.hydrationLevel}%`} subValue="Optimal: >95%" alert={athlete.hydrationLevel < 90} color="blue" />
            <StatCard icon={Moon} label="Sleep Quality" value={`${athlete.sleepHours}h`} subValue="Target: 8.5h" alert={athlete.sleepHours < 7} color="indigo" />
            <StatCard icon={HeartPulse} label="Exertion (RPE)" value={`${athlete.rpe}/10`} subValue="Last Training" alert={athlete.rpe > 8} color="orange" />
          </div>
        </div>

        {/* Yesterday Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-6 bg-slate-300 rounded-full"></div>
            <h2 className="text-xl font-black text-slate-400 tracking-tight uppercase">3 Bulan Lalu</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 grayscale-[0.5]">
            <StatCard icon={Scale} label="Weight" value={`${yesterdayData.weight} kg`} subValue="Data 3 Bulan Lalu" color="red" />
            <StatCard icon={Droplets} label="Hydration" value={`${yesterdayData.hydration}%`} subValue="Data 3 Bulan Lalu" color="blue" />
            <StatCard icon={Moon} label="Sleep Quality" value={`${yesterdayData.sleep}h`} subValue="Data 3 Bulan Lalu" color="indigo" />
            <StatCard icon={HeartPulse} label="Exertion (RPE)" value={`${yesterdayData.rpe}/10`} subValue="Data 3 Bulan Lalu" color="orange" />
          </div>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-grid-cols-1">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print-break-inside-avoid">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-red flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-red" />
              </div>
              Biometric Trends
            </h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-brand-red"></div> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div> Target
              </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#E11D48" strokeWidth={4} dot={{ r: 6, fill: '#E11D48', strokeWidth: 3, stroke: '#ffffff' }} activeDot={{ r: 8, strokeWidth: 4 }} />
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-green flex items-center justify-center">
              <Utensils className="w-5 h-5 text-green-600" />
            </div>
            Nutrition Balance
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nutrition}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontWeight={700} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Intake" dataKey="A" stroke="#E11D48" fill="#E11D48" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Nutrition Intervention Flow Chart */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print-break-inside-avoid">
        <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pastel-indigo flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          Nutrition Intervention Flow
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <FlowNode icon={Activity} label="Monitoring" sub="Quarterly Biometrics" color="blue" />
          <ArrowRight className="hidden md:block w-6 h-6 text-slate-200" />
          <FlowNode icon={AlertTriangle} label="Analysis" sub="Alert Triggered" color="orange" />
          <ArrowRight className="hidden md:block w-6 h-6 text-slate-200" />
          <FlowNode icon={Utensils} label="Intervention" sub="Meal Adjustment" color="red" />
          <ArrowRight className="hidden md:block w-6 h-6 text-slate-200" />
          <FlowNode icon={CheckCircle2} label="Evaluation" sub="Performance Sync" color="green" />
        </div>
      </div>

      {/* Recovery & Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-grid-cols-1">
        {athlete.status !== 'Fit' && (
          <div className="bg-pastel-red/50 border border-brand-red/10 rounded-3xl p-8 relative overflow-hidden print-break-inside-avoid">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Stethoscope className="w-24 h-24 text-brand-red" />
            </div>
            <h2 className="text-xl font-bold text-brand-red mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              Recovery Protocol
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-5 rounded-2xl border border-brand-red/10">
                <div className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Caloric Deficit</div>
                <p className="text-xs text-slate-500 leading-relaxed">Adjusted -350 kcal/day to maintain body composition during inactivity.</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">2,150 <span className="text-[10px] text-slate-400 font-bold uppercase">kcal</span></span>
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-brand-red h-full w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 p-5 rounded-2xl border border-brand-red/10">
                <div className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Supplementation</div>
                <p className="text-xs text-slate-500 leading-relaxed">Focus: Collagen Type I & III, Vitamin C (1000mg), Omega-3.</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn("bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print-break-inside-avoid", athlete.status === 'Fit' ? "lg:col-span-2" : "")}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              Nutrition Logs
            </h2>
            <button className="text-xs font-bold text-brand-red uppercase tracking-widest hover:text-brand-red-hover transition-colors no-print">View All Logs</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-100 group-hover:border-brand-red/50 transition-all">
                  <img src={`https://picsum.photos/seed/meal${i}/400/300`} alt="Meal" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Lunch</span>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Yesterday</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const hotspots = [
    { id: 'head', label: 'Cognitive Status', value: 'Optimal', top: '12%', left: '50%', icon: Activity },
    { id: 'chest', label: 'Heart Rate', value: '72 bpm', top: '28%', left: '50%', icon: HeartPulse },
    { id: 'abs', label: 'Core Stability', value: 'Strong', top: '42%', left: '50%', icon: Zap },
    { id: 'arm-l', label: 'Left Bicep', value: `${(athlete.skeletalMuscleMass * 0.15).toFixed(1)} kg`, top: '32%', left: '30%', icon: Activity },
    { id: 'arm-r', label: 'Right Bicep', value: `${(athlete.skeletalMuscleMass * 0.15).toFixed(1)} kg`, top: '32%', left: '70%', icon: Activity },
    { id: 'leg-l', label: 'Left Quad', value: `${(athlete.skeletalMuscleMass * 0.25).toFixed(1)} kg`, top: '65%', left: '42%', icon: Activity },
    { id: 'leg-r', label: 'Right Quad', value: `${(athlete.skeletalMuscleMass * 0.25).toFixed(1)} kg`, top: '65%', left: '58%', icon: Activity },
  ];

  return (
    <div className="relative w-full max-w-[400px] h-[600px] flex items-center justify-center">
      {/* Anatomical Image */}
      <div className="relative h-full w-full flex items-center justify-center">
        <img 
          src="https://i.imgur.com/P0mCrTm.png" 
          alt="Anatomical Mapping" 
          className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.1)]"
          referrerPolicy="no-referrer"
        />
        
        {/* Interactive Hotspots */}
        {hotspots.map(spot => (
          <div 
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-30"
            style={{ top: spot.top, left: spot.left }}
            onMouseEnter={() => setHoveredPart(spot.id)}
            onMouseLeave={() => setHoveredPart(null)}
          >
            <div className={cn(
              "w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center",
              hoveredPart === spot.id ? "bg-brand-red scale-125" : "bg-blue-500/80 hover:bg-brand-red"
            )}>
              <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>

            {/* Floating Tooltip/Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ 
                opacity: hoveredPart === spot.id ? 1 : 0,
                y: hoveredPart === spot.id ? 0 : 10,
                scale: hoveredPart === spot.id ? 1 : 0.9
              }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none z-50"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-100 min-w-[160px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <spot.icon className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{spot.label}</div>
                  <div className="text-xs font-black text-slate-900">{spot.value}</div>
                </div>
              </div>
              <div className="w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Static Callouts for Key Metrics */}
      <div className="absolute -left-12 top-1/4 flex flex-col gap-4 z-20">
        <BodyCallout label="Muscle Mass" value={`${athlete.skeletalMuscleMass} kg`} sub="Skeletal" position="relative" />
        <BodyCallout label="Body Fat" value={`${athlete.bodyFatInBody}%`} sub="Segmental" position="relative" alert={athlete.bodyFatInBody > 15} />
      </div>

      <div className="absolute -right-12 bottom-1/4 flex flex-col gap-4 z-20">
        <BodyCallout label="Weight" value={`${athlete.weight} kg`} sub="Total" position="relative" highlight align="right" />
        <BodyCallout label="Height" value={`${athlete.height} cm`} sub="Stature" position="relative" highlight align="right" />
      </div>

      {/* Status Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className={cn(
          "px-8 py-3 rounded-2xl border-2 font-black text-sm uppercase tracking-[0.3em] shadow-2xl backdrop-blur-xl transition-all hover:scale-105 cursor-default",
          athlete.status === 'Fit' ? "bg-green-500/20 border-green-500/50 text-green-600" :
          athlete.status === 'Injured' ? "bg-red-500/20 border-red-500/50 text-red-600" :
          "bg-yellow-500/20 border-yellow-500/50 text-yellow-600"
        )}>
          {athlete.status}
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
