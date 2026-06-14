import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, User, Building2,
  CheckCircle, Loader, Upload, FileText, AlertTriangle,
  MessageSquare, Send, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { Complaint, ComplaintStatus, ComplaintUpdate } from '../../types';
import { MOCK_COMPLAINTS } from '../../data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${Math.floor(diff / 60_000)}m ago`;
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#FBBF24',
  assigned: '#6366F1',
  in_progress: '#F59E0B',
  resolved: '#10B981',
  closed: '#94A3B8',
};

const ROLE_COLORS: Record<string, string> = {
  student: '#2563EB',
  staff: '#7C3AED',
  admin: '#06B6D4',
};

// ─── Timeline Item ────────────────────────────────────────────────────────────
const TimelineItem = ({ update, isLast }: { update: ComplaintUpdate; isLast: boolean }) => {
  const color = STATUS_COLORS[update.newStatus] ?? '#6366F1';
  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0"
          style={{ background: `${color}22`, border: `2px solid ${color}` }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        </motion.div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: `${color}30`, minHeight: 32 }} />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${ROLE_COLORS[update.updatedByRole]}22`, color: ROLE_COLORS[update.updatedByRole] }}
              >
                {update.updatedByName}
              </span>
              <ChevronRight size={12} className="text-slate-600" />
              <StatusBadge status={update.newStatus} />
            </div>
            <span className="text-xs text-slate-500">{formatDateTime(update.createdAt)}</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{update.remarks}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Chat Remark ──────────────────────────────────────────────────────────────
const ChatBubble = ({ update, isStaff }: { update: ComplaintUpdate; isStaff: boolean }) => {
  const color = ROLE_COLORS[update.updatedByRole] ?? '#6366F1';
  return (
    <motion.div
      initial={{ opacity: 0, x: isStaff ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 ${isStaff ? 'flex-row-reverse' : ''}`}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      >
        {update.updatedByName.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div className={`max-w-[75%] ${isStaff ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{update.updatedByName}</span>
          <span className="text-xs text-slate-600">{timeSince(update.createdAt)}</span>
        </div>
        <div
          className="px-4 py-3 rounded-2xl text-sm text-white leading-relaxed"
          style={{
            background: isStaff ? `${color}25` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isStaff ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
            borderRadius: isStaff ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          }}
        >
          {update.remarks}
        </div>
        <StatusBadge status={update.newStatus} />
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { complaints, updateStatus } = useComplaintStore();

  const allData = complaints.length ? complaints : MOCK_COMPLAINTS;
  const complaint = allData.find(c => c.id === id);

  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status ?? 'in_progress');
  const [remarks, setRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSimulate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUploading(false);
    setFileUploaded(file.name);
    toast.success('Evidence uploaded successfully!');
  };

  const handleSubmit = async () => {
    if (!complaint) return;
    if (!remarks.trim()) { toast.error('Remarks are required'); return; }
    setSubmitting(true);
    await updateStatus(complaint.id, newStatus, remarks, user?.name ?? 'Staff');
    setSubmitting(false);
    toast.success(`✅ Status updated to "${newStatus.replace('_', ' ')}"`);
    setRemarks('');
    setResolutionNotes('');
    setFileUploaded(null);
  };

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="glass rounded-2xl py-20 text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-display font-bold text-xl mb-2">Task Not Found</h2>
          <p className="text-slate-500 mb-6">The complaint ID "{id}" doesn't exist.</p>
          <button onClick={() => navigate('/staff/tasks')} className="btn-primary">
            Back to Tasks
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const sortedUpdates = [...complaint.updates].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <DashboardLayout>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/staff/tasks')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Tasks</span>
      </motion.button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ─── Left / Main Column ─────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Complaint Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{complaint.categoryIcon}</span>
                  <span className="text-xs font-mono text-violet-400">{complaint.complaintNo}</span>
                </div>
                <h1 className="text-xl font-display font-bold text-white leading-snug mb-3">
                  {complaint.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: '#6366F122', color: '#818CF8', border: '1px solid #6366F144' }}
                  >
                    {complaint.categoryName}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">{complaint.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="glass p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin size={11} /> Location
                </p>
                <p className="text-white font-medium">{complaint.building}</p>
                <p className="text-slate-400 text-xs">Floor {complaint.floor} · {complaint.roomNumber}</p>
              </div>
              <div className="glass p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock size={11} /> Submitted
                </p>
                <p className="text-white text-xs">{formatDateTime(complaint.createdAt)}</p>
              </div>
              {complaint.expectedResolution && (
                <div className="glass p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                    <CheckCircle size={11} /> Expected
                  </p>
                  <p className="text-white text-xs">{formatDateTime(complaint.expectedResolution)}</p>
                </div>
              )}
            </div>

            {/* Location Map Placeholder */}
            <div className="mt-4 rounded-xl overflow-hidden relative h-28"
              style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                <MapPin size={24} className="mb-1 text-violet-500/50" />
                <p className="text-xs">Campus Map · {complaint.building}</p>
                <p className="text-xs opacity-60">Floor {complaint.floor} · {complaint.roomNumber}</p>
              </div>
              {/* Fake map grid */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6366F1" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </motion.div>

          {/* Status Update Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
              <CheckCircle size={18} className="text-violet-400" />
              Update Status
            </h2>

            <div className="space-y-4">
              {/* Current → New Status */}
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Current</p>
                  <StatusBadge status={complaint.status} />
                </div>
                <ChevronRight size={16} className="text-slate-600 mt-4" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5">New Status</p>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                    className="input-glass text-sm py-2 cursor-pointer w-full max-w-[200px]"
                  >
                    <option value="assigned">✅ Accepted</option>
                    <option value="in_progress">🔧 In Progress</option>
                    <option value="resolved">🎉 Resolved</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                  Remarks *
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Describe the action taken or current status..."
                  className="input-glass w-full resize-none text-sm"
                />
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                  Resolution Notes (optional)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional resolution details, materials used, etc."
                  className="input-glass w-full resize-none text-sm"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                  Evidence Upload (optional)
                </label>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileSimulate} accept="image/*,video/*,.pdf" />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border border-dashed border-white/15 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader size={20} className="text-violet-400 animate-spin" />
                      <span className="text-sm text-slate-400">Uploading...</span>
                    </>
                  ) : fileUploaded ? (
                    <>
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm text-green-400">{fileUploaded}</span>
                      <span className="text-xs text-slate-500">Click to replace</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-500" />
                      <span className="text-sm text-slate-400">Upload completion evidence</span>
                      <span className="text-xs text-slate-600">Images, videos, or PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {submitting ? (
                  <><Loader size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Update</>
                )}
              </button>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Clock size={18} className="text-violet-400" />
              Timeline
            </h2>

            {/* Submitted event */}
            <div className="flex gap-4 mb-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#6366F122', border: '2px solid #6366F1' }}>
                  <FileText size={13} className="text-indigo-400" />
                </div>
                {sortedUpdates.length > 0 && <div className="w-px flex-1 mt-1" style={{ background: '#6366F130', minHeight: 32 }} />}
              </div>
              <div className="pb-6 flex-1">
                <div className="glass p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-indigo-400 font-semibold">Complaint Submitted</span>
                    <span className="text-xs text-slate-500">{formatDateTime(complaint.createdAt)}</span>
                  </div>
                  <p className="text-slate-400 text-sm">by {complaint.studentName} ({complaint.studentEnrollment})</p>
                </div>
              </div>
            </div>

            {sortedUpdates.map((u, i) => (
              <TimelineItem key={u.id} update={u} isLast={i === sortedUpdates.length - 1} />
            ))}

            {sortedUpdates.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No updates yet</p>
            )}
          </motion.div>

          {/* Chat-style Remarks */}
          {sortedUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-display font-bold text-white text-lg mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-violet-400" />
                Remarks History
              </h2>
              <div className="space-y-4">
                {sortedUpdates.map(u => (
                  <ChatBubble
                    key={u.id}
                    update={u}
                    isStaff={u.updatedByRole === 'staff'}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Right Sidebar ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Student Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={13} /> Student Info
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
              >
                {complaint.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{complaint.studentName}</p>
                <p className="text-xs font-mono text-slate-500">{complaint.studentEnrollment}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID</span>
                <span className="text-slate-300 font-mono text-xs">{complaint.studentId}</span>
              </div>
            </div>
          </motion.div>

          {/* Location Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={13} /> Location
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Building</span>
                <span className="text-white font-medium">{complaint.building}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Floor</span>
                <span className="text-white">{complaint.floor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room</span>
                <span className="text-white">{complaint.roomNumber}</span>
              </div>
              {complaint.locationNotes && (
                <div className="pt-2 border-t border-white/8">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-slate-300 text-xs">{complaint.locationNotes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assignment Info */}
          {complaint.assignment && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Assignment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned to</span>
                  <span className="text-violet-300 font-medium">{complaint.assignment.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned at</span>
                  <span className="text-slate-300 text-xs">{timeSince(complaint.assignment.assignedAt)}</span>
                </div>
                {complaint.assignment.notes && (
                  <div className="pt-2 border-t border-white/8">
                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                    <p className="text-slate-300 text-xs">{complaint.assignment.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI Summary */}
          {complaint.aiSummary && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5"
              style={{ border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                ✨ AI Summary
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{complaint.aiSummary}</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetail;
