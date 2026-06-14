import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Eye, Brain, BarChart3, Users, Smartphone,
  ChevronRight, Star, Shield, Clock, CheckCircle2,
  ArrowRight, Mail, Phone, MapPin
} from 'lucide-react';
import ParticleCanvas from '../components/ui/ParticleCanvas';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap, title: 'Fast Reporting', desc: 'Submit complaints in under 2 minutes with our streamlined 3-step form', color: '#FBBF24' },
  { icon: Eye, title: 'Real-Time Tracking', desc: 'Monitor your complaint status with live updates and timeline tracking', color: '#06B6D4' },
  { icon: Brain, title: 'Smart Assignment', desc: 'AI-powered routing assigns complaints to the most qualified staff', color: '#7C3AED' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Comprehensive reports and insights for better campus management', color: '#2563EB' },
  { icon: Users, title: 'Multi-Role Access', desc: 'Tailored portals for students, staff, and administrators', color: '#10B981' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Fully responsive design works on any device, anywhere', color: '#EC4899' },
];

const CATEGORIES = [
  { icon: '⚡', name: 'Electrical', color: '#FBBF24' },
  { icon: '🔧', name: 'Plumbing', color: '#06B6D4' },
  { icon: '🏗️', name: 'Civil', color: '#94A3B8' },
  { icon: '🧹', name: 'Cleaning', color: '#10B981' },
  { icon: '🌐', name: 'IT / Network', color: '#2563EB' },
  { icon: '🔬', name: 'Lab Equipment', color: '#7C3AED' },
  { icon: '🪑', name: 'Furniture', color: '#F59E0B' },
  { icon: '🔒', name: 'Security', color: '#EF4444' },
  { icon: '❄️', name: 'AC / Ventilation', color: '#67E8F9' },
  { icon: '📋', name: 'Others', color: '#6366F1' },
];

const TESTIMONIALS = [
  {
    name: 'Ananya Krishnan',
    role: 'B.Tech CSE, 3rd Year',
    text: 'My complaint about the broken projector was resolved in just 18 hours. The tracking feature kept me updated throughout. Excellent system!',
    rating: 5,
    avatar: 'AK',
  },
  {
    name: 'Prof. Mahesh Iyer',
    role: 'Head of IT Department',
    text: 'As an admin, this platform has transformed how we handle campus issues. The analytics help us spot recurring problems and act proactively.',
    rating: 5,
    avatar: 'MI',
  },
  {
    name: 'Suresh Kumar',
    role: 'Maintenance Staff',
    text: 'The task assignment system is crystal clear. I know exactly where to go and what to fix. The app is smooth and easy to use.',
    rating: 5,
    avatar: 'SK',
  },
];

const FAQS = [
  { q: 'Who can submit a complaint?', a: 'Any registered student of the engineering college can submit complaints through the student portal.' },
  { q: 'How long does resolution take?', a: 'Our average resolution time is 48 hours. Critical issues are addressed within 4 hours.' },
  { q: 'Can I track my complaint status?', a: 'Yes! Every complaint gets a unique ID and a real-time timeline showing every step of the resolution process.' },
  { q: 'What types of issues can I report?', a: 'Electrical, plumbing, civil, IT, lab equipment, cleaning, furniture, security, HVAC, and more — 10 categories in total.' },
  { q: 'Is my complaint visible to other students?', a: 'No. Complaints are private and visible only to the submitting student, assigned staff, and administrators.' },
  { q: 'Can I upload photos/videos with my complaint?', a: 'Absolutely. You can attach images, videos, and documents up to 10MB each to support your complaint.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-x-hidden" style={{ background: '#0A0F1E' }}>
      <ParticleCanvas />

      {/* Background blobs */}
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-sm border-b border-white/8 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <span className="font-display font-bold text-white text-lg">Smart Campus</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Categories', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm text-slate-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost text-sm py-2 px-4" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-primary text-sm py-2 px-4" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300">Live on 12+ Engineering Campuses</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display font-bold text-white mb-6"
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', lineHeight: 1.1 }}
          >
            Smart Campus.{' '}
            <span className="gradient-text">Zero Downtime.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mb-10 max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.7 }}
          >
            Report, track, and resolve campus infrastructure issues in real time.
            Powered by AI-assisted assignment and live status updates.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              className="btn-primary text-base px-8 py-4"
              onClick={() => navigate('/register')}
            >
              Submit a Complaint
              <ArrowRight size={18} />
            </button>
            <button
              className="btn-ghost text-base px-8 py-4"
              onClick={() => navigate('/login')}
            >
              Admin Login
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass inline-flex flex-wrap justify-center gap-8 px-10 py-5 rounded-2xl"
          >
            {[
              { label: 'Complaints Resolved', value: '2,400+' },
              { label: 'Satisfaction Rate', value: '98%' },
              { label: 'Avg Resolution', value: '48 hrs' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold text-white text-xl">{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating campus illustration */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 right-10 opacity-20 text-9xl hidden xl:block"
          style={{ filter: 'drop-shadow(0 0 40px rgba(37,99,235,0.4))' }}
        >
          🏛️
        </motion.div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary mb-3 uppercase tracking-widest"
            >
              Why Choose Us
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Everything your campus needs
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-2xl mx-auto"
            >
              A complete complaint management ecosystem built for engineering colleges with cutting-edge technology
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass glass-hover p-8 group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}
                >
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl font-bold text-white mb-4"
            >
              How It Works
            </motion.h2>
            <p className="text-slate-400">Three simple steps to get your issue resolved</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {[
              { step: '01', title: 'Submit', desc: 'Fill out our 3-step complaint form with location and photos', icon: '📝', color: '#2563EB' },
              { step: '02', title: 'Assign', desc: 'AI routes your complaint to the best qualified staff member', icon: '🎯', color: '#7C3AED' },
              { step: '03', title: 'Resolve', desc: 'Track live updates until the issue is completely fixed', icon: '✅', color: '#10B981' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex-1 flex flex-col items-center text-center relative"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-4 relative"
                  style={{ background: `${step.color}22`, border: `2px solid ${step.color}44` }}
                >
                  {step.icon}
                  <span
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>

                {/* Connector arrow */}
                {i < 2 && (
                  <div className="hidden md:flex absolute right-0 top-10 translate-x-1/2">
                    <ChevronRight size={24} className="text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATISTICS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto glass rounded-3xl p-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white">Numbers That Speak</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 2401, suffix: '+', label: 'Total Complaints', color: '#2563EB' },
              { value: 1284, suffix: '+', label: 'Active Users', color: '#7C3AED' },
              { value: 32, suffix: '', label: 'Staff Members', color: '#06B6D4' },
              { value: 48, suffix: 'hrs', label: 'Avg Resolution', color: '#10B981' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p
                  className="font-display font-bold text-4xl mb-2"
                  style={{ color: stat.color }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────────────── */}
      <section id="categories" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-4">10 Complaint Categories</h2>
            <p className="text-slate-400">Every campus issue is covered</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="category-icon-card"
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-slate-300">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-4">What They Say</h2>
          </div>
          <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
            />
            <div className="relative z-10">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="#FBBF24" color="#FBBF24" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto italic">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="avatar"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                  >
                    {TESTIMONIALS[activeTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{TESTIMONIALS[activeTestimonial].name}</p>
                    <p className="text-slate-500 text-sm">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === activeTestimonial ? '#2563EB' : 'rgba(255,255,255,0.2)',
                  width: i === activeTestimonial ? '24px' : '8px',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronRight
                    size={18}
                    className="text-slate-400 transition-transform flex-shrink-0"
                    style={{ transform: activeFaq === i ? 'rotate(90deg)' : 'none' }}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: activeFaq === i ? 'auto' : 0, opacity: activeFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">Get In Touch</h2>
            <p className="text-slate-400 text-sm">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <input className="input-glass" placeholder="Your Name" />
              </div>
              <div className="form-field">
                <input className="input-glass" type="email" placeholder="Email Address" />
              </div>
            </div>
            <input className="input-glass" placeholder="Subject" />
            <textarea className="input-glass" rows={4} placeholder="Your message..." style={{ resize: 'none' }} />
            <button className="btn-primary w-full justify-center py-4">
              Send Message
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏛️</span>
                <span className="font-display font-bold text-white">Smart Campus</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                A premium complaint management system for engineering colleges. Making campuses smarter, one resolution at a time.
              </p>
            </div>

            {[
              {
                title: 'Portals', links: ['Student Portal', 'Staff Portal', 'Admin Portal'],
              },
              {
                title: 'Features', links: ['Real-time Tracking', 'AI Assignment', 'Analytics', 'Reports'],
              },
              {
                title: 'Contact', links: ['📧 admin@campus.edu', '📞 +91 98765 43210', '📍 Engineering Campus, City'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-slate-500 text-sm hover:text-slate-300 cursor-pointer transition-colors">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© 2024 Smart Campus CMS. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span className="text-slate-500 text-xs">Secured by JWT + bcrypt encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Need to add useState import
import { useState } from 'react';
export default LandingPage;
