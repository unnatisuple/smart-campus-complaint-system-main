import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';
import ParticleCanvas from '../components/ui/ParticleCanvas';
import toast from 'react-hot-toast';

const ROLES: { key: Role; label: string; emoji: string; color: string }[] = [
  { key: 'student', label: 'Student', emoji: '🎓', color: '#2563EB' },
  { key: 'staff', label: 'Staff', emoji: '🔧', color: '#7C3AED' },
  { key: 'admin', label: 'Admin', emoji: '⚡', color: '#06B6D4' },
];

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  student: { email: 'student@campus.edu', password: 'Student@123' },
  staff: { email: 'staff@campus.edu', password: 'Staff@123' },
  admin: { email: 'admin@campus.edu', password: 'Admin@123' },
};

const REDIRECT_MAP: Record<Role, string> = {
  student: '/student/dashboard',
  staff: '/staff/dashboard',
  admin: '/admin/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();

  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Auto-fill demo credentials
  const fillDemo = () => {
    const cred = DEMO_CREDENTIALS[role];
    setEmail(cred.email);
    setPassword(cred.password);
    toast('Demo credentials filled! Click Sign In.', { icon: '✨' });
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(REDIRECT_MAP[user.role]);
    }
  }, [isAuthenticated, user, navigate]);

  // When role changes, update email if using demo
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    const result = await login(email, password, role);
    if (result.success) {
      toast.success(`Welcome back! Redirecting to ${role} portal...`);
    } else {
      toast.error(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0F1E' }}>
      <ParticleCanvas />
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Left Panel — Illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md relative z-10"
        >
          {/* Floating UI card mockup */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="glass rounded-2xl p-6 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#EF444422' }}>⚡</div>
              <div>
                <p className="text-white text-sm font-medium">CMP-2024-0006</p>
                <p className="text-slate-500 text-xs">Electrical fault — Critical</p>
              </div>
              <span className="badge badge-urgent ml-auto">Critical</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full mb-2">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '65%' }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Assigned → In Progress</span>
              <span>65%</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="glass rounded-2xl p-4 text-left mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-slate-300 text-sm">Complaint resolved — ✅ Lab 3 Wiring Fixed</p>
            </div>
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your smart campus complaint management system. Every issue tracked, every problem solved.
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="glass w-full max-w-md rounded-3xl p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🏛️</span>
              <span className="font-display font-bold text-white text-xl">Smart Campus</span>
            </div>
            <p className="text-slate-400 text-sm">Sign in to your portal</p>
          </div>

          {/* Role Tabs */}
          <div className="glass-sm rounded-xl p-1 flex gap-1 mb-8">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all relative"
                style={{
                  background: role === r.key ? `${r.color}22` : 'transparent',
                  color: role === r.key ? r.color : '#94A3B8',
                  border: role === r.key ? `1px solid ${r.color}44` : '1px solid transparent',
                }}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <input
                className="input-glass pl-10"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <input
                className="input-glass pl-10 pr-10"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-accent transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3.5 mt-2"
              style={{ opacity: isLoading ? 0.8 : 1 }}
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Demo fill */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-center text-xs text-slate-500 hover:text-primary transition-colors py-1"
            >
              ✨ Fill demo credentials for {role}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social buttons (UI only) */}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Google', icon: '🌐' }, { label: 'GitHub', icon: '🐙' }].map((p) => (
              <button
                key={p.label}
                className="btn-ghost justify-center py-2.5 text-sm"
                onClick={() => toast('Social login coming soon!')}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-accent transition-colors font-medium">
              Register as Student
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
