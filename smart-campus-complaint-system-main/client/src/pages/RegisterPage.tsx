import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, ArrowRight, Loader } from 'lucide-react';
import ParticleCanvas from '../components/ui/ParticleCanvas';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { DEPARTMENTS } from '../data/mockData';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  enrollmentNo: string;
  department: string;
  year: string;
  password: string;
  confirmPassword: string;
}

const getPasswordStrength = (password: string) => {
  if (password.length < 6) return { level: 0, label: 'Too Short', color: '#EF4444' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score === 1) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { level: 3, label: 'Strong', color: '#10B981' };
  return { level: 4, label: 'Very Strong', color: '#06B6D4' };
};

const ENROLLMENT_REGEX = /^\d{4}-\d{2}-\d{5}$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: '', email: '', mobile: '', enrollmentNo: '', department: '', year: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const strength = getPasswordStrength(form.password);

  const validations = {
    name: form.name.length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    mobile: /^\d{10}$/.test(form.mobile),
    enrollmentNo: ENROLLMENT_REGEX.test(form.enrollmentNo),
    department: !!form.department,
    year: !!form.year,
    password: strength.level >= 2,
    confirmPassword: form.password === form.confirmPassword && form.confirmPassword.length > 0,
  };

  const isValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { toast.error('Please fix validation errors'); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setOtpModal(true);
    toast('OTP sent to your email! (Demo: use 123456)', { icon: '📧' });
  };

  const handleOtpVerify = async () => {
    if (otp === '123456') {
      setOtpModal(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      toast.error('Invalid OTP. Demo OTP is: 123456');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1E' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-12 text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Registration Successful!</h2>
          <p className="text-slate-400 mb-6">Your account has been created. Redirecting to login...</p>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6" style={{ background: '#0A0F1E' }}>
      <ParticleCanvas />
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-2xl rounded-3xl p-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🎓</span>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Student Registration — Smart Campus CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <FieldWithValidation
              label="Full Name"
              value={form.name}
              onChange={(v) => update('name', v)}
              isValid={validations.name}
              placeholder="Arjun Sharma"
            />
            <FieldWithValidation
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              isValid={validations.email}
              placeholder="arjun@campus.edu"
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <FieldWithValidation
              label="Mobile Number"
              type="tel"
              value={form.mobile}
              onChange={(v) => update('mobile', v)}
              isValid={validations.mobile}
              placeholder="9876543210"
              hint="10 digits"
            />
            <FieldWithValidation
              label="Enrollment No."
              value={form.enrollmentNo}
              onChange={(v) => update('enrollmentNo', v)}
              isValid={validations.enrollmentNo}
              placeholder="2021-01-12345"
              hint="Format: XXXX-XX-XXXXX"
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 ml-1">Department</label>
              <select
                className="input-glass"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 ml-1">Year of Study</label>
              <select
                className="input-glass"
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
              >
                <option value="">Select Year</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                className="input-glass pr-10"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((l) => (
                    <div
                      key={l}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: l <= strength.level ? strength.color : 'rgba(255,255,255,0.1)' }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <FieldWithValidation
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => update('confirmPassword', v)}
            isValid={validations.confirmPassword}
            placeholder="Re-enter password"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="btn-primary w-full justify-center py-4 mt-2"
            style={{ opacity: (!isValid || isLoading) ? 0.6 : 1 }}
          >
            {isLoading ? (
              <><Loader size={16} className="animate-spin" /> Creating Account...</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-accent transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* OTP Modal */}
      <Modal isOpen={otpModal} onClose={() => setOtpModal(false)} title="Verify Your Email">
        <div className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-slate-400 text-sm mb-6">
            We sent a 6-digit OTP to <span className="text-white">{form.email}</span>
            <br />
            <span className="text-xs text-slate-500">(Demo OTP: 123456)</span>
          </p>
          <div className="flex gap-2 justify-center mb-6">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                className="input-glass text-center text-xl font-mono"
                style={{ width: 44, height: 52, padding: 0 }}
                maxLength={1}
                value={otp[i] || ''}
                onChange={(e) => {
                  const newOtp = otp.split('');
                  newOtp[i] = e.target.value;
                  setOtp(newOtp.join(''));
                  if (e.target.value && i < 5) {
                    const next = document.querySelector(`input:nth-child(${i + 2})`) as HTMLInputElement;
                    next?.focus();
                  }
                }}
              />
            ))}
          </div>
          <button className="btn-primary w-full justify-center" onClick={handleOtpVerify}>
            Verify & Complete Registration
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Helper component for validated fields
const FieldWithValidation = ({
  label, value, onChange, isValid, placeholder, type = 'text', hint
}: {
  label: string; value: string; onChange: (v: string) => void;
  isValid: boolean; placeholder?: string; type?: string; hint?: string;
}) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1.5 ml-1">{label}</label>
    <div className="relative">
      <input
        className="input-glass pr-10"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid
            ? <Check size={15} color="#10B981" />
            : <X size={15} color="#EF4444" />
          }
        </div>
      )}
    </div>
    {hint && <p className="text-xs text-slate-600 mt-1 ml-1">{hint}</p>}
  </div>
);

export default RegisterPage;
