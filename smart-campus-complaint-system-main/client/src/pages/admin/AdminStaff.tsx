import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { MOCK_STAFF } from '../../data/mockData';
import { Search, Users, Plus, Eye, Trash2, Edit3, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStaff = () => {
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', department: '', expertise: '' });

  const filtered = MOCK_STAFF.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.email.includes(q) || s.department.toLowerCase().includes(q);
  });

  const STAFF_COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Staff Management</h1>
          <p className="text-slate-400 text-sm">{MOCK_STAFF.length} staff members</p>
        </div>
        <button className="btn-primary py-2 px-4 text-sm" onClick={() => setAddModal(true)}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-glass pl-9 h-9 text-sm"
            placeholder="Search staff by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((staff, i) => {
          const color = STAFF_COLORS[i % STAFF_COLORS.length];
          const initials = staff.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, #7C3AED)` }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{staff.name}</p>
                    <p className="text-slate-500 text-xs">{staff.department}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white" data-tooltip="Edit">
                    <Edit3 size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400" data-tooltip="Remove">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-slate-500 text-xs mb-3">{staff.email}</p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {staff.expertise.map((exp) => (
                  <span key={exp} className="badge badge-assigned text-xs">{exp}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <p className="font-bold text-lg" style={{ color }}>{staff.assignedCount}</p>
                  <p className="text-slate-500 text-xs">Assigned</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} fill="#FBBF24" color="#FBBF24" />
                    <p className="font-bold text-lg text-green-400">4.8</p>
                  </div>
                  <p className="text-slate-500 text-xs">Rating</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Staff Member">
        <div className="space-y-4">
          <input className="input-glass" placeholder="Full Name" value={newStaff.name} onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))} />
          <input className="input-glass" type="email" placeholder="Email Address" value={newStaff.email} onChange={(e) => setNewStaff((p) => ({ ...p, email: e.target.value }))} />
          <input className="input-glass" placeholder="Department" value={newStaff.department} onChange={(e) => setNewStaff((p) => ({ ...p, department: e.target.value }))} />
          <input className="input-glass" placeholder="Expertise (comma separated)" value={newStaff.expertise} onChange={(e) => setNewStaff((p) => ({ ...p, expertise: e.target.value }))} />
          <button
            className="btn-primary w-full justify-center"
            onClick={() => { setAddModal(false); toast.success('Staff member added successfully!'); }}
          >
            Add Staff Member
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminStaff;
