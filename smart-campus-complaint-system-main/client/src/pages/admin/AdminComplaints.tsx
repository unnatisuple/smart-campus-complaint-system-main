import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, User, ShieldAlert,
  CheckCircle, Circle, MapPin, Building, Mail, Phone,
  Sparkles, Award, FileText, Send, Eye, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useComplaintStore } from '../../store/complaintStore';
import { useAuthStore } from '../../store/authStore';
import { MOCK_STAFF } from '../../data/mockData';
import { Complaint, ComplaintStatus, Priority } from '../../types';

const TIMELINE_STEPS: { status: ComplaintStatus; label: string; icon: JSX.Element }[] = [
  { status: 'pending', label: 'Submitted', icon: <Circle size={14} /> },
  { status: 'assigned', label: 'Assigned', icon: <User size={14} /> },
  { status: 'in_progress', label: 'In Progress', icon: <Clock size={14} /> },
  { status: 'resolved', label: 'Resolved', icon: <CheckCircle size={14} /> },
  { status: 'closed', label: 'Closed', icon: <CheckCircle size={14} /> },
];

const STATUS_ORDER: Record<ComplaintStatus, number> = {
  pending: 0, assigned: 1, in_progress: 2, resolved: 3, closed: 4
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

const getMatchScore = (complaint: Complaint, staffId: string): number => {
  const staff = MOCK_STAFF.find(s => s.id === staffId);
  if (!staff) return 0;
  const match = staff.expertise.some(e => e.toLowerCase().includes(complaint.categoryName.toLowerCase()) ||
    complaint.categoryName.toLowerCase().includes(e.toLowerCase()));
  const workloadPenalty = Math.min(staff.assignedCount * 5, 30);
  return match ? Math.max(95 - workloadPenalty, 60) : Math.max(60 - workloadPenalty, 30);
};

export default function AdminComplaints() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { complaints, fetchComplaints, assignStaff, updateStatus } = useComplaintStore();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [statusVal, setStatusVal] = useState<ComplaintStatus>('pending');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (id && complaints.length > 0) {
      const match = complaints.find(c => c.id === id);
      if (match) {
        setComplaint(match);
        setStatusVal(match.status);
        if (match.assignment) {
          setSelectedStaff(match.assignment.staffId);
        }
      }
    }
  }, [id, complaints]);

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
          <p>Loading complaint details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = async () => {
    try {
      await updateStatus(complaint.id, statusVal, `Status updated to ${statusVal} by Administrator.`, 'Admin');
      toast.success(`Status updated to ${statusVal}!`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (priority: Priority) => {
    // Simulated store extension or status update remark for priority
    toast.success(`Priority updated to ${priority}!`);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;
    const staff = MOCK_STAFF.find(s => s.id === selectedStaff)!;
    try {
      await assignStaff(complaint.id, staff.id, staff.name, staff.email);
      toast.success(`Assigned to ${staff.name} successfully!`);
    } catch {
      toast.error('Assignment failed');
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setSubmittingRemark(true);
    try {
      await updateStatus(complaint.id, complaint.status, remarkText, 'Admin');
      toast.success('Remark added!');
      setRemarkText('');
    } catch {
      toast.error('Failed to add remark');
    } finally {
      setSubmittingRemark(false);
    }
  };

  const currentStep = STATUS_ORDER[complaint.status];

  // Compute best matching staff for recommendations
  const sortedStaffSuggestions = MOCK_STAFF.map(s => ({
    staff: s,
    score: getMatchScore(complaint, s.id)
  })).sort((a, b) => b.score - a.score);

  return (
    <DashboardLayout>
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-sm">
          <Link to="/admin/dashboard" className="text-slate-500 hover:text-indigo-400 text-decoration-none">Admin</Link>
          <span className="text-slate-600 mx-2">&gt;</span>
          <Link to="/admin/complaints" className="text-slate-500 hover:text-indigo-400 text-decoration-none">Complaints</Link>
          <span className="text-slate-600 mx-2">&gt;</span>
          <span className="text-slate-300 font-mono">{complaint.complaintNo}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="glass p-6 relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-md">{complaint.complaintNo}</span>
                <h2 className="font-display text-2xl font-bold text-white mt-3">{complaint.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{complaint.categoryIcon} {complaint.categoryName}</span>
                  <span>&bull;</span>
                  <span>Submitted {formatDateTime(complaint.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <hr className="border-white/10 my-4" />

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.media && complaint.media.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Attachments</h4>
                <div className="grid grid-cols-4 gap-3">
                  {complaint.media.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setLightboxImg(m.url)}
                      className="aspect-square rounded-lg border border-white/10 overflow-hidden cursor-pointer relative group"
                    >
                      <img src={m.url} alt="Attachment" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye size={16} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-6">Status Tracking Timeline</h3>
            <div className="relative pl-6 border-l border-white/10 space-y-8">
              {TIMELINE_STEPS.map((step, idx) => {
                const isActive = complaint.status === step.status;
                const isPassed = STATUS_ORDER[complaint.status] >= idx;
                
                // Try to find historical updates matching status
                const historyUpdate = complaint.updates.find(u => u.newStatus === step.status);

                return (
                  <div key={step.status} className="relative">
                    {/* Circle bullet */}
                    <div
                      style={{
                        position: 'absolute', left: -32, top: 2,
                        width: 14, height: 14, borderRadius: '50%',
                        background: isActive ? '#3B82F6' : isPassed ? '#10B981' : '#1E293B',
                        border: `3px solid ${isActive ? '#60A5FA' : isPassed ? '#34D399' : '#334155'}`,
                        boxShadow: isActive ? '0 0 10px #3B82F6' : 'none'
                      }}
                      className={isActive ? 'animate-pulse' : ''}
                    />
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <span className={`text-sm font-semibold ${isActive ? 'text-blue-400' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                        {historyUpdate && (
                          <span className="text-xs text-slate-500">{formatDateTime(historyUpdate.createdAt)}</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        {historyUpdate ? historyUpdate.remarks : `Stage ${idx + 1}: ${step.label} state.`}
                      </p>
                      {historyUpdate && (
                        <p className="text-slate-500 text-xxs mt-0.5">By {historyUpdate.updatedByName} ({historyUpdate.updatedByRole})</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks / Conversation Updates */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-4">Timeline Updates & Remarks</h3>
            
            <div className="space-y-4 mb-6">
              {complaint.updates.filter(u => u.remarks).map(u => (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="p-4 rounded-xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs flex-shrink-0">
                    {u.updatedByName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">{u.updatedByName} <span className="text-slate-500 font-normal">({u.updatedByRole})</span></span>
                      <span className="text-xxs text-slate-500">{formatDateTime(u.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{u.remarks}</p>
                  </div>
                </div>
              ))}
              {complaint.updates.filter(u => u.remarks).length === 0 && (
                <p className="text-slate-500 text-sm italic">No custom remarks added yet.</p>
              )}
            </div>

            <form onSubmit={handleAddRemark} className="flex gap-2">
              <input
                className="input-glass pl-4 py-2 flex-1 text-sm h-11"
                placeholder="Add remark or staff update..."
                value={remarkText}
                onChange={e => setRemarkText(e.target.value)}
              />
              <button
                type="submit"
                disabled={submittingRemark || !remarkText.trim()}
                style={{ background: 'linear-gradient(90deg, #2563EB, #06B6D4)', border: 'none', color: '#fff' }}
                className="px-4 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Administration Controls */}
        <div className="space-y-6">
          
          {/* Quick Action Controller */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-4">Administration Actions</h3>
            
            {/* Status updates */}
            <div className="space-y-3">
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Set Status</label>
                <div className="flex gap-2">
                  <select
                    className="input-glass py-2 px-3 text-sm flex-1 text-white"
                    value={statusVal}
                    onChange={e => setStatusVal(e.target.value as ComplaintStatus)}
                  >
                    <option value="pending" className="bg-[#0f172a]">Pending</option>
                    <option value="assigned" className="bg-[#0f172a]">Assigned</option>
                    <option value="in_progress" className="bg-[#0f172a]">In Progress</option>
                    <option value="resolved" className="bg-[#0f172a]">Resolved</option>
                    <option value="closed" className="bg-[#0f172a]">Closed</option>
                  </select>
                  <button
                    onClick={handleStatusChange}
                    style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}
                    className="px-4 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Priority buttons */}
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Set Priority</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => {
                    const isSel = complaint.priority === p;
                    const colors = {
                      low: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
                      medium: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
                      high: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
                      critical: 'border-red-500/30 text-red-400 bg-red-500/10'
                    };
                    return (
                      <button
                        key={p}
                        onClick={() => handlePriorityChange(p)}
                        className={`py-1.5 px-2 rounded-lg text-xxs font-medium border text-center capitalize cursor-pointer transition-all hover:scale-102 ${isSel ? colors[p] : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Smart Assignment Section */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">Smart Assignment</h3>
              <div style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', fontSize: 9 }} className="px-2 py-0.5 rounded-full text-white font-bold flex items-center gap-1">
                <Sparkles size={8} /> AI RANK
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Assign Staff Member</label>
              <select
                className="input-glass w-full py-2.5 px-3 text-sm text-white"
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
              >
                <option value="" className="bg-[#0f172a]">-- Select Staff --</option>
                {MOCK_STAFF.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#0f172a]">
                    {s.name} ({s.expertise.join(', ')})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignStaff}
                disabled={!selectedStaff}
                style={{ width: '100%', background: 'linear-gradient(90deg, #2563EB, #06B6D4)', border: 'none' }}
                className="py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Assign Staff
              </button>
            </div>

            {/* Recommendations stack */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider block">Staff Match Recommendations</span>
              {sortedStaffSuggestions.slice(0, 3).map((sug, i) => (
                <div key={sug.staff.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} className="p-3 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 font-semibold">{sug.staff.name}</span>
                      {i === 0 && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xxs px-1 py-0.2 rounded font-bold">BEST</span>}
                    </div>
                    <span className="text-slate-500 text-xxs block mt-0.5">{sug.staff.expertise.join(', ')}</span>
                    <span className="text-slate-500 text-xxs block mt-0.5">{sug.staff.assignedCount} active tasks</span>
                  </div>
                  <div className="text-right">
                    <span style={{ color: sug.score >= 80 ? '#10B981' : sug.score >= 60 ? '#FBBF24' : '#EF4444' }} className="font-bold block">{sug.score}%</span>
                    <button
                      onClick={async () => {
                        setSelectedStaff(sug.staff.id);
                        await assignStaff(complaint.id, sug.staff.id, sug.staff.name, sug.staff.email);
                        toast.success(`Assigned to ${sug.staff.name}!`);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border-none bg-none p-0 mt-1 block"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Info Card */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-4">Student Details</h3>
            <div className="space-y-3.5">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                  {complaint.studentName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{complaint.studentName}</p>
                  <p className="text-xxs font-mono text-indigo-400 mt-0.5">{complaint.studentEnrollment || 'Enrollment N/A'}</p>
                </div>
              </div>
              <hr className="border-white/10" />
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building size={14} className="text-slate-500" />
                  <span>Academic Details: CSE, Year 3</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={14} className="text-slate-500" />
                  <span>Location: {complaint.building} / Floor {complaint.floor} / Room {complaint.roomNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-slate-500" />
                  <a href={`mailto:student@campus.edu`} className="text-slate-300 hover:text-indigo-400">{complaint.studentEmail || 'student@campus.edu'}</a>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={14} className="text-slate-500" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={!!lightboxImg} onClose={() => setLightboxImg(null)} size="lg">
        {lightboxImg && (
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white"
            >
              <X size={16} />
            </button>
            <img src={lightboxImg} alt="Attachment Full Size" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
