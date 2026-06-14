import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, FileText, Filter,
  ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { ComplaintStatus, Priority } from '../../types';

const PAGE_SIZE = 8;

const STATUS_OPTS: { label: string; value: ComplaintStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const PRIORITY_OPTS: { label: string; value: Priority | 'all' }[] = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${50 + (i * 13) % 50}%` }} />
      </td>
    ))}
  </tr>
);

const ComplaintsList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, isLoading } = useComplaintStore();

  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, search]);

  const myComplaints = complaints
    .filter((c) => c.studentId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = myComplaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.complaintNo.toLowerCase().includes(search.toLowerCase()) &&
      !c.categoryName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-white">My Complaints</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLoading ? 'Loading...' : `${filtered.length} complaint${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowFilters((v) => !v)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm ${
                showFilters
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'glass border-white/10 text-slate-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <SlidersHorizontal size={16} />
              Filters
            </motion.button>
            <motion.button
              onClick={() => navigate('/student/complaints/new')}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} />
              New Complaint
            </motion.button>
          </div>
        </motion.div>

        {/* ── Expanded Filters ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="glass p-4 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-glass pl-9 pr-4 py-2.5 w-full text-sm"
                  placeholder="Search by title, ID, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 flex items-center mr-1">
                  <Filter size={12} className="mr-1" />Status:
                </span>
                {STATUS_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      statusFilter === opt.value
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Priority pills */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 flex items-center mr-1">
                  <Filter size={12} className="mr-1" />Priority:
                </span>
                {PRIORITY_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriorityFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      priorityFilter === opt.value
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick Status Pills (visible when filters collapsed) ── */}
        {!showFilters && (
          <motion.div
            className="flex flex-wrap gap-2 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {STATUS_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  statusFilter === opt.value
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'glass-sm border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-glass pl-8 pr-3 py-1.5 text-xs w-44"
                placeholder="Quick search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>
        )}

        {/* ── Table ── */}
        <motion.div
          className="glass overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['#', 'Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <FileText size={40} className="text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">No complaints found</p>
                      <p className="text-slate-600 text-sm mt-1">
                        {myComplaints.length === 0
                          ? 'You have not submitted any complaints yet.'
                          : 'Try adjusting your filters or search term.'}
                      </p>
                      {myComplaints.length === 0 && (
                        <button
                          onClick={() => navigate('/student/complaints/new')}
                          className="btn-primary mt-4 px-5 py-2.5 text-sm"
                        >
                          Submit First Complaint
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      className="group hover:bg-white/3 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/student/complaints/${c.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600">{(page - 1) * PAGE_SIZE + i + 1}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {c.complaintNo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="max-w-[180px]">
                          <p className="text-sm text-white font-medium truncate">{c.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-400">
                          {c.categoryIcon} {c.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/student/complaints/${c.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors text-xs font-medium w-fit"
                        >
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg glass disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/8 transition-colors"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'glass text-slate-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg glass disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/8 transition-colors"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintsList;
