import type { WorkOrderStatus, WorkOrderPriority, UserRole } from '../types'

interface StatusBadgeProps {
  status: WorkOrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    OPEN: {
      label: 'Open',
      bg: 'rgba(59,130,246,0.12)',
      color: '#60a5fa',
      dot: '#3b82f6',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'rgba(245,158,11,0.12)',
      color: '#fbbf24',
      dot: '#f59e0b',
    },
    DONE: {
      label: 'Done',
      bg: 'rgba(52,211,153,0.12)',
      color: '#34d399',
      dot: '#10b981',
    },
  }

  const c = config[status]

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: c.dot }}
      />
      {c.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: WorkOrderPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    LOW: { label: 'Low', bg: 'rgba(161,161,170,0.1)', color: '#a1a1aa' },
    MEDIUM: { label: 'Medium', bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
    HIGH: { label: 'High', bg: 'rgba(251,146,60,0.12)', color: '#fb923c' },
    CRITICAL: { label: 'Critical', bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  }

  const c = config[priority]

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    ADMIN: { label: 'Admin', bg: 'rgba(129,140,248,0.15)', color: '#818cf8' },
    TECHNICIAN: { label: 'Technician', bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
  };

  // Aqui está a mágica: se config[role] for undefined, ele usa o objeto neutro (cinza)
  const c = config[role] || { 
    label: role || 'Desconhecido', 
    bg: 'rgba(161,161,170,0.1)', 
    color: '#a1a1aa' 
  };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
