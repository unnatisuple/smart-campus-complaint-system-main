import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Star, Phone, Award, TrendingUp, Clock,
  CheckCircle, Plus, X, Save, Edit2, BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { MOCK_STAFF, MOCK_STAFF_PERFORMANCE, MOCK_COMPLAINTS, CATEGORIES } from '../../data/mockData';

// ─── Available expertise options ──────────────────────────────────────────────
const ALL_EXPERTISE = CATEGORIES.map(c => c.name);

// ─── Bar chart helper ─────────────────────────────────────────────────────────
const MONTH_DATA = [
  { month: 'Jan', count: 28 },
  { month: 'Feb', count: 35 },
  { month: 'Mar', count: 42 },
  { month: 'Apr', count: 31 },
  { month: 'May', count: 47 },
  { month: 'Jun', count: 38 },
];

const MiniBarChart = () => {
  const max = Math.max(...MONTH_DATA.map(d => d.count));
  return (
    <div className="flex items-end gap-2 h-28">
      {MONTH_DATA.map((d, i) => (
        <motion.div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
          style={{ transformOrigin: 'bottom' }}
        >
          <span className="text-xs text-slate-400 font-mono font-bold">{d.count}</span>
          <div
            className="w-full rounded-t-lg relative overflow-hidden"
            style={{
              height: `${(d.count / max) * 72}px`,
              background: 'linear-gradient(180deg, #7C3AED, #6366F188)',
              minHeight: 8,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(180deg, #A78BFA, #7C3AED88)' }}
            />
          </div>
          <span className="text-xs text-slate-600">{d.month}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({
  icon, label, value, color, delay = 0,
}: { icon: React.ReactNode; label: string; value: string | number; color: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-5 rounded-2xl text-center relative overflow-hidden"
    whileHover={{ scale: 1.03, y: -2 }}
  >
    <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
      style={{ background: `${color}18`, border: `1px solid ${color}44`, color }}
    >
      {icon}
    </div>
    <p className="text-2xl font-display font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
  </motion.div>
);

// ─── Expertise Tag ────────────────────────────────────────────────────────────
const ExpertiseTag = ({
  name, removable, onRemove,
}: { name: string; removable?: boolean; onRemove?: () => void }) => (
  <motion.span
    layout
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0 }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
    style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED55' }}
  >
    {name}
    {removable && onRemove && (
      <button
        onClick={onRemove}
        className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500/30 hover:text-red-300 transition-colors"
      >
        <X size={10} />
      </button>
    )}
  </motion.span>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffProfile = () => {
  const { user } = useAuthStore();

  const staffData = MOCK_STAFF.find(s => s.id === user?.id);
  const perfData = MOCK_STAFF_PERFORMANCE.find(s => s.staffName === user?.name);

  const [name, setName] = useState(user?.name ?? 'Rajesh Kumar');
  const [mobile, setMobile] = useState('9876543210');
  const [expertise, setExpertise] = useState<string[]>(staffData?.expertise ?? ['Electrical', 'AC / Ventilation']);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTagPicker, setShowTagPicker] = useState(false);

  const myResolved = useMemo(
    () => MOCK_COMPLAINTS.filter(c => c.assignment?.staffId === user?.id && c.status === 'resolved').length,
    [user?.id]
  );

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setIsEditing(false);
    toast.success('✅ Profile updated successfully!');
  };

  const addExpertise = (tag: string) => {
    if (!expertise.includes(tag)) {
      setExpertise(p => [...p, tag]);
    }
    setShowTagPicker(false);
    setNewTag('');
  };

  const removeExpertise = (tag: string) => {
    setExpertise(p => p.filter(t => t !== tag));
  };

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const availableTags = ALL_EXPERTISE.filter(t => !expertise.includes(t));

  return (
    <DashboardLayout>
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.06))' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', boxShadow: '0 0 40px #7C3AED40' }}
          >
            {initials}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-white">{name}</h1>
              <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-medium">
                Staff
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">{staffData?.department ?? 'Maintenance'} Department</p>
            <p className="text-slate-500 text-xs mb-3">{user?.email}</p>

            {/* Expertise badges */}
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {expertise.map(e => (
                  <ExpertiseTag key={e} name={e} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditing(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isEditing
                ? 'bg-white/10 border border-white/20 text-white'
                : 'bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30'
            }`}
          >
            <Edit2 size={14} />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ─── Left Column ──────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Edit Form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-2xl p-6 space-y-5">
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Edit2 size={16} className="text-violet-400" />
                    Edit Profile
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input-glass w-full text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          className="input-glass w-full pl-9 text-sm"
                          placeholder="Mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expertise Tags Editor */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
                      Expertise Areas
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <AnimatePresence>
                        {expertise.map(e => (
                          <ExpertiseTag key={e} name={e} removable onRemove={() => removeExpertise(e)} />
                        ))}
                      </AnimatePresence>

                      {/* Add button */}
                      <button
                        onClick={() => setShowTagPicker(p => !p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-white/20 text-slate-500 hover:border-violet-500/40 hover:text-violet-400 transition-colors"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>

                    {/* Tag Picker */}
                    <AnimatePresence>
                      {showTagPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="glass p-4 rounded-xl"
                        >
                          <p className="text-xs text-slate-500 mb-2 font-medium">Select expertise area:</p>
                          <div className="flex flex-wrap gap-2">
                            {availableTags.map(t => (
                              <button
                                key={t}
                                onClick={() => addExpertise(t)}
                                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
                              >
                                {t}
                              </button>
                            ))}
                            {availableTags.length === 0 && (
                              <p className="text-xs text-slate-600">All expertise areas added!</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                  >
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><Save size={16} /> Save Changes</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Stats Grid */}
          <div>
            <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-400" />
              Performance Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatPill
                icon={<CheckCircle size={18} />}
                label="Total Resolved"
                value={perfData?.resolved ?? 189}
                color="#10B981"
                delay={0}
              />
              <StatPill
                icon={<Clock size={18} />}
                label="Avg Resolution (hrs)"
                value={perfData?.avgTime ?? 28}
                color="#F59E0B"
                delay={0.08}
              />
              <StatPill
                icon={<Star size={18} />}
                label="Rating"
                value={`${perfData?.rating ?? 4.8} ⭐`}
                color="#FBBF24"
                delay={0.16}
              />
              <StatPill
                icon={<TrendingUp size={18} />}
                label="This Month"
                value={MONTH_DATA[MONTH_DATA.length - 1].count}
                color="#7C3AED"
                delay={0.24}
              />
            </div>
          </div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-violet-400" />
                Resolved Per Month
              </h2>
              <span className="text-xs text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                Last 6 months
              </span>
            </div>
            <MiniBarChart />
            <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between text-xs text-slate-500">
              <span>Total: {MONTH_DATA.reduce((s, d) => s + d.count, 0)} resolved</span>
              <span>Avg: {Math.round(MONTH_DATA.reduce((s, d) => s + d.count, 0) / MONTH_DATA.length)}/month</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Sidebar ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={13} /> Profile Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Employee ID', value: user?.id ?? 'st1' },
                { label: 'Department', value: staffData?.department ?? 'Maintenance' },
                { label: 'Role', value: 'Maintenance Staff' },
                { label: 'Email', value: user?.email ?? 'staff@campus.edu' },
                { label: 'Mobile', value: mobile },
                { label: 'Joined', value: new Date(user?.createdAt ?? '2020-01-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">{label}</span>
                  <span className="text-slate-200 text-right font-mono text-xs break-all">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Current Tasks Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award size={13} /> Task Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Assigned', count: staffData?.assignedCount ?? 5, color: '#6366F1' },
                { label: 'In Progress', count: 1, color: '#F97316' },
                { label: 'Resolved (total)', count: perfData?.resolved ?? 189, color: '#10B981' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span
                    className="font-bold font-mono text-sm px-3 py-0.5 rounded-full"
                    style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>

            {/* Visual progress bar */}
            <div className="mt-4 pt-4 border-t border-white/8">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Workload</span>
                <span>{staffData?.assignedCount ?? 5}/10</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((staffData?.assignedCount ?? 5) / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #6366F1)' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Expertise Tags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award size={13} /> Expertise Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {expertise.map(e => (
                  <ExpertiseTag key={e} name={e} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffProfile;
