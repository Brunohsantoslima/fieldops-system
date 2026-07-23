import { X, ChevronRight, Clock } from 'lucide-react'
import { StatusBadge, PriorityBadge } from './Badge'
import type { WorkOrder, WorkOrderStatus, User } from '../types'

interface WorkOrderDrawerProps {
  workOrder: WorkOrder
  user: User
  onClose: () => void
  onStatusChange: (id: string, status: WorkOrderStatus) => void
  onChecklistToggle: (woId: string, itemId: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

// Fluxo estrito do backend: OPEN -> IN_PROGRESS -> DONE (DONE é terminal)
const STATUS_FLOW: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE'],
  DONE: [],
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

function formatDate(iso?: string) {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AuditTimeline({ entries }: { entries?: WorkOrder['auditLog'] }) {
  const statusColor: Record<string, string> = {
    OPEN: '#60a5fa',
    IN_PROGRESS: '#fbbf24',
    DONE: '#34d399',
  }

  const safeEntries = Array.isArray(entries) ? entries : []

  return (
    <div className="space-y-0">
      {safeEntries.map((entry: any, idx) => {
        const newStatusUpper = entry.newStatus?.toUpperCase() || entry.toStatus?.toUpperCase()
        const prevStatusUpper = entry.prevStatus?.toUpperCase() || entry.fromStatus?.toUpperCase()
        const userName = typeof entry.user === 'string' ? entry.user : (entry.user?.name || entry.userName || entry.actor || 'System')
        const actionText = entry.action || entry.event || 'Updated status'

        return (
          <div key={entry.id || idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0 ring-2"
                style={{
                  backgroundColor: newStatusUpper
                    ? statusColor[newStatusUpper] || 'var(--text-subtle)'
                    : 'var(--text-subtle)',
                  outline: '2px solid var(--bg-card)',
                }}
              />
              {idx < safeEntries.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ backgroundColor: 'var(--border)' }} />
              )}
            </div>

            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                    {userName}
                  </span>
                  <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
                    {actionText}
                  </span>
                </div>
                <span className="text-xs mono shrink-0" style={{ color: 'var(--text-subtle)' }}>
                  {formatDate(entry.timestamp || entry.createdAt || entry.created_at)}
                </span>
              </div>
              {prevStatusUpper && newStatusUpper && (
                <div className="flex items-center gap-1 mt-1">
                  <StatusBadge status={prevStatusUpper as any} />
                  <ChevronRight size={12} style={{ color: 'var(--text-subtle)' }} />
                  <StatusBadge status={newStatusUpper as any} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WorkOrderDrawer({
  workOrder: wo,
  user,
  onClose,
  onStatusChange,
  onChecklistToggle,
  onEdit,
  onDelete,
}: WorkOrderDrawerProps) {
  const isAdmin = user.role?.toUpperCase() === 'ADMIN'
  const isAssigned = wo.assignedTechnician?.id === user.id
  const canEdit = isAdmin || isAssigned || !wo.assignedTechnician?.id

  const currentStatus = (wo.status?.toUpperCase() || 'OPEN') as WorkOrderStatus
  const currentPriority = (wo.priority?.toUpperCase() || 'LOW') as any

  const nextStatuses = STATUS_FLOW[currentStatus] || []

  const checklist = wo.checklist || (wo as any).items || []
  const completedCount = checklist.filter((i: any) => i.completed || i.done).length
  const totalCount = checklist.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const auditLog = wo.auditLog || (wo as any).events || (wo as any).history || []

  const sectionTitle = (label: string) => (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>
      {label}
    </p>
  )

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 flex flex-col animate-slide-in-right overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="mono text-xs" style={{ color: 'var(--text-subtle)' }}>
                {wo.id}
              </span>
              <span
                className="mono text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-muted)',
                }}
              >
                v{wo.version ?? 1}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
              {wo.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70 shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={currentStatus} />
            <PriorityBadge priority={currentPriority} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Assigned to{' '}
              <span className="font-medium" style={{ color: 'var(--text)' }}>
                {wo.assignedTechnician?.name || 'Unassigned'}
              </span>
            </span>
          </div>

          <div>
            {sectionTitle('Description')}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {wo.description || 'No description provided.'}
            </p>
          </div>

          {canEdit && (
            <div>
              {sectionTitle('Status Transition')}
              <div className="flex gap-2 flex-wrap">
                {(['OPEN', 'IN_PROGRESS', 'DONE'] as WorkOrderStatus[]).map((s) => {
                  const isCurrent = s === currentStatus
                  const isNext = nextStatuses.includes(s)
                  const isDisabled = !isCurrent && !isNext

                  return (
                    <button
                      key={s}
                      disabled={isDisabled || isCurrent}
                      onClick={() => !isDisabled && !isCurrent && onStatusChange(wo.id, s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border"
                      style={{
                        backgroundColor: isCurrent ? 'var(--primary)' : 'transparent',
                        color: isCurrent
                          ? 'white'
                          : isDisabled
                          ? 'var(--text-subtle)'
                          : 'var(--text)',
                        borderColor: isCurrent
                          ? 'var(--primary)'
                          : isDisabled
                          ? 'var(--border-subtle)'
                          : 'var(--border)',
                        opacity: isDisabled ? 0.4 : 1,
                        cursor: isDisabled || isCurrent ? 'default' : 'pointer',
                      }}
                    >
                      {STATUS_LABELS[s]}
                      {isCurrent && ' ✓'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {checklist.length > 0 && (
            <div>
              {sectionTitle(`Checklist — ${completionPct}% complete`)}
              <div
                className="h-1.5 rounded-full mb-3 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-muted)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completionPct}%`,
                    backgroundColor:
                      completionPct === 100 ? '#34d399' : 'var(--primary)',
                  }}
                />
              </div>
              <div className="space-y-2">
                {checklist.map((item: any) => {
                  const isCompleted = Boolean(item.completed || item.done)
                  const itemLabel = item.label || item.text || item.title || 'Checklist item'

                  return (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-100 group"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => canEdit && onChecklistToggle(wo.id, item.id)}
                        disabled={!canEdit}
                        className="mt-0.5 w-3.5 h-3.5 rounded accent-indigo-500 shrink-0"
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: isCompleted ? 'var(--text-subtle)' : 'var(--text)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {itemLabel}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-subtle)' }}>
                Created
              </p>
              <p className="text-xs mono" style={{ color: 'var(--text-muted)' }}>
                {formatDate(wo.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-subtle)' }}>
                Last updated
              </p>
              <p className="text-xs mono" style={{ color: 'var(--text-muted)' }}>
                {formatDate(wo.updatedAt)}
              </p>
            </div>
          </div>

          {auditLog.length > 0 && (
            <div>
              {sectionTitle('Audit timeline')}
              <AuditTimeline entries={auditLog} />
            </div>
          )}
        </div>

        {canEdit && (
          <div
            className="flex items-center justify-between gap-2 px-5 py-4 border-t shrink-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={11} />
              Updated {formatDate(wo.updatedAt)}
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => onDelete(wo.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-red-400 hover:bg-red-500/10 border border-red-500/20"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => onEdit(wo.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                }}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}