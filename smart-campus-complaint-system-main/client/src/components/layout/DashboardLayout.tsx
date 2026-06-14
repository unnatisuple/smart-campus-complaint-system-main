import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (n) => n.userId === user?.id && !n.read
  ).length;

  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>
      {/* Background blobs */}
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="main-content relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            className="lg:hidden p-2 rounded-xl glass"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-white" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-4 lg:mx-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-glass pl-10 pr-4 h-10 text-sm"
                placeholder="Search complaints, students... (Cmd+K)"
                readOnly
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-xl glass hover:bg-white/8 transition-colors">
              <Bell size={20} className="text-slate-300" />
              {unreadCount > 0 && (
                <span className="notification-dot" />
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardLayout;
