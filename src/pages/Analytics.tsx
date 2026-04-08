import React, { useState } from 'react';
import { BarChart3, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Scale, Droplets, Moon, Download, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { athletes, weightHistory } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { downloadCSV } from '../lib/exportUtils';

type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ranges = [
    { id: 'today', label: 'Today vs Yesterday' },
    { id: 'week', label: 'This Week vs Last Week' },
    { id: 'month', label: 'This Month vs Last Month' },
    { id: 'year', label: 'This Year vs Last Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const currentRangeLabel = ranges.find(r => r.id === timeRange)?.label;

  // Mock comparison data
  const comparisonStats = [
    { label: 'Avg. Weight Compliance', value: '92%', delta: '+2.4%', positive: true, icon: Scale, color: 'red' },
    { label: 'Avg. Hydration Level', value: '96.2%', delta: '-0.8%', positive: false, icon: Droplets, color: 'blue' },
    { label: 'Avg. Sleep Duration', value: '8.2h', delta: '+0.5h', positive: true, icon: Moon, color: 'indigo' },
    { label: 'Injury Rate', value: '4.1%', delta: '-1.2%', positive: true, icon: Users, color: 'green' },
  ];

  const handleExport = () => {
    const exportData = comparisonStats.map(stat => ({
      Metric: stat.label,
      Value: stat.value,
      Change: stat.delta,
      Status: stat.positive ? 'Improved' : 'Declined'
    }));
    downloadCSV(exportData, `Analytics_Report_${timeRange}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historical Analytics</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Compare performance metrics across different time periods.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:border-slate-300 transition-all text-xs font-bold text-slate-700"
            >
              <Calendar className="w-4 h-4 text-brand-red" />
              {currentRangeLabel}
              <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden">
                {ranges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => {
                      setTimeRange(range.id as TimeRange);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                      timeRange === range.id ? "bg-pastel-red text-brand-red" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-red/20"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comparisonStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                stat.color === 'red' ? "bg-pastel-red text-brand-red" :
                stat.color === 'blue' ? "bg-pastel-blue text-blue-600" :
                stat.color === 'indigo' ? "bg-pastel-indigo text-indigo-600" :
                "bg-pastel-green text-green-600"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
                stat.positive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.delta}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">vs Previous Period</div>
          </div>
        ))}
      </div>

      {/* Main Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-red flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-red" />
              </div>
              Performance Comparison
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar name="Current Period" dataKey="weight" fill="#E11D48" radius={[4, 4, 0, 0]} />
                <Bar name="Previous Period" dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              Compliance by Sector
            </h2>
          </div>
          <div className="space-y-6">
            {['Men\'s Singles', 'Women\'s Singles', 'Men\'s Doubles', 'Women\'s Doubles', 'Mixed Doubles'].map((sector, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{sector}</span>
                  <span className="text-xs font-black text-brand-red">{85 + idx * 2}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${85 + idx * 2}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-brand-red rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
