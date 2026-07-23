import { useState } from 'react'
import { Search, Plus, ChevronLeft, ChevronRight, FileX, RefreshCw } from 'lucide-react'
import { StatusBadge, PriorityBadge } from './Badge'
import { TableRowSkeleton } from './Skeleton'
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority, User } from '../types'
import { USERS } from '../mockData'

interface WorkOrdersScreenProps {
  workOrders: WorkOrder[]
  user: User
  isLoading: boolean
  onSelectWorkOrder: (id: string) => void
  onCreateNew: () => void
  globalSearch: string
  onGlobalSearchChange: (v: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const PER_PAGE = 6

export function WorkOrdersScreen({
  workOrders,
  user,
  isLoading,
  onSelectWorkOrder,
  onCreateNew,
  globalSearch,
  onGlobalSearchChange,
}: WorkOrdersScreenProps) {
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | ''>('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [page, setPage] = useState(1)

  const technicians = USERS.filter((u) => u.role === 'TECHNICIAN')

  const visible =
    user.role?.toUpperCase() === 'ADMIN'
      ? workOrders
      : workOrders.filter((wo) => wo.assignedTechnician?.id === user.id)

  const filtered = visible.filter((wo) => {
    // CORREÇÃO 1: Deixando a comparação imune a maiúsculas/minúsculas (ex: "OPEN" vs "open")
    if (statusFilter && wo.status?.toUpperCase() !== statusFilter.toUpperCase()) return false
    if (priorityFilter && wo.priority?.toUpperCase() !== priorityFilter.toUpperCase()) return false
    if (assigneeFilter && wo.assignedTechnician?.id !== assigneeFilter) return false
    
    if (globalSearch) {
      const q = globalSearch.toLowerCase()
      if (
        !wo.id.toLowerCase().includes(q) &&
        !wo.title.toLowerCase().includes(q) &&
        // CORREÇÃO 2: Protegendo a busca para não quebrar em ordens sem técnico
        !(wo.assignedTechnician?.name || '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const handleFilterChange = () => setPage(1)

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-muted)',
    borderColor: 'var(--border)',
    color: 'var(--text-muted)',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile search */}
          <div className="relative sm:hidden">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => { onGlobalSearchChange(e.target.value); handleFilterChange() }}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none w-40"
              style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as WorkOrderStatus | ''); handleFilterChange() }}
            style={selectStyle}
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as WorkOrderPriority | ''); handleFilterChange() }}
            style={selectStyle}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Assignee filter — admin only */}
          {user.role?.toUpperCase() === 'ADMIN' && (
            <select
              value={assigneeFilter}
              onChange={(e) => { setAssigneeFilter(e.target.value); handleFilterChange() }}
              style={selectStyle}
            >
              <option value="">All technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {(statusFilter || priorityFilter || assigneeFilter || globalSearch) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setPriorityFilter('')
                setAssigneeFilter('')
                onGlobalSearchChange('')
                setPage(1)
              }}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw size={11} />
              Clear
            </button>
          )}
        </div>

        {user.role?.toUpperCase() === 'ADMIN' && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <Plus size={14} />
            New Work Order
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Title', 'Priority', 'Status', 'Assigned To', 'Ver.', 'Created', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium tracking-wide"
                      style={{ color: 'var(--text-subtle)' }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FileX size={28} className="mx-auto mb-3 opacity-25" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                      No work orders found
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
                      {user.role?.toUpperCase() !== 'ADMIN' 
                        ? "You don't have any work orders assigned to you."
                        : "Try adjusting your filters"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((wo) => (
                  <tr
                    key={wo.id}
                    className="cursor-pointer transition-colors duration-100"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onClick={() => onSelectWorkOrder(wo.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="mono text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {wo.id.split('-')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium truncate" style={{ color: 'var(--text)', fontSize: 13 }}>
                        {wo.title}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {/* CORREÇÃO 3: Protegendo a descrição caso venha vazia */}
                        {(wo.description || '').slice(0, 60)}…
                      </p>
                    </td>
                    <td className="px-4 py-3">
  <PriorityBadge priority={wo.priority?.toUpperCase() as any} />
</td>
<td className="px-4 py-3">
  <StatusBadge status={wo.status?.toUpperCase() as any} />
</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: 10 }}
                        >
                          {/* CORREÇÃO 4: Protegendo o Avatar para técnicos não atribuídos */}
                          {wo.assignedTechnician?.avatar || '-'}
                        </div>
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {/* CORREÇÃO 5: Protegendo o Nome */}
                          {wo.assignedTechnician?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="mono text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                      >
                        v{wo.version}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(wo.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--bg-muted)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectWorkOrder(wo.id)
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of{' '}
              {filtered.length} results
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <ChevronLeft size={14} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: safePage === i + 1 ? 'var(--primary)' : 'transparent',
                    color: safePage === i + 1 ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}