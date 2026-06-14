import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileText, Download, Calendar, BarChart3, Users, Clock, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'complaints', title: 'Complaints Report', desc: 'Full list of all complaints with status and timeline', icon: FileText, color: '#2563EB' },
  { id: 'analytics', title: 'Analytics Summary', desc: 'Category breakdown, trends, and resolution statistics', icon: BarChart3, color: '#7C3AED' },
  { id: 'staff', title: 'Staff Performance', desc: 'Individual staff metrics, resolved counts, and ratings', icon: Users, color: '#06B6D4' },
  { id: 'resolution', title: 'Resolution Times', desc: 'Average resolution time by category and priority', icon: Clock, color: '#F59E0B' },
];

const AdminReports = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-10-31' });

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(null);
    toast.success(`${format.toUpperCase()} report generated! (Demo mode — download simulated)`);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Reports</h1>
        <p className="text-slate-400 text-sm">Generate and download comprehensive campus reports</p>
      </div>

      {/* Settings */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Report Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Format</label>
            <div className="flex gap-2">
              {(['pdf', 'excel'] as const).map((f) => (
                <button
                  key={f}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${format === f ? 'bg-primary text-white' : 'glass-sm text-slate-400 hover:text-white'}`}
                  onClick={() => setFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">From Date</label>
            <input
              type="date"
              className="input-glass h-10 text-sm"
              value={dateRange.from}
              onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">To Date</label>
            <input
              type="date"
              className="input-glass h-10 text-sm"
              value={dateRange.to}
              onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${report.color}22`, border: `1px solid ${report.color}44` }}
            >
              <report.icon size={22} style={{ color: report.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{report.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{report.desc}</p>
              <button
                className="btn-primary py-2 px-5 text-sm"
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
              >
                {generating === report.id ? (
                  <><Loader size={14} className="animate-spin" /> Generating...</>
                ) : (
                  <><Download size={14} /> Generate {format.toUpperCase()}</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="mt-6 glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'October_Complaints_Report.pdf', date: '2024-10-30', size: '2.4 MB', type: 'pdf' },
            { name: 'Q3_Analytics_Summary.xlsx', date: '2024-09-30', size: '1.8 MB', type: 'excel' },
            { name: 'Staff_Performance_Sep.pdf', date: '2024-09-28', size: '892 KB', type: 'pdf' },
          ].map((report) => (
            <div key={report.name} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: report.type === 'pdf' ? '#EF444422' : '#10B98122', border: `1px solid ${report.type === 'pdf' ? '#EF444444' : '#10B98144'}` }}>
                  {report.type.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{report.name}</p>
                  <p className="text-slate-500 text-xs">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
