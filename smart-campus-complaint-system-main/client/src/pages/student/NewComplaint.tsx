import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  ChevronRight, ChevronLeft, Upload, X, MapPin,
  CheckCircle, FileText, AlertTriangle, Zap,
  Building, Image, ArrowRight, Sparkles
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useComplaintStore } from '../../store/complaintStore';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES, BUILDINGS } from '../../data/mockData';
import { Priority } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  building: string;
  floor: string;
  roomNumber: string;
  locationNotes: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  done: boolean;
}

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; desc: string }> = {
  low:      { label: 'Low',      color: '#10B981', bg: '#10B98120', desc: 'Minor inconvenience' },
  medium:   { label: 'Medium',   color: '#FBBF24', bg: '#FBBF2420', desc: 'Affects routine' },
  high:     { label: 'High',     color: '#F59E0B', bg: '#F59E0B20', desc: 'Significant impact' },
  critical: { label: 'Critical', color: '#EF4444', bg: '#EF444420', desc: 'Safety / urgent' },
};

// ─── Step progress bar ────────────────────────────────────────────────────────
const StepBar = ({ step }: { step: number }) => {
  const steps = ['Details', 'Location', 'Media', 'Review'];
  return (
    <div className="glass p-5 mb-6">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                animate={{
                  background: i < step ? '#10B981' : i === step ? '#2563EB' : '#ffffff10',
                  borderColor: i < step ? '#10B981' : i === step ? '#2563EB' : '#ffffff20',
                  color: i <= step ? '#fff' : '#64748b',
                }}
              >
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </motion.div>
              <span className={`text-xs mt-1 font-medium ${i === step ? 'text-white' : i < step ? 'text-emerald-400' : 'text-slate-600'}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: i < step ? '100%' : '0%', background: '#10B981' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NewComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { submitComplaint } = useComplaintStore();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newComplaintNo, setNewComplaintNo] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    categoryId: 'c1',
    priority: 'medium',
    building: '',
    floor: '',
    roomNumber: '',
    locationNotes: '',
  });

  const updateForm = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const step0Valid = form.title.trim().length >= 5 && form.description.trim().length >= 50;
  const step1Valid = form.building !== '' && form.floor !== '' && form.roomNumber.trim() !== '';
  const stepValid = [step0Valid, step1Valid, true, true];

  // ─── Dropzone ───────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      const id = `f${Date.now()}-${Math.random()}`;
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      const newFile: UploadedFile = { id, file, preview, progress: 0, done: false };
      setUploadedFiles((prev) => [...prev, newFile]);

      // Simulate upload progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 20 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress: 100, done: true } : f))
          );
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress: p } : f))
          );
        }
      }, 200);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [], 'application/pdf': [] },
    maxFiles: 10,
  });

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const studentUser = user as any;
      const complaint = await submitComplaint(
        { ...form, files: uploadedFiles.map((f) => f.file) },
        user.id,
        user.name,
        studentUser.enrollmentNo || ''
      );
      setNewComplaintNo(complaint.complaintNo);
      setSubmitted(true);
      toast.success('Complaint submitted successfully!');
    } catch {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Slides ──────────────────────────────────────────────────────────────────
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (!stepValid[step]) {
      toast.error('Please fill in all required fields');
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // ─── Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            className="glass max-w-md w-full mx-auto p-10 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Complaint Submitted!
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Your complaint has been registered successfully and our team will review it shortly.
            </p>
            <div className="glass-sm px-5 py-3 rounded-xl mb-6 inline-block">
              <p className="text-xs text-slate-500 mb-1">Complaint ID</p>
              <p className="font-mono text-lg font-bold text-blue-400">{newComplaintNo}</p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => navigate(`/student/complaints`)}
                className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowRight size={18} /> Track Complaint
              </motion.button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setForm({ title: '', description: '', categoryId: 'c1', priority: 'medium', building: '', floor: '', roomNumber: '', locationNotes: '' });
                  setUploadedFiles([]);
                }}
                className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Submit Another Complaint
              </button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-0">
        {/* Page title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold text-white">Submit New Complaint</h1>
          <p className="text-slate-500 text-sm mt-1">Fill in the details to report a campus issue</p>
        </motion.div>

        {/* Step bar */}
        <StepBar step={step} />

        {/* Step content */}
        <div className="glass p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* ─── Step 0: Details ─── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">Complaint Details</h3>
                    <p className="text-slate-500 text-sm">Describe the issue you are experiencing on campus</p>
                  </div>

                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Complaint Title *</label>
                      <span className={`text-xs ${form.title.length < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {form.title.length}/100
                      </span>
                    </div>
                    <input
                      className="input-glass w-full"
                      placeholder="Brief summary of the issue (min 5 chars)"
                      value={form.title}
                      maxLength={100}
                      onChange={(e) => updateForm('title', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Description *</label>
                      <span className={`text-xs flex items-center gap-1 ${form.description.length < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {form.description.length < 50
                          ? <><AlertTriangle size={10} /> {50 - form.description.length} more chars</>
                          : <><CheckCircle size={10} /> {form.description.length} chars</>}
                      </span>
                    </div>
                    <textarea
                      className="input-glass w-full min-h-[120px] resize-y"
                      placeholder="Provide a detailed description of the issue (minimum 50 characters)"
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                    />
                    <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{
                          width: `${Math.min((form.description.length / 50) * 100, 100)}%`,
                          background: form.description.length < 50 ? '#EF4444' : '#10B981',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-3">Category *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat.id}
                          onClick={() => updateForm('categoryId', cat.id)}
                          className="p-3 rounded-xl border-2 text-left transition-all"
                          animate={{
                            borderColor: form.categoryId === cat.id ? cat.color : '#ffffff15',
                            background: form.categoryId === cat.id ? `${cat.color}15` : '#ffffff05',
                            boxShadow: form.categoryId === cat.id ? `0 0 20px ${cat.color}30` : 'none',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="text-xl block mb-1">{cat.icon}</span>
                          <p className={`text-xs font-semibold ${form.categoryId === cat.id ? 'text-white' : 'text-slate-400'}`}>
                            {cat.name}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{cat.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-3">Priority *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([p, cfg]) => (
                        <motion.button
                          key={p}
                          onClick={() => updateForm('priority', p)}
                          className="p-3 rounded-xl border-2 text-center transition-all"
                          animate={{
                            borderColor: form.priority === p ? cfg.color : '#ffffff15',
                            background: form.priority === p ? cfg.bg : '#ffffff05',
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <p className="text-sm font-bold" style={{ color: form.priority === p ? cfg.color : '#64748b' }}>
                            {cfg.label}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{cfg.desc}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Step 1: Location ─── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">Location Details</h3>
                    <p className="text-slate-500 text-sm">Where exactly is the issue located?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Building */}
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">
                        <Building size={14} className="inline mr-1" />Building *
                      </label>
                      <select
                        className="input-glass w-full"
                        value={form.building}
                        onChange={(e) => updateForm('building', e.target.value)}
                      >
                        <option value="">Select building...</option>
                        {BUILDINGS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Floor *</label>
                      <input
                        className="input-glass w-full"
                        type="text"
                        placeholder="e.g. Ground, 1st, 2nd..."
                        value={form.floor}
                        onChange={(e) => updateForm('floor', e.target.value)}
                      />
                    </div>

                    {/* Room */}
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Room / Area *</label>
                      <input
                        className="input-glass w-full"
                        placeholder="e.g. Lab 3, Room 201, Washroom..."
                        value={form.roomNumber}
                        onChange={(e) => updateForm('roomNumber', e.target.value)}
                      />
                    </div>

                    {/* Location notes */}
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Additional Notes</label>
                      <input
                        className="input-glass w-full"
                        placeholder="e.g. Near the window, left side..."
                        value={form.locationNotes}
                        onChange={(e) => updateForm('locationNotes', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-3">
                      <MapPin size={14} className="inline mr-1" />Campus Map
                    </label>
                    <div className="glass-sm rounded-xl overflow-hidden relative h-48">
                      <svg width="100%" height="100%" className="opacity-30">
                        <defs>
                          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4B5563" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>

                      {/* Building labels */}
                      {['Block A', 'Block B', 'Library', 'Main Block'].map((b, i) => (
                        <div
                          key={b}
                          className="absolute bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-slate-300"
                          style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 30}%` }}
                        >
                          {b}
                        </div>
                      ))}

                      {/* Pulsing marker */}
                      <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                        <div className="relative">
                          <motion.div
                            className="w-5 h-5 rounded-full bg-blue-500"
                            animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <div className="absolute inset-0 w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                            <MapPin size={10} className="text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="glass-sm px-3 py-1.5 rounded-lg text-xs text-slate-400">
                          📍 {form.building || 'Select building'} {form.floor ? `· Floor ${form.floor}` : ''} {form.roomNumber ? `· ${form.roomNumber}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Step 2: Media Upload ─── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">Media Upload</h3>
                    <p className="text-slate-500 text-sm">Upload photos or documents to support your complaint (optional, max 10MB each)</p>
                  </div>

                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/3'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="inline-flex w-14 h-14 rounded-2xl bg-blue-500/20 items-center justify-center mb-4"
                    >
                      <Upload size={24} className="text-blue-400" />
                    </motion.div>
                    <p className="text-white font-semibold mb-1">
                      {isDragActive ? 'Drop files here!' : 'Drag & drop files here'}
                    </p>
                    <p className="text-slate-500 text-sm">or click to browse · Images, Videos, PDFs · Max 10MB</p>
                  </div>

                  {/* File previews */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedFiles.map((f) => (
                        <motion.div
                          key={f.id}
                          className="glass-sm rounded-xl overflow-hidden relative"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {f.preview ? (
                            <img
                              src={f.preview}
                              alt={f.file.name}
                              className="w-full h-28 object-cover"
                            />
                          ) : (
                            <div className="w-full h-28 flex items-center justify-center bg-white/5">
                              <FileText size={32} className="text-slate-500" />
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-xs text-slate-300 truncate">{f.file.name}</p>
                            <p className="text-xs text-slate-600">{(f.file.size / 1024).toFixed(0)} KB</p>
                            {!f.done && (
                              <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-blue-400"
                                  animate={{ width: `${f.progress}%` }}
                                />
                              </div>
                            )}
                            {f.done && (
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCircle size={10} className="text-emerald-400" />
                                <span className="text-xs text-emerald-400">Uploaded</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(f.id)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length === 0 && (
                    <div className="glass-sm rounded-xl p-4 flex items-center gap-3">
                      <Image size={18} className="text-slate-600 flex-shrink-0" />
                      <p className="text-sm text-slate-500">
                        No files uploaded yet. Photos of the issue help resolve complaints faster.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Step 3: Review ─── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">Review & Submit</h3>
                    <p className="text-slate-500 text-sm">Review your complaint before submitting</p>
                  </div>

                  {/* Summary: Details */}
                  <div className="glass-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText size={14} className="text-blue-400" /> Details
                      </h4>
                      <button
                        onClick={() => { setDirection(-1); setStep(0); }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-xs text-slate-500">Title</p>
                        <p className="text-sm text-white font-medium">{form.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Description</p>
                        <p className="text-sm text-slate-300">{form.description}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Category</p>
                          <p className="text-sm text-white">
                            {CATEGORIES.find((c) => c.id === form.categoryId)?.icon}{' '}
                            {CATEGORIES.find((c) => c.id === form.categoryId)?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Priority</p>
                          <p className="text-sm font-semibold" style={{ color: PRIORITY_CONFIG[form.priority].color }}>
                            {PRIORITY_CONFIG[form.priority].label}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary: Location */}
                  <div className="glass-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-400" /> Location
                      </h4>
                      <button
                        onClick={() => { setDirection(-1); setStep(1); }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Building', value: form.building },
                        { label: 'Floor', value: form.floor },
                        { label: 'Room / Area', value: form.roomNumber },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-sm text-white font-medium">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                    {form.locationNotes && (
                      <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-white/10">
                        Note: {form.locationNotes}
                      </p>
                    )}
                  </div>

                  {/* Summary: Media */}
                  <div className="glass-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Image size={14} className="text-purple-400" /> Media
                      </h4>
                      <button
                        onClick={() => { setDirection(-1); setStep(2); }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">
                      {uploadedFiles.length === 0
                        ? 'No files attached'
                        : `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} attached`}
                    </p>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 font-bold text-base flex items-center justify-center gap-3 disabled:opacity-60"
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Submitting Complaint...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Submit Complaint
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium text-slate-300 hover:text-white transition-all disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {step < 3 && (
            <motion.button
              onClick={goNext}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                stepValid[step]
                  ? 'btn-primary'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
              whileHover={stepValid[step] ? { scale: 1.04 } : {}}
              whileTap={stepValid[step] ? { scale: 0.97 } : {}}
            >
              {step === 2 ? 'Review' : 'Next'} <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewComplaint;
