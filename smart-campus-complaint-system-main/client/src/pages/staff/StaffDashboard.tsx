import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, MapPin, Clock, CheckCircle, AlertTriangle,
  Loader, ChevronDown, ChevronUp, Zap, User, Building2,
  TrendingUp, Star, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { Complaint, ComplaintStatus } from '../../types';
import { MOCK_COMPLAINTS, MOCK_STAFF } from '../../data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getHourGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const PRIORITY_BORDER: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

// ─── Status Update Modal ──────────────────────────────────────────────────────
interface UpdateModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onSubmit: (id: string, status: ComplaintStatus, remarks: string) => void;
}

const UpdateModal = ({ complaint, onClose, onSubmit }: UpdateModalProps) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status ?? 'pending');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!complaint) return;
    if (!remarks.trim()) { toast.error('Please add remarks'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onSubmit(complaint.id, status, remarks);
    setLoading(false);
    onClose();
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={!!complaint} onClose={onClose} title="Update Task Status" size="md">
      <div className="space-y-4">
        <div className="glass p-3 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Complaint</p>
          <p className="text-white font-medium">{complaint.title}</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">{complaint.complaintNo}</p>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">New Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(['assigned', 'in_progress', 'resolved'] as ComplaintStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  status === s
                    ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {s === 'assigned' ? '✅ Accept' : s === 'in_progress' ? '🔧 In Progress' : '🎉 Resolved'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Remarks *</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder="Describe what action you took..."
            className="input-glass w-full resize-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ghost text-sm py-2.5">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
            {loading ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {loading ? 'Saving...' : 'Submit Update'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Kanban Card ──────────────────────────────────────────────────────────────
const KanbanCard = ({ complaint, onUpdate }: { complaint: Complaint; onUpdate: (c: Complaint) => void }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="glass p-4 rounded-xl space-y-3 relative overflow-hidden cursor-pointer group"
      style={{ borderLeft: `3px solid ${PRIORITY_BORDER[complaint.priority]}` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${PRIORITY_BORDER[complaint.priority]}08, transparent)` }}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">{complaint.title}</p>
        <PriorityBadge priority={complaint.priority} />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="text-lg">{complaint.categoryIcon}</span>
        <span>{complaint.categoryName}</span>
      </div>

      <div className="space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <User size={11} className="text-slate-600" />
          <span>{complaint.studentName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={11} className="text-slate-600" />
          <span>{complaint.building} · Floor {complaint.floor}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-slate-600" />
          <span>{timeSince(complaint.updatedAt)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => navigate(`/staff/tasks/${complaint.id}`)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
        >
          Details
        </button>
        <button
          onClick={e => { e.stopPropagation(); onUpdate(complaint); }}
          className="flex-1 text-xs py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors"
        >
          {complaint.status === 'assigned' ? 'Accept' : complaint.status === 'in_progress' ? 'Update' : 'Verify'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({
  title, color, count, children,
}: { title: string; color: string; count: number; children: React.ReactNode }) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-sm font-semibold text-white">{title}</span>
      <span
        className="text-xs px-2 py-0.5 rounded-full font-mono"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {count}
      </span>
    </div>
    <div className="space-y-3 min-h-[200px]">
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  </div>
);

// ─── Table Row ────────────────────────────────────────────────────────────────
const TableRow = ({ complaint, index, onUpdate }: { complaint: Complaint; index: number; onUpdate: (c: Complaint) => void }) => {
  const navigate = useNavigate();
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/3 transition-colors"
    >
      <td className="px-4 py-3 text-xs font-mono text-violet-400">{complaint.complaintNo}</td>
      <td className="px-4 py-3">
        <p className="text-white text-sm font-medium line-clamp-1 max-w-[200px]">{complaint.title}</p>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-300">
          <span>{complaint.categoryIcon}</span>
          {complaint.categoryName}
        </span>
      </td>
      <td className="px-4 py-3"><PriorityBadge priority={complaint.priority} /></td>
      <td className="px-4 py-3"><StatusBadge status={complaint.status} /></td>
      <td className="px-4 py-3 text-sm text-slate-400">{complaint.studentName}</td>
      <td className="px-4 py-3 text-sm text-slate-400">
        {complaint.building} · F{complaint.floor}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/staff/tasks/${complaint.id}`)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
          >
            View
          </button>
          <button
            onClick={() => onUpdate(complaint)}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30"
          >
            Update
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ─── Building Accordion ───────────────────────────────────────────────────────
const BuildingAccordion = ({ building, complaints, onUpdate }: {
  building: string; complaints: Complaint[]; onUpdate: (c: Complaint) => void;
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Building2 size={15} className="text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">{building}</p>
            <p className="text-xs text-slate-500">{complaints.length} task{complaints.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {complaints.some(c => c.priority === 'critical') && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              ⚠ Critical
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2 border-t border-white/5">
              {complaints.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">{c.categoryIcon}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-slate-500">Floor {c.floor} · {c.roomNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                    <button
                      onClick={() => navigate(`/staff/tasks/${c.id}`)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onUpdate(c)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffDashboard = () => {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, updateStatus } = useComplaintStore();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Get complaints assigned to this staff
  const myComplaints = useMemo(
    () => (complaints.length ? complaints : MOCK_COMPLAINTS).filter(
      c => c.assignment?.staffId === user?.id
    ),
    [complaints, user?.id]
  );

  // KPI counts
  const kpi = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
    return {
      total: myComplaints.length,
      pending: myComplaints.filter(c => c.status === 'pending' || c.status === 'assigned').length,
      inProgress: myComplaints.filter(c => c.status === 'in_progress').length,
      resolvedWeek: myComplaints.filter(c => c.status === 'resolved' && (c.resolvedAt ?? '') >= oneWeekAgo).length,
      critical: myComplaints.filter(c => c.priority === 'critical').length,
    };
  }, [myComplaints]);

  // Group by building
  const byBuilding = useMemo(() => {
    const map: Record<string, Complaint[]> = {};
    myComplaints.forEach(c => {
      if (!map[c.building]) map[c.building] = [];
      map[c.building].push(c);
    });
    return map;
  }, [myComplaints]);

  // Kanban columns
  const kanbanCols = useMemo(() => ({
    pending: myComplaints.filter(c => c.status === 'pending' || c.status === 'assigned'),
    inProgress: myComplaints.filter(c => c.status === 'in_progress'),
    resolved: myComplaints.filter(c => c.status === 'resolved' || c.status === 'closed'),
  }), [myComplaints]);

  const staffInfo = MOCK_STAFF.find(s => s.id === user?.id);

  const handleUpdate = async (id: string, status: ComplaintStatus, remarks: string) => {
    await updateStatus(id, status, remarks, user?.name ?? 'Staff');
    toast.success(`Status updated to ${status.replace('_', ' ')}`);
  };

  return (
    <DashboardLayout>
      {/* Urgent Alert Banner */}
      <AnimatePresence>
        {kpi.critical > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-6 px-5 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #EF444420, #B91C1C15)', border: '1px solid #EF444440' }}
          >
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 animate-pulse" />
            <p className="text-red-300 text-sm font-medium">
              ⚠ You have <strong>{kpi.critical} critical priority</strong> task{kpi.critical > 1 ? 's' : ''} requiring immediate attention!
            </p>
            <button
              onClick={() => navigate('/staff/tasks')}
              className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors flex-shrink-0"
            >
              View Now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header + Quick Stats Row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Welcome */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl h-full"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.06))' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}
              >
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-slate-400 text-sm">{getHourGreeting()},</p>
                <h1 className="text-2xl font-display font-bold text-white">{user?.name ?? 'Rajesh Kumar'}</h1>
                <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                  <Clock size={13} />
                  {formatDate()}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/8 flex gap-4">
              {staffInfo?.expertise.map(e => (
                <span
                  key={e}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED44' }}
                >
                  {e}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:w-64 glass p-5 rounded-2xl space-y-4"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity size={13} /> Quick Stats
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <CheckCircle size={13} className="text-green-400" /> Today Completed
              </span>
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Zap size={13} className="text-yellow-400" /> Workload Score
              </span>
              <span className="text-white font-bold text-sm">{myComplaints.length}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Star size={13} className="text-amber-400" /> Rating
              </span>
              <span className="text-white font-bold text-sm">4.8 ⭐</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <TrendingUp size={13} className="text-violet-400" /> Total Resolved
              </span>
              <span className="text-white font-bold text-sm">189</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/8">
            <p className="text-xs text-slate-500 mb-2">Expertise Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {staffInfo?.expertise.map(e => (
                <span
                  key={e}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#6366F122', color: '#818CF8', border: '1px solid #6366F144' }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Assigned to Me" value={kpi.total} icon={<CheckSquare size={20} />} color="#6366F1" delay={0} />
        <StatCard title="Pending" value={kpi.pending} icon={<Clock size={20} />} color="#FBBF24" delay={0.05} />
        <StatCard title="In Progress" value={kpi.inProgress} icon={<Loader size={20} />} color="#F97316" delay={0.1} />
        <StatCard title="Resolved This Week" value={kpi.resolvedWeek} icon={<CheckCircle size={20} />} color="#10B981" delay={0.15} />
        <StatCard title="Urgent" value={kpi.critical} icon={<AlertTriangle size={20} />} color="#EF4444" delay={0.2} />
      </div>

      {/* Tasks Section */}
      <div className="glass rounded-2xl overflow-hidden mb-8">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">My Tasks</h2>
            <p className="text-slate-500 text-sm">{myComplaints.length} complaint{myComplaints.length !== 1 ? 's' : ''} assigned</p>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'kanban' ? 'bg-violet-500/30 text-violet-200 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={15} /> Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'table' ? 'bg-violet-500/30 text-violet-200 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List size={15} /> Table
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {view === 'kanban' ? (
              /* ── Kanban View ── */
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-4 overflow-x-auto pb-2"
              >
                <KanbanColumn title="Pending / Assigned" color="#FBBF24" count={kanbanCols.pending.length}>
                  {kanbanCols.pending.map(c => (
                    <KanbanCard key={c.id} complaint={c} onUpdate={setSelectedComplaint} />
                  ))}
                  {kanbanCols.pending.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-sm">No pending tasks</div>
                  )}
                </KanbanColumn>

                <KanbanColumn title="In Progress" color="#F97316" count={kanbanCols.inProgress.length}>
                  {kanbanCols.inProgress.map(c => (
                    <KanbanCard key={c.id} complaint={c} onUpdate={setSelectedComplaint} />
                  ))}
                  {kanbanCols.inProgress.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-sm">Nothing in progress</div>
                  )}
                </KanbanColumn>

                <KanbanColumn title="Resolved" color="#10B981" count={kanbanCols.resolved.length}>
                  {kanbanCols.resolved.map(c => (
                    <KanbanCard key={c.id} complaint={c} onUpdate={setSelectedComplaint} />
                  ))}
                  {kanbanCols.resolved.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-sm">No resolved tasks yet</div>
                  )}
                </KanbanColumn>
              </motion.div>
            ) : (
              /* ── Table View ── */
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                {myComplaints.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">No tasks assigned</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['ID', 'Title', 'Category', 'Priority', 'Status', 'Student', 'Location', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myComplaints.map((c, i) => (
                        <TableRow key={c.id} complaint={c} index={i} onUpdate={setSelectedComplaint} />
                      ))}
                    </tbody>
                  </table>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Location Grouping */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <MapPin size={15} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white">Tasks by Location</h2>
            <p className="text-slate-500 text-sm">{Object.keys(byBuilding).length} buildings</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(byBuilding).map(([building, cmps]) => (
            <BuildingAccordion
              key={building}
              building={building}
              complaints={cmps}
              onUpdate={setSelectedComplaint}
            />
          ))}
          {Object.keys(byBuilding).length === 0 && (
            <div className="glass rounded-xl py-12 text-center text-slate-500 text-sm">
              No tasks to group by location
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <UpdateModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onSubmit={handleUpdate}
      />
    </DashboardLayout>
  );
};

// Needed since StatCard imported but CheckSquare is not from lucide at top
function CheckSquare({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default StaffDashboard;
