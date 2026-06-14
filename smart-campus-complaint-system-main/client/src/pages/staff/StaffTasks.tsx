import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Clock, MapPin, User, AlertTriangle,
  SortAsc, ChevronDown, Loader, CheckCircle, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { Complaint, ComplaintStatus } from '../../types';
import { MOCK_COMPLAINTS } from '../../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterStatus = 'all' | ComplaintStatus;
type SortKey = 'priority' | 'date' | 'building';

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_BORDER: Record<string, string> = {
  low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${Math.floor(diff / 60_000)}m ago`;
};

// ─── Status Inline Updater ────────────────────────────────────────────────────
const InlineUpdater = ({
  complaint, onUpdate, onClose,
}: {
  complaint: Complaint;
  onUpdate: (id: string, status: ComplaintStatus, remarks: string) => Promise<void>;
  onClose: () => void;
}) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!remarks.trim()) { toast.error('Remarks required'); return; }
    setLoading(true);
    await onUpdate(complaint.id, status, remarks);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/8 pt-4 mt-3 space-y-3 overflow-hidden"
    >
      {/* Status Options */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {(['assigned', 'in_progress', 'resolved'] as ComplaintStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                status === s
                  ? 'bg-violet-500/25 border-violet-500/50 text-violet-300'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {s === 'assigned' ? '✅ Accept' : s === 'in_progress' ? '🔧 In Progress' : '🎉 Resolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <textarea
        value={remarks}
        onChange={e => setRemarks(e.target.value)}
        rows={2}
        placeholder="Add remarks about this update..."
        className="input-glass w-full resize-none text-sm"
      />

      <div className="flex gap-2">
        <button onClick={onClose} className="px-4 py-2 text-xs rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 text-xs rounded-lg bg-violet-500/25 border border-violet-500/40 text-violet-300 hover:bg-violet-500/35 transition-colors flex items-center gap-2"
        >
          {loading ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({
  complaint, index, onUpdate,
}: {
  complaint: Complaint;
  index: number;
  onUpdate: (id: string, status: ComplaintStatus, remarks: string) => Promise<void>;
}) => {
  const navigate = useNavigate();
  const [showUpdater, setShowUpdater] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className="glass glass-hover rounded-2xl overflow-hidden relative"
      style={{ borderLeft: `3px solid ${PRIORITY_BORDER[complaint.priority]}` }}
    >
      {/* Priority glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{ background: `linear-gradient(135deg, ${PRIORITY_BORDER[complaint.priority]}, transparent 60%)` }}
      />

      <div className="p-5 relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-snug mb-1">{complaint.title}</p>
            <p className="text-xs font-mono text-violet-400">{complaint.complaintNo}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-base">{complaint.categoryIcon}</span>
          <span className="text-xs text-slate-300">{complaint.categoryName}</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-slate-600" />
            <span className="truncate">{complaint.studentName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 text-xs">📋</span>
            <span className="font-mono text-slate-500 truncate">{complaint.studentEnrollment}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin size={11} className="text-slate-600 flex-shrink-0" />
            <span>{complaint.building} / Floor {complaint.floor} / {complaint.roomNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-slate-600" />
            <span>Assigned {timeSince(complaint.assignment?.assignedAt ?? complaint.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/staff/tasks/${complaint.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <Eye size={13} />
            View Details
          </button>
          <button
            onClick={() => setShowUpdater(p => !p)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
              showUpdater
                ? 'bg-violet-500/30 border border-violet-500/50 text-violet-200'
                : 'border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
            }`}
          >
            {showUpdater ? (
              <>Close <ChevronDown size={13} className="rotate-180" /></>
            ) : (
              <>Update Status <ChevronDown size={13} /></>
            )}
          </button>
        </div>

        {/* Inline Status Updater */}
        <AnimatePresence>
          {showUpdater && (
            <InlineUpdater
              complaint={complaint}
              onUpdate={onUpdate}
              onClose={() => setShowUpdater(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full glass rounded-2xl py-20 flex flex-col items-center justify-center text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
      <CheckSquare size={28} className="text-violet-400" />
    </div>
    <h3 className="text-white font-display font-semibold text-lg mb-2">All Clear! 🎉</h3>
    <p className="text-slate-500 text-sm max-w-sm">
      No tasks matching this filter. Check back later or select "All" to see everything.
    </p>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffTasks = () => {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, updateStatus } = useComplaintStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');

  useMemo(() => { fetchComplaints(); }, []);

  const allData = complaints.length ? complaints : MOCK_COMPLAINTS;

  const myComplaints = useMemo(
    () => allData.filter(c => c.assignment?.staffId === user?.id),
    [allData, user?.id]
  );

  const filtered = useMemo(() => {
    let list = filterStatus === 'all'
      ? myComplaints
      : myComplaints.filter(c =>
          filterStatus === 'pending'
            ? (c.status === 'pending' || c.status === 'assigned')
            : c.status === filterStatus
        );

    list = [...list].sort((a, b) => {
      if (sortKey === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortKey === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.building.localeCompare(b.building);
    });

    return list;
  }, [myComplaints, filterStatus, sortKey]);

  const handleUpdate = async (id: string, status: ComplaintStatus, remarks: string) => {
    await updateStatus(id, status, remarks, user?.name ?? 'Staff');
    toast.success(`✅ Status updated to "${status.replace('_', ' ')}"`);
  };

  const FILTERS: { key: FilterStatus; label: string; color: string }[] = [
    { key: 'all', label: `All (${myComplaints.length})`, color: '#6366F1' },
    { key: 'pending', label: `Pending (${myComplaints.filter(c => c.status === 'pending' || c.status === 'assigned').length})`, color: '#FBBF24' },
    { key: 'in_progress', label: `In Progress (${myComplaints.filter(c => c.status === 'in_progress').length})`, color: '#F97316' },
    { key: 'resolved', label: `Resolved (${myComplaints.filter(c => c.status === 'resolved').length})`, color: '#10B981' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}
          >
            <CheckSquare size={20} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              My Tasks
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-sm px-3 py-1 rounded-full font-mono font-normal"
                style={{ background: '#6366F122', color: '#818CF8', border: '1px solid #6366F144' }}
              >
                {myComplaints.length}
              </motion.span>
            </h1>
            <p className="text-slate-500 text-sm">All complaints assigned to you</p>
          </div>
        </div>
      </div>

      {/* Filters & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <motion.button
              key={f.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(f.key)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all border ${
                filterStatus === f.key
                  ? 'shadow-sm'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-white/3'
              }`}
              style={filterStatus === f.key ? {
                background: `${f.color}22`, color: f.color, borderColor: `${f.color}55`,
              } : {}}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAsc size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">Sort by:</span>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="input-glass text-xs py-1.5 px-3 h-auto cursor-pointer"
          >
            <option value="priority">Priority</option>
            <option value="date">Date</option>
            <option value="building">Building</option>
          </select>
        </div>
      </div>

      {/* Task Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((c, i) => (
              <TaskCard
                key={c.id}
                complaint={c}
                index={i}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default StaffTasks;
