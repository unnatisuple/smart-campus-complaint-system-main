import { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { Bell, Check, CheckCheck, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationType_Icons: Record<string, { icon: string; color: string }> = {
  complaint_submitted: { icon: '📝', color: '#2563EB' },
  complaint_assigned: { icon: '👤', color: '#7C3AED' },
  status_updated: { icon: '🔄', color: '#F59E0B' },
  complaint_resolved: { icon: '✅', color: '#10B981' },
  new_complaint: { icon: '🆕', color: '#EF4444' },
  feedback_received: { icon: '⭐', color: '#FBBF24' },
};

const NotificationsPage = () => {
  const { user } = useAuthStore();

  const userNotifications = MOCK_NOTIFICATIONS.filter((n) => n.userId === user?.id);
  const unread = userNotifications.filter((n) => !n.read);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Notifications</h1>
            <p className="text-slate-400 text-sm">{unread.length} unread notifications</p>
          </div>
          <button className="btn-ghost py-2 px-4 text-sm flex items-center gap-2">
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>

        {/* Notifications list */}
        {userNotifications.length === 0 ? (
          <div className="empty-state glass rounded-2xl">
            <div className="empty-state-icon">
              <Bell size={32} />
            </div>
            <h3 className="font-display text-xl font-semibold text-white">All Caught Up!</h3>
            <p className="text-slate-500 text-sm">No notifications yet. We'll notify you about your complaints here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userNotifications.map((notification, i) => {
              const config = NotificationType_Icons[notification.type] || { icon: '📢', color: '#94A3B8' };
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-white/8 transition-all ${!notification.read ? 'border-l-2 border-blue-500' : ''}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${config.color}22` }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-sm ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-slate-600 text-xs">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.complaintId && (
                        <Link
                          to={`/student/complaints/${notification.complaintId}`}
                          className="text-xs text-primary hover:text-accent transition-colors"
                        >
                          View Complaint →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
