import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Settings, Bell, Shield, Palette, Mail, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange} className="transition-colors">
    {value
      ? <ToggleRight size={28} className="text-primary" />
      : <ToggleLeft size={28} className="text-slate-600" />
    }
  </button>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoAssign: true,
    urgentAlerts: true,
    publicTracking: true,
    maintenanceMode: false,
    maxFileSize: '10',
    resolutionDeadline: '48',
    adminEmail: 'admin@campus.edu',
    campusName: 'Engineering College Campus',
  });

  const update = (key: string, value: string | boolean) =>
    setSettings((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Settings saved successfully!');
  };

  const SECTIONS = [
    {
      icon: Bell, title: 'Notifications', color: '#2563EB',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for complaint updates' },
        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS for critical complaints' },
        { key: 'urgentAlerts', label: 'Urgent Alerts', desc: 'Immediate alerts for critical priority complaints' },
      ],
    },
    {
      icon: Shield, title: 'System', color: '#7C3AED',
      items: [
        { key: 'autoAssign', label: 'Auto Assignment', desc: 'Automatically assign complaints based on AI recommendations' },
        { key: 'publicTracking', label: 'Public Tracking', desc: 'Allow tracking without login via complaint ID' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable new complaint submissions' },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Configure your Smart Campus system preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#06B6D422' }}>
              <Settings size={18} className="text-accent" />
            </div>
            <h3 className="font-semibold text-white">General Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Campus Name</label>
              <input className="input-glass" value={settings.campusName} onChange={(e) => update('campusName', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Admin Email</label>
              <input className="input-glass" type="email" value={settings.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Max File Size (MB)</label>
                <input className="input-glass" type="number" value={settings.maxFileSize} onChange={(e) => update('maxFileSize', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Resolution Deadline (hrs)</label>
                <input className="input-glass" type="number" value={settings.resolutionDeadline} onChange={(e) => update('resolutionDeadline', e.target.value)} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toggle sections */}
        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 + 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${section.color}22` }}>
                <section.icon size={18} style={{ color: section.color }} />
              </div>
              <h3 className="font-semibold text-white">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    value={settings[item.key as keyof typeof settings] as boolean}
                    onChange={() => update(item.key, !settings[item.key as keyof typeof settings])}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Save button */}
        <button className="btn-primary py-3.5 px-8" onClick={handleSave}>
          <Save size={16} /> Save All Settings
        </button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
