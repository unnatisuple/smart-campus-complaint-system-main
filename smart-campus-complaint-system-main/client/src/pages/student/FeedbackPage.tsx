import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { MOCK_COMPLAINTS } from '../../data/mockData';
import { StatusBadge } from '../../components/ui/Badge';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const FeedbackPage = () => {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<Record<string, number>>({});

  const resolvedComplaints = MOCK_COMPLAINTS.filter(
    (c) => c.studentId === user?.id && c.status === 'resolved'
  );

  const handleSubmitFeedback = async (complaintId: string) => {
    if (!ratings[complaintId]) {
      toast.error('Please select a rating first');
      return;
    }
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted((prev) => ({ ...prev, [complaintId]: true }));
    toast.success('Thank you for your feedback! 🌟');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Feedback</h1>
          <p className="text-slate-400 text-sm">Rate resolved complaints to help us improve</p>
        </div>

        {resolvedComplaints.length === 0 ? (
          <div className="empty-state glass rounded-2xl">
            <div className="empty-state-icon">
              <Star size={32} />
            </div>
            <h3 className="font-display text-xl font-semibold text-white">No resolved complaints yet</h3>
            <p className="text-slate-500 text-sm">Once your complaints are resolved, you can rate them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resolvedComplaints.map((complaint, i) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500">{complaint.complaintNo}</span>
                      <StatusBadge status="resolved" />
                    </div>
                    <h3 className="font-semibold text-white">{complaint.title}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Resolved {complaint.resolvedAt ? formatDistanceToNow(new Date(complaint.resolvedAt), { addSuffix: true }) : 'recently'}
                    </p>
                  </div>
                  <Link to={`/student/complaints/${complaint.id}`} className="text-primary text-xs hover:text-accent">
                    View →
                  </Link>
                </div>

                {submitted[complaint.id] ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    <CheckCircle size={20} color="#10B981" />
                    <div>
                      <p className="text-green-400 text-sm font-medium">Feedback Submitted!</p>
                      <p className="text-slate-400 text-xs">You rated this {ratings[complaint.id]} stars. Thank you!</p>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    {/* Star Rating */}
                    <p className="text-sm text-slate-400 mb-3">How satisfied are you with the resolution?</p>
                    <div className="star-rating mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="star"
                          onClick={() => setRatings((prev) => ({ ...prev, [complaint.id]: star }))}
                          onMouseEnter={() => setHovered((prev) => ({ ...prev, [complaint.id]: star }))}
                          onMouseLeave={() => setHovered((prev) => ({ ...prev, [complaint.id]: 0 }))}
                          style={{
                            color: star <= (hovered[complaint.id] || ratings[complaint.id] || 0) ? '#FBBF24' : 'rgba(255,255,255,0.2)',
                            filter: star <= (hovered[complaint.id] || ratings[complaint.id] || 0) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    {/* Comment */}
                    <textarea
                      className="input-glass mb-3"
                      rows={3}
                      placeholder="Share your experience (optional)..."
                      value={comments[complaint.id] || ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                      style={{ resize: 'none' }}
                    />

                    <button
                      className="btn-primary py-2.5 px-6 text-sm"
                      onClick={() => handleSubmitFeedback(complaint.id)}
                    >
                      <Star size={14} />
                      Submit Feedback
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeedbackPage;
