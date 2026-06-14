import { ComplaintStatus, Priority } from '../../types';

interface BadgeProps {
  status?: ComplaintStatus;
  priority?: Priority;
  className?: string;
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; className: string; dot: string }> = {
  pending: { label: 'Pending', className: 'badge-pending', dot: '#FBBF24' },
  assigned: { label: 'Assigned', className: 'badge-assigned', dot: '#6366F1' },
  in_progress: { label: 'In Progress', className: 'badge-in-progress', dot: '#F59E0B' },
  resolved: { label: 'Resolved', className: 'badge-resolved', dot: '#10B981' },
  closed: { label: 'Closed', className: 'badge-closed', dot: '#94A3B8' },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'badge-low' },
  medium: { label: 'Medium', className: 'badge-medium' },
  high: { label: 'High', className: 'badge-high' },
  critical: { label: 'Critical', className: 'badge-urgent' },
};

export const StatusBadge = ({ status, className = '' }: { status: ComplaintStatus; className?: string }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`badge ${config.className} ${className}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, display: 'inline-block', flexShrink: 0 }} />
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }: { priority: Priority; className?: string }) => {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};

export default BadgeProps;
