import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, AlertCircle,
  Plus, Eye, Bell, TrendingUp, Activity,
  ChevronRight, Zap, User, BarChart2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { MOCK_NOTIFICATIONS, CATEGORIES } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { Priority } from '../../types';

// ─── Notification icon/color maps ─────────────────────────────────────────────
const NOTIFICATION_ICONS: Record<string, JSX.Element> = {
  complaint_assigned: <User size={14} />,
  status_updated: <Activity size={14} />,
  complaint_resolved: <CheckCircle size={14} />,
  complaint_submitted: <FileText size={14} />,
  new_complaint: <Bell size={14} />,
  feedback_received: <TrendingUp size={14} />,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  complaint_assigned: '#6366F1',
  status_updated: '#F59E0B',
  complaint_resolved: '#10B981',
  complaint_submitted: '#2563EB',
  new_complaint: '#EF4444',
  feedback_received: '#EC4899',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: '#10B981', bg: '#10B98122' },
  medium:   { label: 'Medium',   color: '#FBBF24', bg: '#FBBF2422' },
  high:     { label: 'High',     color: '#F59E0B', bg: '#F59E0B22' },
  critical: { label: 'Critical', color: '#EF4444', bg: '#EF444422' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, isLoading } = useComplaintStore();
  const [quickCategory, setQuickCategory] = useState('c1');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ─── Derived stats ───────────────────────────────────────────────────────────
  const myComplaints = complaints.filter((c) => c.studentId === user?.id);
  const total = myComplaints.length;
  const pending = myComplaints.filter((c) => c.status === 'pending').length;
  const inProgress = myComplaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned'
  ).length;
  const resolved = myComplaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;

  const recentComplaints = [...myComplaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const myNotifications = MOCK_NOTIFICATIONS.filter((n) => n.userId === user?.id);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Page Header ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              {greeting()}, 👋
            </p>
            <h1 className="text-3xl font-display font-bold text-white">
              {user?.name || 'Student'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Student Dashboard · Manage and track your campus complaints
            </p>
          </div>
          <motion.button
            className="btn-primary flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap"
            onClick={() => navigate('/student/complaints/new')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            Submit New Complaint
          </motion.button>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={<AnimatedCounter target={total} />}
            icon={<FileText size={20} />}
            color="#2563EB"
            change="All time"
            changeType="neutral"
            delay={0.05}
          />
          <StatCard
            title="Pending"
            value={<AnimatedCounter target={pending} />}
            icon={<Clock size={20} />}
            color="#FBBF24"
            change="Awaiting review"
            changeType="neutral"
            delay={0.1}
          />
          <StatCard
            title="In Progress"
            value={<AnimatedCounter target={inProgress} />}
            icon={<AlertCircle size={20} />}
            color="#F59E0B"
            change="Being resolved"
            changeType="neutral"
            delay={0.15}
          />
          <StatCard
            title="Resolved"
            value={<AnimatedCounter target={resolved} />}
            icon={<CheckCircle size={20} />}
            color="#10B981"
            change="Completed"
            changeType="up"
            delay={0.2}
          />
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Complaints Table */}
            <motion.div
              className="glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BarChart2 size={16} className="text-blue-400" />
                  </div>
                  <h2 className="font-display font-semibold text-white">Recent Complaints</h2>
                </div>
                <Link
                  to="/student/complaints"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={40} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No complaints yet</p>
                  <p className="text-slate-600 text-sm mt-1">Submit your first complaint to get started</p>
                  <button
                    onClick={() => navigate('/student/complaints/new')}
                    className="btn-primary mt-4 px-4 py-2 text-sm"
                  >
                    Submit Complaint
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Date', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentComplaints.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          className="group hover:bg-white/3 transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-blue-400">{c.complaintNo}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white font-medium line-clamp-1 max-w-[150px] block">
                              {c.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">
                              {c.categoryIcon} {c.categoryName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={c.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/student/complaints/${c.id}`}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                title="View"
                              >
                                <Eye size={14} />
                              </Link>
                              <Link
                                to={`/student/complaints/${c.id}`}
                                className="text-xs px-2 py-1 rounded-md bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                              >
                                Track
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Progress rings */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {[
                { label: 'Resolved Rate', value: total ? Math.round((resolved / total) * 100) : 0, color: '#10B981' },
                { label: 'In Progress', value: total ? Math.round((inProgress / total) * 100) : 0, color: '#F59E0B' },
                { label: 'Pending', value: total ? Math.round((pending / total) * 100) : 0, color: '#FBBF24' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-sm p-4 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="#ffffff10" strokeWidth="6" fill="none" />
                      <circle
                        cx="32" cy="32" r="26"
                        stroke={color}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - value / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                      style={{ color }}
                    >
                      {value}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Submit Widget */}
            <motion.div
              className="glass p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-purple-400" />
                </div>
                <h2 className="font-display font-semibold text-white">Quick Submit</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Category</label>
                  <select
                    className="input-glass w-full text-sm"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Priority</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(priorityConfig) as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setQuickPriority(p)}
                        className="py-1.5 rounded-lg text-xs font-semibold transition-all border"
                        style={{
                          background: quickPriority === p ? priorityConfig[p].bg : 'transparent',
                          borderColor: quickPriority === p ? priorityConfig[p].color : '#ffffff15',
                          color: quickPriority === p ? priorityConfig[p].color : '#64748b',
                        }}
                      >
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => navigate('/student/complaints/new')}
                  className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} />
                  Submit Full Complaint
                </motion.button>
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              className="glass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 p-5 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Bell size={16} className="text-amber-400" />
                </div>
                <h2 className="font-display font-semibold text-white">Activity Feed</h2>
                {myNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">
                    {myNotifications.filter((n) => !n.read).length} new
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <Bell size={28} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No notifications</p>
                  </div>
                ) : (
                  myNotifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      className={`glass-sm p-3 rounded-xl flex gap-3 items-start cursor-pointer hover:bg-white/5 transition-colors ${
                        !n.read ? 'ring-1 ring-white/10' : ''
                      }`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{
                          background: `${NOTIFICATION_COLORS[n.type]}22`,
                          color: NOTIFICATION_COLORS[n.type],
                        }}
                      >
                        {NOTIFICATION_ICONS[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
