import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import ParticleCanvas from '../components/ui/ParticleCanvas';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSent(true);
    toast.success('Reset link sent! Check your email.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0A0F1E' }}>
      <ParticleCanvas />
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-3xl p-8 relative z-10"
      >
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)' }}>
                🔑
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-slate-400 text-sm">Enter your email and we'll send a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-glass pl-10"
                  type="email"
                  placeholder="Your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-3.5"
              >
                {isLoading ? 'Sending...' : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">📧</div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Check Your Email</h2>
            <p className="text-slate-400 text-sm mb-6">
              We sent a password reset link to <span className="text-white">{email}</span>
            </p>
            <div className="glass-sm rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle size={20} color="#10B981" />
              <span className="text-sm text-slate-300">Reset link valid for 15 minutes</span>
            </div>
            <button className="btn-ghost w-full justify-center" onClick={() => navigate('/login')}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </motion.div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-primary hover:text-accent transition-colors">
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
