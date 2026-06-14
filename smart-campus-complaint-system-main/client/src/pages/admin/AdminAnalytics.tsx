import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Calendar, Download, TrendingUp, Clock, ShieldAlert, Award, Smile } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import {
  MOCK_CATEGORY_BREAKDOWN, MOCK_MONTHLY_TRENDS, MOCK_STAFF_PERFORMANCE,
  MOCK_COMPLAINTS
} from '../../data/mockData';

// ─── Heatmap Data (Days of Week x Hours of Day) ─────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
// Generate random-like frequencies
const HEATMAP_DATA = [
  [3, 8, 4, 12, 6, 2, 1], // Mon
  [5, 9, 11, 8, 4, 3, 2], // Tue
  [4, 12, 15, 6, 8, 4, 0], // Wed
  [7, 6, 9, 14, 11, 5, 2], // Thu
  [8, 10, 12, 7, 5, 2, 1], // Fri
  [2, 3, 5, 4, 3, 1, 0], // Sat
  [1, 2, 1, 3, 2, 0, 0]  // Sun
];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,15,30,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding: '10px 16px',
      backdropFilter: 'blur(16px)',
    }}>
      {label && <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#fff', fontSize: 13, margin: '2px 0' }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span> {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [range, setRange] = useState('30');

  const stats = useMemo(() => {
    return {
      total: MOCK_COMPLAINTS.length,
      resolved: MOCK_COMPLAINTS.filter(c => c.status === 'resolved' || c.status === 'closed').length,
      pending: MOCK_COMPLAINTS.filter(c => c.status === 'pending').length,
      avgTime: 24.5,
      satisfaction: 92.4,
    };
  }, []);

  const priorityData = useMemo(() => {
    return [
      { subject: 'Critical', A: MOCK_COMPLAINTS.filter(c => c.priority === 'critical').length, fullMark: 50 },
      { subject: 'High', A: MOCK_COMPLAINTS.filter(c => c.priority === 'high').length, fullMark: 50 },
      { subject: 'Medium', A: MOCK_COMPLAINTS.filter(c => c.priority === 'medium').length, fullMark: 50 },
      { subject: 'Low', A: MOCK_COMPLAINTS.filter(c => c.priority === 'low').length, fullMark: 50 },
    ];
  }, []);

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Compiling analytics...',
        success: 'PDF Report downloaded successfully!',
        error: 'Error generating report',
      }
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 className="font-display text-3xl font-bold text-white" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Analytics & Reports
          </motion.h1>
          <p className="text-slate-400 text-sm mt-1">Deep-dive performance graphs, SLAs, and workload metrics</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select className="input-glass py-2 px-3 text-sm" value={range} onChange={e => setRange(e.target.value)} style={{ width: 150 }}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <button
            onClick={handleGenerateReport}
            style={{ background: 'linear-gradient(90deg, #2563EB, #06B6D4)', border: 'none', color: '#fff', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Download size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Volume" value={<AnimatedCounter target={stats.total} />} icon={<TrendingUp size={20} />} color="#6366F1" delay={0} />
        <StatCard title="Total Resolved" value={<AnimatedCounter target={stats.resolved} />} icon={<Award size={20} />} color="#10B981" delay={0.05} />
        <StatCard title="Outstanding" value={<AnimatedCounter target={stats.pending} />} icon={<ShieldAlert size={20} />} color="#FBBF24" delay={0.1} />
        <StatCard title="Avg Resolution Time" value={<AnimatedCounter target={stats.avgTime} decimals={1} suffix=" hrs" />} icon={<Clock size={20} />} color="#F59E0B" delay={0.15} />
        <StatCard title="Student Satisfaction" value={<AnimatedCounter target={stats.satisfaction} decimals={1} suffix="%" />} icon={<Smile size={20} />} color="#06B6D4" delay={0.2} />
      </div>

      {/* Row 1: Trends & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#2563EB, #7C3AED)' }} />
            <h3 className="font-display font-semibold text-white">Monthly Submitted vs Resolved</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MOCK_MONTHLY_TRENDS}>
              <defs>
                <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#CBD5E1', fontSize: 11 }}>{v}</span>} />
              <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#2563EB" strokeWidth={2} fill="url(#gradSub)" />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={2} fill="url(#gradRes)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#06B6D4, #7C3AED)' }} />
            <h3 className="font-display font-semibold text-white">Category Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={MOCK_CATEGORY_BREAKDOWN}
                cx="50%" cy="50%" innerRadius={70} outerRadius={105}
                paddingAngle={4} dataKey="count" nameKey="name"
              >
                {MOCK_CATEGORY_BREAKDOWN.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#CBD5E1', fontSize: 11 }}>{v}</span>} iconSize={8} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Priority Radar & Staff Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#F59E0B, #EF4444)' }} />
            <h3 className="font-display font-semibold text-white">Priority Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={priorityData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fill: '#475569', fontSize: 10 }} />
              <Radar name="Complaints" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#A855F7, #6366F1)' }} />
            <h3 className="font-display font-semibold text-white">Staff Productivity</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOCK_STAFF_PERFORMANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="staffName" type="category" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="resolved" name="Resolved Tasks" fill="#7C3AED" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Heatmap & Top Unresolved */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Heatmap */}
        <motion.div className="glass p-6 xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#06B6D4, #3B82F6)' }} />
            <h3 className="font-display font-semibold text-white">Complaint Submission Heatmap</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Visual density of incoming complaints by day and hour</p>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 460 }}>
              {/* Hour Labels Header */}
              <div className="flex mb-1" style={{ paddingLeft: 40 }}>
                {HOURS.map(h => (
                  <span key={h} className="flex-1 text-center font-mono" style={{ color: '#475569', fontSize: 10 }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {DAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center mb-1">
                  <span className="w-10 text-slate-400 font-medium" style={{ fontSize: 12 }}>{day}</span>
                  {HEATMAP_DATA[dIdx].map((val, hIdx) => {
                    const maxVal = 15;
                    const opacity = Math.max(val / maxVal, 0.05);
                    return (
                      <div
                        key={hIdx}
                        className="flex-1 rounded-sm relative group"
                        style={{
                          height: 28,
                          margin: '0 2px',
                          backgroundColor: `rgba(99, 102, 241, ${opacity})`,
                          border: val > 10 ? '1px solid rgba(129, 140, 248, 0.4)' : 'none',
                        }}
                      >
                        {/* Tooltip */}
                        <div style={{
                          position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                          display: 'none', background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap', zIndex: 10, fontSize: 10, color: '#fff'
                        }} className="group-hover:block">
                          {val} tickets
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Unresolved Categories */}
        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center gap-2 mb-5">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#EF4444, #F59E0B)' }} />
            <h3 className="font-display font-semibold text-white">Top Unresolved Categories</h3>
          </div>
          <div className="space-y-4">
            {[
              { category: 'Electrical', count: 18, pct: 85, color: '#FBBF24' },
              { category: 'IT / Network', count: 14, pct: 68, color: '#2563EB' },
              { category: 'Plumbing', count: 11, pct: 54, color: '#06B6D4' },
              { category: 'Cleaning', count: 8, pct: 38, color: '#10B981' },
              { category: 'Lab Equipment', count: 5, pct: 24, color: '#7C3AED' }
            ].map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5 text-sm">
                  <span style={{ color: '#CBD5E1', fontWeight: 500 }}>{cat.category}</span>
                  <span style={{ color: cat.color, fontWeight: 700 }}>{cat.count} pending</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: cat.color, borderRadius: 3 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
