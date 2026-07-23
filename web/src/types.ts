export type UserRole = 'ADMIN' | 'TECHNICIAN'
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Screen = 'dashboard' | 'work-orders'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
}

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface AuditEntry {
  id: string
  user: string
  action: string
  prevStatus?: WorkOrderStatus
  newStatus?: WorkOrderStatus
  timestamp: string
}

export interface WorkOrder {
  id: string
  title: string
  description: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  assignedTechnician: User
  version: number
  checklist: ChecklistItem[]
  auditLog: AuditEntry[]
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
}

export interface AppState {
  user: User | null
  theme: 'dark' | 'light'
  screen: Screen
  workOrders: WorkOrder[]
  selectedWorkOrderId: string | null
  isDrawerOpen: boolean
  isModalOpen: boolean
  editingWorkOrderId: string | null
  toasts: Toast[]
  isLoading: boolean
  filters: {
    search: string
    status: WorkOrderStatus | ''
    priority: WorkOrderPriority | ''
    assignee: string
  }
  pagination: PaginationMeta
}
