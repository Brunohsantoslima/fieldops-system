import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { USERS } from '../mockData'
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../types'

interface WorkOrderModalProps {
  workOrder?: WorkOrder | null
  onClose: () => void
  onSave: (data: Partial<WorkOrder>) => void
}

interface ChecklistDraft {
  id: string
  label: string
  completed: boolean
}

export function WorkOrderModal({ workOrder, onClose, onSave }: WorkOrderModalProps) {
  const isEdit = Boolean(workOrder)

  const [title, setTitle] = useState(workOrder?.title ?? '')
  const [description, setDescription] = useState(workOrder?.description ?? '')
  const [priority, setPriority] = useState<WorkOrderPriority>(workOrder?.priority ?? 'MEDIUM')
  const [status, setStatus] = useState<WorkOrderStatus>(workOrder?.status ?? 'OPEN')
  const [technicianId, setTechnicianId] = useState(
    workOrder?.assignedTechnician.id ?? USERS.find((u) => u.role === 'TECHNICIAN')?.id ?? '',
  )
  const [checklist, setChecklist] = useState<ChecklistDraft[]>(
    workOrder?.checklist ?? [],
  )
  const [newItem, setNewItem] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!technicianId) e.technician = 'Please assign a technician'
    return e
  }

  const handleAddItem = () => {
    if (!newItem.trim()) return
    setChecklist((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, label: newItem.trim(), completed: false },
    ])
    setNewItem('')
  }

  const handleRemoveItem = (id: string) => {
    setChecklist((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    const technician = USERS.find((u) => u.id === technicianId)!
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignedTechnician: technician,
      checklist,
    })
    setIsSaving(false)
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all'
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    backgroundColor: 'var(--input-bg)',
    borderColor: hasError ? '#f87171' : 'var(--border)',
    color: 'var(--text)',
  })

  const technicians = USERS.filter((u) => u.role === 'TECHNICIAN')

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-lg rounded-xl border shadow-2xl animate-slide-in-up flex flex-col max-h-[90vh]"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {isEdit ? 'Edit Work Order' : 'Create Work Order'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (errors.title) setErrors((p) => ({ ...p, title: '' }))
                  }}
                  placeholder="e.g. HVAC Maintenance — Building A"
                  className={inputClass}
                  style={inputStyle(Boolean(errors.title))}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the work required…"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  style={inputStyle()}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                    className={inputClass}
                    style={inputStyle()}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                    className={inputClass}
                    style={inputStyle()}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Technician */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Assign Technician <span className="text-red-400">*</span>
                </label>
                <select
                  value={technicianId}
                  onChange={(e) => {
                    setTechnicianId(e.target.value)
                    if (errors.technician) setErrors((p) => ({ ...p, technician: '' }))
                  }}
                  className={inputClass}
                  style={inputStyle(Boolean(errors.technician))}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  <option value="">Select a technician…</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.technician && (
                  <p className="mt-1 text-xs text-red-400">{errors.technician}</p>
                )}
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  Checklist items
                </label>
                <div className="space-y-1.5 mb-2">
                  {checklist.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-xs w-4 text-right shrink-0" style={{ color: 'var(--text-subtle)' }}>
                        {idx + 1}.
                      </span>
                      <span className="flex-1 text-sm py-1.5 px-2 rounded-md" style={{ color: 'var(--text)', backgroundColor: 'var(--bg-muted)' }}>
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded transition-opacity opacity-40 hover:opacity-100 text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem() } }}
                    placeholder="Add checklist item…"
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                    style={inputStyle()}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)' }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-muted)',
                    }}
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: isSaving ? 'var(--bg-muted)' : 'var(--primary)',
                  color: isSaving ? 'var(--text-muted)' : 'white',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  'Save changes'
                ) : (
                  'Create work order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
