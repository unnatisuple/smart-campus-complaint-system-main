import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MOCK_STUDENTS, DEPARTMENTS } from '../../data/mockData';
import { Search, Users, Filter, Eye, Mail, Phone, GraduationCap } from 'lucide-react';

const AdminStudents = () => {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');

  const filtered = MOCK_STUDENTS.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.includes(q) || s.enrollmentNo.includes(q);
    const matchDept = !dept || s.department === dept;
    const matchYear = !year || s.year === parseInt(year);
    return matchSearch && matchDept && matchYear;
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Student Management</h1>
          <p className="text-slate-400 text-sm">{MOCK_STUDENTS.length} registered students</p>
        </div>
        <button className="btn-primary py-2 px-4 text-sm">
          <Users size={15} /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-glass pl-9 h-9 text-sm"
            placeholder="Search by name, email, enrollment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-glass h-9 text-sm" style={{ width: 160 }} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input-glass h-9 text-sm" style={{ width: 130 }} value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All Years</option>
          {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Enrollment No.</th>
              <th>Department</th>
              <th>Year</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, i) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="text-slate-600 text-xs">{i + 1}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar avatar-sm"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                    >
                      {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{student.name}</p>
                      <p className="text-slate-500 text-xs">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono text-xs">{student.enrollmentNo}</span></td>
                <td>
                  <span className="badge badge-assigned text-xs">{student.department}</span>
                </td>
                <td className="text-slate-400">Year {student.year}</td>
                <td className="text-slate-400 text-sm">{student.mobile}</td>
                <td>
                  <span className="badge badge-resolved text-xs">Active</span>
                </td>
                <td>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white" data-tooltip="View Profile">
                    <Eye size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={24} /></div>
            <p className="text-slate-400 text-sm">No students match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
