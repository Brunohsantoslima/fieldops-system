import { useEffect, useState } from 'react'
import {
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { KPISkeleton } from './Skeleton'
import type { WorkOrder, User } from '../types'

interface KPICardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  delta?: string
  delay?: number
}

function KPICard({ label, value, icon, iconBg, iconColor, delta, delay = 0 }: KPICardProps) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 600
    const start = performance.now()
    const frame = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(frame)
    }
    const timer = setTimeout(() => requestAnimationFrame(frame), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div
      className="p-5 rounded-xl border transition-all duration-200 hover:shadow-sm group cursor-default animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1.5 animate-count-up" style={{ color: 'var(--text)' }}>
        {displayed}
      </p>
      {delta && (
        <div className="flex items-center gap-1">
          <TrendingUp size={11} className="text-emerald-400" />
          <p className="text-xs text-emerald-400">{delta}</p>
        </div>
      )}
    </div>
  )
}

interface DashboardScreenProps {
  workOrders: WorkOrder[]
  user: User
  onNavigateToWorkOrders: () => void
  isLoading: boolean
}

export function DashboardScreen({
  workOrders,
  user,
  onNavigateToWorkOrders,
  isLoading,
}: DashboardScreenProps) {
  
  // CORREÇÃO 1: Usando interrogação (?.) para evitar o erro de undefined quando não houver técnico
  const visible =
    user.role === 'ADMIN'
      ? workOrders
      : workOrders.filter((wo) => wo.assignedTechnician?.id === user.id)

  // CORREÇÃO 2: Mantendo os status no seu padrão original (MAIÚSCULO)
  const open = visible.filter((wo) => wo.status === 'OPEN').length
  const inProgress = visible.filter((wo) => wo.status === 'IN_PROGRESS').length
  const done = visible.filter((wo) => wo.status === 'DONE').length
  const highPriority = visible.filter(
    (wo) => (wo.priority === 'HIGH' || wo.priority === 'CRITICAL') && wo.status !== 'DONE',
  ).length

  const recent = [...visible]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Good morning, {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Here's what's happening in your operations today.
        </p>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Open Work Orders"
            value={open}
            icon={<ClipboardList size={16} />}
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#60a5fa"
            delta="+2 this week"
            delay={0}
          />
          <KPICard
            label="In Progress"
            value={inProgress}
            icon={<PlayCircle size={16} />}
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#fbbf24"
            delay={60}
          />
          <KPICard
            label="Completed"
            value={done}
            icon={<CheckCircle2 size={16} />}
            iconBg="rgba(52,211,153,0.12)"
            iconColor="#34d399"
            delta="+3 this month"
            delay={120}
          />
          <KPICard
            label="High Priority"
            value={highPriority}
            icon={<AlertOctagon size={16} />}
            iconBg="rgba(248,113,113,0.12)"
            iconColor="#f87171"
            delay={180}
          />
        </div>
      )}

      {/* Recent Activity */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Recent work orders
          </h3>
          <button
            onClick={onNavigateToWorkOrders}
            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            View all
            <ArrowRight size={12} />
          </button>
        </div>

        <div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No work orders assigned
              </p>
            </div>
          ) : (
            recent.map((wo, idx) => {
              // CORREÇÃO 3: Retornando as chaves de cor para o seu padrão original em MAIÚSCULO
              const statusColor = {
                OPEN: '#60a5fa',
                IN_PROGRESS: '#fbbf24',
                DONE: '#34d399',
              }[wo.status] || '#cbd5e1'

              const priorityLabel = {
                LOW: 'Low',
                MEDIUM: 'Med',
                HIGH: 'High',
                CRITICAL: 'Crit',
              }[wo.priority] || 'N/A'

              return (
                <div
                  key={wo.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-100"
                  style={{
                    borderBottom: idx < recent.length - 1 ? `1px solid var(--border-subtle)` : undefined,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {wo.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {/* CORREÇÃO 4: Checando o nome do técnico com o ?. para não quebrar a tela */}
                      {wo.assignedTechnician?.name || 'Unassigned'}
                    </p>
                  </div>
                  <span
                    className="mono text-xs shrink-0"
                    style={{ color: 'var(--text-subtle)' }}
                  >
                    {wo.id}
                  </span>
                  <span
                    className="text-xs font-medium shrink-0 px-1.5 py-0.5 rounded"
                    style={{
                      color:
                        wo.priority === 'CRITICAL' || wo.priority === 'HIGH'
                          ? '#f87171'
                          : 'var(--text-muted)',
                      backgroundColor:
                        wo.priority === 'CRITICAL' || wo.priority === 'HIGH'
                          ? 'rgba(248,113,113,0.1)'
                          : 'transparent',
                    }}
                  >
                    {priorityLabel}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}