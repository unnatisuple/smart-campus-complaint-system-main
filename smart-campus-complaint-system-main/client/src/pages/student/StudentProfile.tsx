import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { Student } from '../../types';
import { User, Mail, Phone, GraduationCap, Hash, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user } = useAuthStore();
  const student = user as Student;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student?.name ?? '');
  const [mobile, setMobile] = useState(student?.mobile ?? '');

  const initials = student?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'ST';

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">My Profile</h1>
        </div>

        {/* Profile Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-6"
        >
          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{student?.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">{student?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-assigned">{student?.department}</span>
                    <span className="badge badge-pending">Year {student?.year}</span>
                  </div>
                </div>
                <button
                  className={editing ? 'btn-ghost py-2 px-4 text-sm' : 'btn-primary py-2 px-4 text-sm'}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit</>}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
            <User size={18} className="text-primary" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: User, label: 'Full Name',
                value: editing ? (
                  <input className="input-glass h-9 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                ) : <span className="text-white">{name}</span>,
              },
              { icon: Mail, label: 'Email Address', value: <span className="text-white">{student?.email}</span> },
              {
                icon: Phone, label: 'Mobile Number',
                value: editing ? (
                  <input className="input-glass h-9 text-sm" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                ) : <span className="text-white">{mobile}</span>,
              },
              { icon: Hash, label: 'Enrollment No.', value: <span className="font-mono text-white">{student?.enrollmentNo}</span> },
              { icon: GraduationCap, label: 'Department', value: <span className="text-white">{student?.department}</span> },
              { icon: GraduationCap, label: 'Year of Study', value: <span className="text-white">Year {student?.year}</span> },
            ].map((field) => (
              <div key={field.label}>
                <label className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <field.icon size={12} />
                  {field.label}
                </label>
                {field.value}
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-6 flex gap-3">
              <button className="btn-primary py-2.5 px-6" onClick={handleSave}>
                <Save size={14} /> Save Changes
              </button>
              <button className="btn-ghost py-2.5 px-6" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
