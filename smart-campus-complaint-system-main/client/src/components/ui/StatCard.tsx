import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  color: string; // tailwind bg color or hex
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  delay?: number;
}

const StatCard = ({ title, value, icon, color, change, changeType = 'neutral', delay = 0 }: StatCardProps) => {
  const changeColor = changeType === 'up' ? '#10B981' : changeType === 'down' ? '#EF4444' : '#94A3B8';
  const changePrefix = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '';

  return (
    <motion.div
      className="glass glass-hover p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Gradient top border */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: color, transform: 'translate(50%, -50%)' }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-white mt-1">{value}</p>
          {change && (
            <p className="text-xs mt-2" style={{ color: changeColor }}>
              {changePrefix} {change}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
