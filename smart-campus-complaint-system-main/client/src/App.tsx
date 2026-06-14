import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Pages — Lazy loaded for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Student Portal
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const NewComplaint = lazy(() => import('./pages/student/NewComplaint'));
const ComplaintsList = lazy(() => import('./pages/student/ComplaintsList'));
const ComplaintDetail = lazy(() => import('./pages/student/ComplaintDetail'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const FeedbackPage = lazy(() => import('./pages/student/FeedbackPage'));

// Admin Portal
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminComplaintsList = lazy(() => import('./pages/admin/ComplaintsList'));
const AdminComplaintDetail = lazy(() => import('./pages/admin/AdminComplaints'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Staff Portal
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffTasks = lazy(() => import('./pages/staff/StaffTasks'));
const TaskDetail = lazy(() => import('./pages/staff/TaskDetail'));
const StaffProfile = lazy(() => import('./pages/staff/StaffProfile'));

// Loading fallback
const PageLoader = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-6"
    style={{ background: '#0A0F1E' }}
  >
    <div className="relative">
      <div className="text-5xl animate-spin-slow">🏛️</div>
    </div>
    <div className="w-48 progress-bar">
      <div className="progress-fill animate-pulse" style={{ width: '70%' }} />
    </div>
    <p className="text-slate-500 text-sm font-mono">Loading Smart Campus...</p>
  </div>
);

const App = () => {
  const { user, isAuthenticated } = useAuthStore();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(13,21,38,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F8FAFC',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#0A0F1E' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#0A0F1E' },
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Student Portal */}
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}
            />
            <Route
              path="complaints/new"
              element={<ProtectedRoute allowedRoles={['student']}><NewComplaint /></ProtectedRoute>}
            />
            <Route
              path="complaints"
              element={<ProtectedRoute allowedRoles={['student']}><ComplaintsList /></ProtectedRoute>}
            />
            <Route
              path="complaints/:id"
              element={<ProtectedRoute allowedRoles={['student']}><ComplaintDetail /></ProtectedRoute>}
            />
            <Route
              path="notifications"
              element={<ProtectedRoute allowedRoles={['student']}><NotificationsPage /></ProtectedRoute>}
            />
            <Route
              path="profile"
              element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>}
            />
            <Route
              path="feedback"
              element={<ProtectedRoute allowedRoles={['student']}><FeedbackPage /></ProtectedRoute>}
            />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="complaints"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaintsList /></ProtectedRoute>}
            />
            <Route
              path="complaints/:id"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaintDetail /></ProtectedRoute>}
            />
            <Route
              path="students"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>}
            />
            <Route
              path="staff"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminStaff /></ProtectedRoute>}
            />
            <Route
              path="analytics"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>}
            />
            <Route
              path="reports"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>}
            />
            <Route
              path="settings"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>}
            />
          </Route>

          {/* Staff Portal */}
          <Route path="/staff">
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>}
            />
            <Route
              path="tasks"
              element={<ProtectedRoute allowedRoles={['staff']}><StaffTasks /></ProtectedRoute>}
            />
            <Route
              path="tasks/:id"
              element={<ProtectedRoute allowedRoles={['staff']}><TaskDetail /></ProtectedRoute>}
            />
            <Route
              path="history"
              element={<ProtectedRoute allowedRoles={['staff']}><StaffTasks /></ProtectedRoute>}
            />
            <Route
              path="profile"
              element={<ProtectedRoute allowedRoles={['staff']}><StaffProfile /></ProtectedRoute>}
            />
          </Route>

          {/* Default redirects */}
          <Route path="/dashboard" element={<Navigate to={getHomeRedirect()} replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
