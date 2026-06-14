import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import {
  Users, GraduationCap, Briefcase, FileText, AlertCircle,
  CheckCircle2, Search, Filter, ChevronUp, ChevronDown,
  Eye, UserPlus, Cpu, TrendingUp, Clock, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useComplaintStore } from '../../store/complaintStore';
import {
  MOCK_OVERVIEW, MOCK_CATEGORY_BREAKDOWN, MOCK_MONTHLY_TRENDS,
  MOCK_STAFF_PERFORMANCE, MOCK_STAFF
} from '../../data/mockData';
import { Complaint } from '../../types';

const RESOLUTION_TIME_DATA = [
  { month: 'Nov', avgHours: 42 }, { month: 'Dec', avgHours: 38 },
  { month: 'Jan', avgHours: 45 }, { month: 'Feb', avgHours: 40 },
  { month: 'Mar', avgHours: 36 }, { month: 'Apr', avgHours: 32 },
  { month: 'May', avgHours: 28 }, { month: 'Jun', avgHours: 35 },
  { month: 'Jul', avgHours: 30 }, { month: 'Aug', avgHours: 27 },
  { month: 'Sep', avgHours: 33 }, { month: 'Oct', avgHours: 36 },
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

const PieGlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: 'rgba(10,15,30,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding: '10px 16px',
      backdropFilter: 'blur(16px)',
    }}>
      <p style={{ color: item.payload.color, fontWeight: 600, fontSize: 13 }}>{item.name}</p>
      <p style={{ color: '#fff', fontSize: 13 }}>Count: {item.value}</p>
      <p style={{ color: '#94A3B8', fontSize: 12 }}>{((item.value / 2401) * 100).toFixed(1)}% of total</p>
    </div>
  );
};

