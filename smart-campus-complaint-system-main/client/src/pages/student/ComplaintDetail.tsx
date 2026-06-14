import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Clock, User,
  CheckCircle, Circle, MessageSquare, Star,
  ChevronRight, Image as ImageIcon, X, AlertTriangle,
  Building, Phone, Mail
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useComplaintStore } from '../../store/complaintStore';
import { useAuthStore } from '../../store/authStore';
import { ComplaintStatus } from '../../types';

// ─── Timeline steps ────────────────────────────────────────────────────────────
const TIMELINE_STEPS: { status: ComplaintStatus; label: string; icon: JSX.Element }[] = [
  { status: 'pending',     label: 'Submitted',   icon: <Circle size={14} /> },
  { status: 'assigned',    label: 'Assigned',    icon: <User size={14} /> },
  { status: 'in_progress', label: 'In Progress', icon: <Clock size={14} /> },
  { status: 'resolved',    label: 'Resolved',    icon: <CheckCircle size={14} /> },
  { status: 'closed',      label: 'Closed',      icon: <CheckCircle size={14} /> },
];

const STATUS_ORDER: Record<ComplaintStatus, number> = {
  pending: 0,
  assigned: 1,
  in_progress: 2,
  resolved: 3,
  closed: 4,
};

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Overdue';
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h remaining`;
  return `${hours}h remaining`;
}

// ─── Star Rating Component ─────────────────────────────────────────────────────
const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="transition-colors"
        >
          <Star
            size={24}
            className="transition-all"
            style={{
              fill: star <= (hovered || value) ? '#FBBF24' : 'transparent',
              color: star <= (hovered || value) ? '#FBBF24' : '#4B5563',
              filter: star <= (hovered || value) ? 'drop-shadow(0 0 6px #FBBF2480)' : 'none',
            }}
          />
        </motion.button>
      ))}
    </div>
  );
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#2563EB', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: `${color}30`, border: `2px solid ${color}60`, color }}
    >
      {initials}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { complaints, fetchComplaints } = useComplaintStore();
  const { user } = useAuthStore();

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (complaints.length === 0) fetchComplaints();
  }, [fetchComplaints, complaints.length]);

  const complaint = complaints.find((c) => c.id === id);

  if (complaints.length > 0 && !complaint) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <AlertTriangle size={48} className="text-amber-400" />
          <h2 className="text-xl font-display font-bold text-white">Complaint Not Found</h2>
          <p className="text-slate-400 text-sm">The complaint you are looking for does not exist.</p>
          <Link to="/student/complaints" className="btn-primary px-5 py-2.5 text-sm">
            Back to My Complaints
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="h-8 w-64 rounded-xl bg-white/5 animate-pulse" />
          <div className="glass p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 rounded-lg bg-white/5 animate-pulse" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentStepIdx = STATUS_ORDER[complaint.status];

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return;
    setIsSubmittingFeedback(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmittingFeedback(false);
    setFeedbackSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Back + Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/student/complaints')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft size={16} /> Back to My Complaints
          </button>

          <div className="glass p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">
                    {complaint.complaintNo}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {complaint.categoryIcon} {complaint.categoryName}
                  </span>
                </div>
                <h1 className="text-xl font-display font-bold text-white mb-3">{complaint.title}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={11} /> {formatDate(complaint.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Status Timeline ── */}
        <motion.div
          className="glass p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <ChevronRight size={16} className="text-blue-400" /> Complaint Progress
          </h2>

          <div className="flex items-start">
            {TIMELINE_STEPS.map((step, i) => {
              const isDone = i < currentStepIdx;
              const isActive = i === currentStepIdx;
              const isFuture = i > currentStepIdx;

              // Find update for this step
              const stepUpdate = complaint.updates.find((u) => u.newStatus === step.status);

              return (
                <div key={step.status} className="flex flex-col items-center flex-1 relative">
                  {/* Connector line */}
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                      <div className="h-full w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                          animate={{ width: isDone ? '100%' : '0%' }}
                          transition={{ duration: 0.8, delay: i * 0.2 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Circle */}
                  <div className="relative z-10 mb-2">
                    {isActive ? (
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#2563EB20', border: '2px solid #2563EB' }}
                        animate={{ boxShadow: ['0 0 0 0 #2563EB40', '0 0 0 10px transparent'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        animate={{
                          background: isDone ? '#10B98120' : '#ffffff08',
                          borderColor: isDone ? '#10B981' : '#ffffff15',
                          color: isDone ? '#10B981' : '#4B5563',
                        }}
                        style={{ border: '2px solid' }}
                      >
                        {isDone ? <CheckCircle size={14} /> : step.icon}
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={`text-xs font-semibold text-center ${
                      isActive ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Timestamp */}
                  {(isDone || isActive) && (
                    <div className="mt-1 text-center">
                      {stepUpdate && (
                        <p className="text-xs text-slate-600">{timeAgo(stepUpdate.createdAt)}</p>
                      )}
                      {i === 0 && (
                        <p className="text-xs text-slate-600">{timeAgo(complaint.createdAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Info grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Assigned Staff */}
          <div className="glass-sm p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={12} /> Assigned Staff
            </p>
            {complaint.assignment ? (
              <div className="flex items-center gap-3">
                <Avatar name={complaint.assignment.staffName} size="md" />
                <div>
                  <p className="text-sm font-semibold text-white">{complaint.assignment.staffName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail size={10} /> {complaint.assignment.staffEmail}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Assigned {timeAgo(complaint.assignment.assignedAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <Circle size={14} className="text-slate-600" />
                <p className="text-sm">Not yet assigned</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="glass-sm p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin size={12} /> Location
            </p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Building size={12} className="text-slate-500" />
                {complaint.building}
              </p>
              <p className="text-xs text-slate-400">Floor: {complaint.floor}</p>
              <p className="text-xs text-slate-400">Room / Area: {complaint.roomNumber}</p>
              {complaint.locationNotes && (
                <p className="text-xs text-slate-500 mt-1 pt-1 border-t border-white/10">
                  {complaint.locationNotes}
                </p>
              )}
            </div>
          </div>

          {/* Resolution */}
          <div className="glass-sm p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={12} /> Resolution
            </p>
            {complaint.resolvedAt ? (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Resolved on</p>
                <p className="text-sm font-semibold text-emerald-400">
                  {formatDate(complaint.resolvedAt)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400">Successfully resolved</span>
                </div>
              </div>
            ) : complaint.expectedResolution ? (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Expected by</p>
                <p className="text-sm font-semibold text-amber-400">
                  {formatDate(complaint.expectedResolution)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getCountdown(complaint.expectedResolution)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">ETA not set yet</p>
            )}
          </div>
        </motion.div>

        {/* ── Description ── */}
        <motion.div
          className="glass p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-400" /> Description
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>
        </motion.div>

        {/* ── Staff Updates ── */}
        {complaint.updates.length > 0 && (
          <motion.div
            className="glass p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" /> Staff Updates
              <span className="ml-auto text-xs text-slate-500 font-normal">
                {complaint.updates.length} update{complaint.updates.length > 1 ? 's' : ''}
              </span>
            </h2>
            <div className="space-y-4">
              {complaint.updates.map((update, i) => (
                <motion.div
                  key={update.id}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                >
                  <Avatar name={update.updatedByName} size="sm" />
                  <div className="flex-1">
                    <div className="glass-sm rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-white">{update.updatedByName}</span>
                        <span className="text-xs text-slate-600">{timeAgo(update.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300">{update.remarks}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                        <StatusBadge status={update.oldStatus} />
                        <ChevronRight size={12} className="text-slate-600" />
                        <StatusBadge status={update.newStatus} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 ml-2">{formatDate(update.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Image Gallery ── */}
        {complaint.media.length > 0 && (
          <motion.div
            className="glass p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon size={16} className="text-pink-400" /> Attached Media
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {complaint.media.map((m) => (
                <motion.div
                  key={m.id}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxImg(m.url)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={m.url}
                    alt={m.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <ImageIcon
                      size={24}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Feedback Section ── */}
        {(complaint.status === 'resolved' || complaint.status === 'closed') && (
          <motion.div
            className="glass p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Star size={16} className="text-amber-400" /> Rate Your Experience
            </h2>

            <AnimatePresence mode="wait">
              {feedbackSubmitted ? (
                <motion.div
                  key="thank-you"
                  className="text-center py-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <motion.div
                    className="text-4xl mb-3"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    🙏
                  </motion.div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Your rating helps us improve our campus services.
                  </p>
                  <div className="flex justify-center mt-3">
                    <StarRating value={feedbackRating} onChange={() => {}} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="feedback-form" className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-3">
                      How satisfied are you with the resolution of your complaint?
                    </p>
                    <StarRating value={feedbackRating} onChange={setFeedbackRating} />
                    {feedbackRating > 0 && (
                      <p className="text-xs text-amber-400 mt-1 ml-1">
                        {['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][feedbackRating]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">
                      Additional comments (optional)
                    </label>
                    <textarea
                      className="input-glass w-full min-h-[80px] resize-none text-sm"
                      placeholder="Share any additional thoughts or suggestions..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>

                  <motion.button
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackRating === 0 || isSubmittingFeedback}
                    className="btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={feedbackRating > 0 ? { scale: 1.03 } : {}}
                    whileTap={feedbackRating > 0 ? { scale: 0.97 } : {}}
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      <Modal isOpen={!!lightboxImg} onClose={() => setLightboxImg(null)} size="xl">
        {lightboxImg && (
          <div className="text-center">
            <img
              src={lightboxImg}
              alt="Full size"
              className="max-w-full max-h-[70vh] object-contain rounded-xl mx-auto"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="mt-4 px-4 py-2 rounded-lg glass text-sm text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ComplaintDetail;
