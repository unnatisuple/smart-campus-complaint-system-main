import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Plus, Bell, User, LogOut,
  BarChart3, Users, Settings, ClipboardList, History, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

const STUDENT_NAV = [
  { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/student/complaints/new', icon: Plus, label: 'New Complaint' },
  { path: '/student/complaints', icon: FileText, label: 'My Complaints' },
  { path: '/student/notifications', icon: Bell, label: 'Notifications' },
  { path: '/student/feedback', icon: ClipboardList, label: 'Feedback' },
  { path: '/student/profile', icon: User, label: 'Profile' },
];

const STAFF_NAV = [
  { path: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/tasks', icon: CheckSquare, label: 'My Tasks' },
  { path: '/staff/history', icon: History, label: 'History' },
  { path: '/staff/profile', icon: User, label: 'Profile' },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/complaints', icon: FileText, label: 'Complaints' },
  { path: '/admin/students', icon: Users, label: 'Students' },
  { path: '/admin/staff', icon: Users, label: 'Staff' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/reports', icon: ClipboardList, label: 'Reports' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const NAV_MAP: Record<Role, typeof STUDENT_NAV> = {
  student: STUDENT_NAV,
  staff: STAFF_NAV,
  admin: ADMIN_NAV,
};

const ROLE_LABELS: Record<Role, string> = {
  student: 'Student Portal',
  staff: 'Staff Portal',
  admin: 'Admin Portal',
};

const ROLE_COLORS: Record<Role, string> = {
  student: '#2563EB',
  staff: '#7C3AED',
  admin: '#06B6D4',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = NAV_MAP[user.role];
  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ zIndex: 50 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `linear-gradient(135deg, ${roleColor}, #7C3AED)` }}
            >
              🏛️
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Smart Campus</p>
              <p className="text-xs" style={{ color: roleColor }}>{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer mb-2">
            <div
              className="avatar avatar-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${roleColor}, #7C3AED)` }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