const getMatchScore = (complaint: Complaint, staffId: string): number => {
  const staff = MOCK_STAFF.find(s => s.id === staffId);
  if (!staff) return 0;
  const match = staff.expertise.some(e => e.toLowerCase().includes(complaint.categoryName.toLowerCase()) ||
    complaint.categoryName.toLowerCase().includes(e.toLowerCase()));
  const workloadPenalty = Math.min(staff.assignedCount * 5, 30);
  return match ? Math.max(95 - workloadPenalty, 60) : Math.max(60 - workloadPenalty, 30);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { complaints, fetchComplaints, assignStaff } = useComplaintStore();
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortCol, setSortCol] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [assignModal, setAssignModal] = useState<{ open: boolean; complaint: Complaint | null }>({
    open: false, complaint: null
  });
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintNo.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'createdAt') return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortCol === 'priority') {
      const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return dir * (pOrder[a.priority] - pOrder[b.priority]);
    }
    return dir * a.title.localeCompare(b.title);
  });

  const unassigned = complaints.filter(c => !c.assignment);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const handleAssign = async () => {
    if (!assignModal.complaint || !selectedStaff) return;
    setAssigning(true);
    const staff = MOCK_STAFF.find(s => s.id === selectedStaff)!;
    try {
      await assignStaff(assignModal.complaint.id, staff.id, staff.name, staff.email);
      toast.success(`Assigned to ${staff.name} successfully!`);
      setAssignModal({ open: false, complaint: null });
      setSelectedStaff('');
    } catch {
      toast.error('Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex flex-col" style={{ opacity: sortCol === col ? 1 : 0.3 }}>
      <ChevronUp size={10} style={{ marginBottom: -2, color: sortCol === col && sortDir === 'asc' ? '#6366F1' : '#94A3B8' }} />
      <ChevronDown size={10} style={{ color: sortCol === col && sortDir === 'desc' ? '#6366F1' : '#94A3B8' }} />
    </span>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            className="font-display text-3xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Admin Dashboard
          </motion.h1>
          <motion.p
            className="text-slate-400 mt-1 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {formattedDate} &nbsp;&bull;&nbsp; <span style={{ color: '#6366F1', fontVariantNumeric: 'tabular-nums' }}>{formattedTime}</span>
          </motion.p>
        </div>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 10, padding: '6px 14px',
            fontSize: 13, color: '#fff', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Cpu size={14} /> Smart Campus v2.4
          </div>
        </motion.div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Users" value={<AnimatedCounter target={MOCK_OVERVIEW.totalUsers} />} icon={<Users size={20} />} color="#06B6D4" change="+24 this month" changeType="up" delay={0} />
        <StatCard title="Total Students" value={<AnimatedCounter target={MOCK_OVERVIEW.totalStudents} />} icon={<GraduationCap size={20} />} color="#3B82F6" change="Active enrolled" changeType="neutral" delay={0.05} />
        <StatCard title="Total Staff" value={<AnimatedCounter target={MOCK_OVERVIEW.totalStaff} />} icon={<Briefcase size={20} />} color="#A855F7" change="All departments" changeType="neutral" delay={0.1} />
        <StatCard title="Total Complaints" value={<AnimatedCounter target={MOCK_OVERVIEW.totalComplaints} />} icon={<FileText size={20} />} color="#6366F1" change="Since inception" changeType="neutral" delay={0.15} />
        <StatCard title="Active Complaints" value={<AnimatedCounter target={MOCK_OVERVIEW.activeComplaints} />} icon={<AlertCircle size={20} />} color="#F59E0B" change="-3 from yesterday" changeType="down" delay={0.2} />
        <StatCard title="Resolved Today" value={<AnimatedCounter target={MOCK_OVERVIEW.resolvedToday} />} icon={<CheckCircle2 size={20} />} color="#10B981" change="+2 vs avg" changeType="up" delay={0.25} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <motion.div className="glass p-6 chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#6366F1, #8B5CF6)' }} />
            <h3 className="font-display font-semibold text-white">Complaints by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={MOCK_CATEGORY_BREAKDOWN}
                cx="50%" cy="45%" innerRadius={60} outerRadius={100}
                paddingAngle={3} dataKey="count" nameKey="name"
              >
                {MOCK_CATEGORY_BREAKDOWN.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<PieGlassTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#CBD5E1', fontSize: 11 }}>{value}</span>}
                iconSize={8} iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div className="glass p-6 chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#3B82F6, #10B981)' }} />
            <h3 className="font-display font-semibold text-white">Monthly Complaint Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MOCK_MONTHLY_TRENDS} barGap={4}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#065F46" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#CBD5E1', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="submitted" name="Submitted" fill="url(#gradBlue)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="url(#gradGreen)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Area / Line Chart */}
        <motion.div className="glass p-6 chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#F59E0B, #EF4444)' }} />
            <h3 className="font-display font-semibold text-white">Avg Resolution Time (hrs)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={RESOLUTION_TIME_DATA}>
              <defs>
                <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="avgHours" name="Avg Hours" stroke="#F59E0B" strokeWidth={2.5} fill="url(#gradArea)" dot={{ fill: '#F59E0B', r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Horizontal Bar - Staff Performance */}
        <motion.div className="glass p-6 chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center gap-2 mb-5">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#A855F7, #6366F1)' }} />
            <h3 className="font-display font-semibold text-white">Staff Performance</h3>
          </div>
          <div className="space-y-4">
            {MOCK_STAFF_PERFORMANCE.map((s, i) => {
              const maxResolved = Math.max(...MOCK_STAFF_PERFORMANCE.map(x => x.resolved));
              const pct = (s.resolved / maxResolved) * 100;
              const colors = ['#6366F1', '#A855F7', '#3B82F6', '#10B981', '#F59E0B'];
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: '#CBD5E1', fontSize: 13 }}>{s.staffName}</span>
                    <div className="flex items-center gap-3">
                      <span style={{ color: '#94A3B8', fontSize: 12 }}>{s.avgTime}h avg</span>
                      <span style={{ color: '#FBBF24', fontSize: 12 }}>⭐ {s.rating}</span>
                      <span style={{ color: colors[i], fontSize: 13, fontWeight: 700 }}>{s.resolved}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}88)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Complaints Table */}
      <motion.div className="glass mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#6366F1, #A855F7)' }} />
            <h3 className="font-display font-semibold text-white">Recent Complaints</h3>
            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818CF8', fontSize: 12, borderRadius: 20, padding: '2px 10px' }}>
              {complaints.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-glass pl-8 pr-4 py-2 text-sm"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
            <select className="input-glass py-2 px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select className="input-glass py-2 px-3 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {[['complaintNo', 'ID'], ['title', 'Title'], ['categoryName', 'Category'], ['priority', 'Priority'], ['status', 'Status'], ['assignment', 'Assigned To'], ['createdAt', 'Date'], ['', 'Actions']].map(([col, label]) => (
                  <th key={col} onClick={col ? () => handleSort(col) : undefined}
                    style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                    {label} {col && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/3 transition-colors"
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#818CF8', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 6 }}>{c.complaintNo}</span>
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: 200 }}>
                    <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                    <p style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{c.studentName}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#CBD5E1', fontSize: 13 }}>{c.categoryIcon} {c.categoryName}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}><PriorityBadge priority={c.priority} /></td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: c.assignment ? '#A5F3FC' : '#EF4444', fontSize: 12 }}>
                      {c.assignment ? c.assignment.staffName : 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#64748B', fontSize: 12 }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAssignModal({ open: true, complaint: c })}
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <UserPlus size={12} /> Assign
                      </button>
                      <Link to={`/admin/complaints/${c.id}`}
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#CBD5E1', borderRadius: 8, padding: '5px 10px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={12} /> View
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>No complaints found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Smart Assignment Panel */}
      {unassigned.length > 0 && (
        <motion.div className="glass p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(#10B981, #06B6D4)' }} />
            <h3 className="font-display font-semibold text-white">Smart Assignment Panel</h3>
            <span style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D', fontSize: 12, borderRadius: 20, padding: '2px 10px' }}>
              {unassigned.length} unassigned
            </span>
            <div style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', borderRadius: 8, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
              🤖 AI Powered
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {unassigned.map((complaint) => {
              const suggestions = MOCK_STAFF.map(staff => ({
                staff,
                score: getMatchScore(complaint, staff.id)
              })).sort((a, b) => b.score - a.score).slice(0, 3);

              return (
                <div key={complaint.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{complaint.title.substring(0, 45)}{complaint.title.length > 45 ? '...' : ''}</p>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 12 }}>{complaint.categoryIcon}</span>
                        <span style={{ color: '#94A3B8', fontSize: 11 }}>{complaint.categoryName}</span>
                        <PriorityBadge priority={complaint.priority} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((sug, i) => (
                      <div key={sug.staff.id} style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', background: i === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, padding: '8px 10px' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            {i === 0 && <span style={{ background: '#10B981', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>AI PICK</span>}
                            <span style={{ color: '#CBD5E1', fontSize: 12, fontWeight: 500 }}>{sug.staff.name}</span>
                          </div>
                          <span style={{ color: '#64748B', fontSize: 11 }}>{sug.staff.assignedCount} active tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: sug.score >= 80 ? '#10B981' : sug.score >= 60 ? '#F59E0B' : '#EF4444', fontSize: 12, fontWeight: 700 }}>{sug.score}%</span>
                          <button
                            onClick={async () => {
                              await assignStaff(complaint.id, sug.staff.id, sug.staff.name, sug.staff.email);
                              toast.success(`Assigned to ${sug.staff.name}!`);
                            }}
                            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Assign Modal */}
      <Modal isOpen={assignModal.open} onClose={() => { setAssignModal({ open: false, complaint: null }); setSelectedStaff(''); }} title="Assign Staff" size="md">
        {assignModal.complaint && (
          <div className="space-y-4">
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14 }}>
              <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Complaint</p>
              <p style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>{assignModal.complaint.title}</p>
              <div className="flex gap-2 mt-2">
                <PriorityBadge priority={assignModal.complaint.priority} />
                <StatusBadge status={assignModal.complaint.status} />
              </div>
            </div>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8, display: 'block' }}>Select Staff Member</label>
              <select className="input-glass w-full py-3 px-4" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                <option value="">-- Select Staff --</option>
                {MOCK_STAFF.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.expertise.join(', ')}) — {s.assignedCount} tasks — Match: {getMatchScore(assignModal.complaint!, s.id)}%
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssign}
              disabled={!selectedStaff || assigning}
              style={{ width: '100%', background: selectedStaff ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.05)', border: 'none', color: selectedStaff ? '#fff' : '#475569', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: selectedStaff ? 'pointer' : 'not-allowed' }}
            >
              {assigning ? 'Assigning...' : 'Assign Staff'}
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
