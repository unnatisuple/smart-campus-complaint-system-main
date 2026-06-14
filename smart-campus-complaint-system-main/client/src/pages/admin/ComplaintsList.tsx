import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, UserPlus, ChevronUp, ChevronDown,
  AlertTriangle, CheckCircle2, Clock, FileText, MoreVertical,
  ChevronLeft, ChevronRight, X, ArrowUpDown, ShieldAlert, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useComplaintStore } from '../../store/complaintStore';
import { MOCK_STAFF } from '../../data/mockData';
import { Complaint, ComplaintStatus, Priority } from '../../types';

const PAGE_SIZE = 10;
type SortKey = 'complaintNo' | 'title' | 'studentName' | 'priority' | 'status' | 'createdAt';

const STATUSES: ComplaintStatus[] = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export default function ComplaintsList() {
  const { complaints, fetchComplaints, assignStaff, updateStatus } = useComplaintStore();
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ComplaintStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; complaint: Complaint | null }>({
    open: false, complaint: null
  });
  const [bulkAssignModal, setBulkAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.categoryName)));
  }, [complaints]);

  const toggleStatus = (s: ComplaintStatus) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setPage(1);
  };

  const togglePriority = (p: Priority) => {
    setSelectedPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    return complaints
      .filter(c => {
        const matchSearch = !search ||
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.complaintNo.toLowerCase().includes(search.toLowerCase()) ||
          c.studentName.toLowerCase().includes(search.toLowerCase()) ||
          (c.studentEnrollment && c.studentEnrollment.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(c.status);
        const matchPriority = selectedPriorities.length === 0 || selectedPriorities.includes(c.priority);
        const matchCategory = categoryFilter === 'all' || c.categoryName === categoryFilter;
        const matchFrom = !dateFrom || new Date(c.createdAt) >= new Date(dateFrom);
        const matchTo = !dateTo || new Date(c.createdAt) <= new Date(dateTo + 'T23:59:59');
        return matchSearch && matchStatus && matchPriority && matchCategory && matchFrom && matchTo;
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortKey) {
          case 'priority': {
            const po = { critical: 4, high: 3, medium: 2, low: 1 };
            return dir * (po[a.priority] - po[b.priority]);
          }
          case 'status':
            return dir * a.status.localeCompare(b.status);
          case 'createdAt':
            return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          default:
            return dir * (a[sortKey] || '').localeCompare(b[sortKey] || '');
        }
      });
  }, [complaints, search, selectedStatuses, selectedPriorities, categoryFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(c => c.id));
  };

  const handleAssign = async () => {
    if (!assignModal.complaint || !selectedStaff) return;
    setAssigning(true);
    const staff = MOCK_STAFF.find(s => s.id === selectedStaff)!;
    try {
      await assignStaff(assignModal.complaint.id, staff.id, staff.name, staff.email);
      toast.success(`Assigned complaint to ${staff.name}`);
      setAssignModal({ open: false, complaint: null });
      setSelectedStaff('');
    } catch {
      toast.error('Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedStaff || selectedIds.length === 0) return;
    setAssigning(true);
    const staff = MOCK_STAFF.find(s => s.id === selectedStaff)!;
    try {
      for (const id of selectedIds) {
        await assignStaff(id, staff.id, staff.name, staff.email);
      }
      toast.success(`Assigned ${selectedIds.length} complaints to ${staff.name}`);
      setBulkAssignModal(false);
      setSelectedIds([]);
      setSelectedStaff('');
    } catch {
      toast.error('Bulk assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setOpenMenu(null);
    const comp = complaints.find(c => c.id === id);
    if (!comp) return;

    if (action === 'escalate') {
      await updateStatus(id, 'in_progress', 'Escalated to senior administration by Admin.', 'Admin Portal');
      toast.success('Complaint escalated successfully');
    } else if (action === 'close') {
      await updateStatus(id, 'closed', 'Complaint closed by Admin.', 'Admin Portal');
      toast.success('Complaint closed successfully');
    } else if (action === 'assign') {
      setAssignModal({ open: true, complaint: comp });
    }
  };

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length,
      resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    };
  }, [complaints]);

  const SortButton = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="ml-1 focus:outline-none" style={{ color: sortKey === col ? '#818CF8' : '#475569' }}>
      <ArrowUpDown size={12} className="inline" />
    </button>
  );

  const STATUS_LABEL: Record<ComplaintStatus, string> = {
    pending: 'Pending', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed'
  };
  const PRIORITY_COLORS: Record<Priority, string> = {
    critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#10B981'
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <motion.h1 className="font-display text-3xl font-bold text-white" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Complaint Management
          </motion.h1>
          <p className="text-slate-400 text-sm mt-1">Full oversight and management of all complaints</p>
        </div>
        <button
          onClick={() => toast('Exporting data...', { icon: '📊' })}
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats Bar */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {[
          { label: 'Total', value: stats.total, color: '#6366F1', icon: <FileText size={16} /> },
          { label: 'Pending', value: stats.pending, color: '#FBBF24', icon: <Clock size={16} /> },
          { label: 'Active Tasks', value: stats.inProgress, color: '#F59E0B', icon: <AlertTriangle size={16} /> },
          { label: 'Completed', value: stats.resolved, color: '#10B981', icon: <CheckCircle2 size={16} /> },
        ].map((s) => (
          <div key={s.label} style={{ background: `${s.color}11`, border: `1px solid ${s.color}33`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <p style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</p>
              <p style={{ color: '#64748B', fontSize: 12 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters Card */}
      <motion.div className="glass p-5 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-glass pl-8 pr-4 py-2.5 text-sm w-full" placeholder="Search ID, student, details..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-glass py-2.5 px-3 text-sm" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" className="input-glass py-2.5 px-3 text-sm" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} placeholder="From date" style={{ colorScheme: 'dark' }} />
          <input type="date" className="input-glass py-2.5 px-3 text-sm" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} placeholder="To date" style={{ colorScheme: 'dark' }} />
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span style={{ color: '#64748B', fontSize: 12, marginRight: 4 }}>Status:</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => toggleStatus(s)}
              style={{ borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${selectedStatuses.includes(s) ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`, background: selectedStatuses.includes(s) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: selectedStatuses.includes(s) ? '#818CF8' : '#94A3B8', transition: 'all 0.2s' }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
          {selectedStatuses.length > 0 && <button onClick={() => setSelectedStatuses([])} style={{ color: '#EF4444', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} className="inline mr-1" /> Clear</button>}
        </div>

        {/* Priority pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ color: '#64748B', fontSize: 12, marginRight: 4 }}>Priority:</span>
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => togglePriority(p)}
              style={{ borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${selectedPriorities.includes(p) ? `${PRIORITY_COLORS[p]}88` : 'rgba(255,255,255,0.1)'}`, background: selectedPriorities.includes(p) ? `${PRIORITY_COLORS[p]}22` : 'rgba(255,255,255,0.04)', color: selectedPriorities.includes(p) ? PRIORITY_COLORS[p] : '#94A3B8', transition: 'all 0.2s', textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
          {selectedPriorities.length > 0 && <button onClick={() => setSelectedPriorities([])} style={{ color: '#EF4444', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} className="inline mr-1" /> Clear</button>}
        </div>
      </motion.div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}
          >
            <span style={{ color: '#818CF8', fontSize: 14, fontWeight: 500 }}>{selectedIds.length} complaint{selectedIds.length > 1 ? 's' : ''} selected</span>
            <div className="flex gap-3">
              <button onClick={() => setBulkAssignModal(true)}
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818CF8', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <UserPlus size={14} /> Assign Selected
              </button>
              <button onClick={() => setSelectedIds([])}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Card */}
      <motion.div className="glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '14px 16px', width: 40 }}>
                  <input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6366F1' }} />
                </th>
                {([['complaintNo', 'ID'], ['title', 'Title/Student'], ['categoryName', 'Category'], ['priority', 'Priority'], ['status', 'Status'], ['assignment', 'Assigned To'], ['createdAt', 'Created'], ['', 'Actions']] as [SortKey | '', string][]).map(([col, label]) => (
                  <th key={label} style={{ padding: '14px 16px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {label}
                    {col && <SortButton col={col as SortKey} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedIds.includes(c.id) ? 'rgba(99,102,241,0.06)' : 'transparent' }}
                  className="hover:bg-white/3 transition-colors relative"
                >
                  <td style={{ padding: '14px 16px' }}>
                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6366F1' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#818CF8', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 6 }}>{c.complaintNo}</span>
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                    <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                    <p style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{c.studentName} &bull; {c.studentEnrollment || 'N/A'}</p>
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
                  <td style={{ padding: '14px 16px', position: 'relative' }}>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/complaints/${c.id}`} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#CBD5E1', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>
                        <Eye size={13} className="inline mr-1" /> View
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === c.id && (
                          <div style={{
                            position: 'absolute', right: 0, top: '100%', zIndex: 50,
                            background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', borderRadius: 8,
                            padding: '6px', minWidth: 140, backdropFilter: 'blur(16px)'
                          }}>
                            <button onClick={() => handleAction(c.id, 'assign')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#E2E8F0', padding: '6px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer' }} className="hover:bg-white/5">
                              Assign Staff
                            </button>
                            <button onClick={() => handleAction(c.id, 'escalate')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#F59E0B', padding: '6px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer' }} className="hover:bg-white/5">
                              Escalate Task
                            </button>
                            <button onClick={() => handleAction(c.id, 'close')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#EF4444', padding: '6px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer' }} className="hover:bg-white/5">
                              Close Issue
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>No complaints found matching filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
          <span style={{ color: '#64748B', fontSize: 12 }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: page === 1 ? '#475569' : '#CBD5E1', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} className="inline mr-1" /> Prev
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: page === totalPages ? '#475569' : '#CBD5E1', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Assign Modal */}
      <Modal isOpen={assignModal.open} onClose={() => { setAssignModal({ open: false, complaint: null }); setSelectedStaff(''); }} title="Assign Staff" size="md">
        {assignModal.complaint && (
          <div className="space-y-4">
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14 }}>
              <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Complaint ID</p>
              <p style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>{assignModal.complaint.complaintNo}</p>
              <p style={{ color: '#CBD5E1', fontSize: 13, marginTop: 4 }}>{assignModal.complaint.title}</p>
            </div>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8, display: 'block' }}>Select Staff Member</label>
              <select className="input-glass w-full py-3 px-4 text-white" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                <option value="">-- Select Staff --</option>
                {MOCK_STAFF.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#0f172a]">
                    {s.name} ({s.expertise.join(', ')}) — {s.assignedCount} active tasks
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleAssign} disabled={!selectedStaff || assigning}
              style={{ width: '100%', background: selectedStaff ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.05)', border: 'none', color: selectedStaff ? '#fff' : '#475569', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: selectedStaff ? 'pointer' : 'not-allowed' }}
            >
              {assigning ? 'Assigning...' : 'Assign Staff'}
            </button>
          </div>
        )}
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal isOpen={bulkAssignModal} onClose={() => { setBulkAssignModal(false); setSelectedStaff(''); }} title="Bulk Assign Staff" size="md">
        <div className="space-y-4">
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14 }}>
            <p style={{ color: '#CBD5E1', fontSize: 13 }}>Assigning <span className="text-indigo-400 font-bold">{selectedIds.length}</span> selected complaints.</p>
          </div>
          <div>
            <label style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8, display: 'block' }}>Select Staff Member</label>
            <select className="input-glass w-full py-3 px-4 text-white" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
              <option value="">-- Select Staff --</option>
              {MOCK_STAFF.map(s => (
                <option key={s.id} value={s.id} className="bg-[#0f172a]">
                  {s.name} ({s.expertise.join(', ')}) — {s.assignedCount} active tasks
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleBulkAssign} disabled={!selectedStaff || assigning}
            style={{ width: '100%', background: selectedStaff ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.05)', border: 'none', color: selectedStaff ? '#fff' : '#475569', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: selectedStaff ? 'pointer' : 'not-allowed' }}
          >
            {assigning ? 'Assigning All...' : 'Assign All Selected'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
