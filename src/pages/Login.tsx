import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'ADMIN' && password === 'ADMIN') {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-white overflow-hidden font-sans">
      {/* Hero Section (Aesthetic Left Panel) */}
      <div className="relative w-full md:w-1/2 lg:w-[55%] bg-slate-900 flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden shrink-0">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-lg text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
            className="relative group mb-8 md:mb-12"
          >
            {/* Pulsing glow behind the logo */}
            <div className="absolute -inset-8 bg-gradient-to-br from-brand-red to-rose-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
            
            {/* Glassmorphism Logo Container */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden p-8 aspect-square">
              <img 
                src="https://i.imgur.com/qgCJK08.png" 
                alt="Logo DL" 
                className="w-full h-full object-contain drop-shadow-2xl filter brightness-110" 
              />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-none"
          >
            NUTRITION<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-rose-400">PERFORMANCE</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-sm md:text-base font-medium max-w-sm"
          >
            Sistem Dashboard Manajemen Data Atlet
          </motion.p>
        </div>
      </div>

      {/* Form Section (Interaction Right Panel) */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative z-10 py-16 md:py-0 rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none -mt-12 md:mt-0 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.2)] md:shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.2)]">
        <div className="max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 text-brand-red text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Access
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang</h2>
            <p className="text-sm font-semibold text-slate-500">Silakan masuk menggunakan kredensial administrator yang ada.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-50 border border-brand-red/20 text-brand-red text-xs font-bold text-center"
              >
                ID atau Password salah. Gunakan ADMIN / ADMIN.
              </motion.div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">ID Pengguna</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-brand-red transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Masukkan ID..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-red/30 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-red transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-red/30 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full relative group bg-brand-red hover:bg-rose-700 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-bold shadow-lg shadow-brand-red/20 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                Masuk ke Sistem <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SRS25024 © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
