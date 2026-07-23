import { useState, useEffect, useCallback } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { DashboardScreen } from './components/DashboardScreen'
import { WorkOrdersScreen } from './components/WorkOrdersScreen'
import { WorkOrderDrawer } from './components/WorkOrderDrawer'
import { WorkOrderModal } from './components/WorkOrderModal'
import { ToastContainer } from './components/Toast'
import type { User, WorkOrder, WorkOrderStatus, Toast, Screen } from './types'

let toastIdCounter = 0
const API_URL = 'http://localhost:3333'

export default function App() {
  // 1. Estados da Aplicação
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  // 2. Tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // 3. Sistema de Notificações (Toasts)
  const addToast = useCallback((type: Toast['type'], message: string, description?: string) => {
    const id = `toast-${++toastIdCounter}`
    setToasts((prev) => [...prev, { id, type, message, description }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // 4. Integração Real com API
  const fetchWorkOrders = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/work-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setWorkOrders(Array.isArray(data) ? data : data.data || [])
      } else {
        addToast('error', 'Falha ao buscar ordens de serviço')
      }
    } catch (error) {
      addToast('error', 'Erro de conexão com o servidor')
    } finally {
      setIsLoading(false)
    }
  }, [user, addToast])

  useEffect(() => {
    fetchWorkOrders()
  }, [fetchWorkOrders])

  // 5. Funções de Autenticação
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setScreen('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setScreen('dashboard')
    setIsDrawerOpen(false)
    setIsModalOpen(false)
    setGlobalSearch('')
    addToast('info', 'Signed out successfully')
  }

  // 6. Funções de UI
  const handleSelectWorkOrder = (id: string) => {
    setSelectedWorkOrderId(id)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedWorkOrderId(null), 300)
  }

  const handleEditWorkOrder = (id: string) => {
    setEditingWorkOrderId(id)
    setIsModalOpen(true)
    setIsDrawerOpen(false)
  }

  const handleCreateNew = () => {
    setEditingWorkOrderId(null)
    setIsModalOpen(true)
  }

  // 7. Funções de CRUD (API Calls)
  const handleSaveWorkOrder = async (data: Partial<WorkOrder>) => {
    const token = localStorage.getItem('token')
    const targetId = data.id || editingWorkOrderId
    const isEditing = !!targetId
    const url = isEditing ? `${API_URL}/work-orders/${targetId}` : `${API_URL}/work-orders`
    const method = isEditing ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        addToast('success', isEditing ? 'Work order updated' : 'Work order created')
        await fetchWorkOrders()
        setIsModalOpen(false)
        setEditingWorkOrderId(null)
      } else {
        addToast('error', 'Erro ao salvar ordem de serviço')
      }
    } catch (error) {
      addToast('error', 'Erro de conexão com o servidor')
    }
  }

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/work-orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setWorkOrders((prev) => prev.filter((wo) => wo.id !== id))
        setIsDrawerOpen(false)
        setSelectedWorkOrderId(null)
        addToast('success', 'Work order deleted')
      } else if (response.status === 403) {
        addToast('error', 'Apenas administradores podem excluir ordens')
      } else {
        addToast('error', 'Erro ao tentar deletar')
      }
    } catch (error) {
      addToast('error', 'Erro de conexão com o servidor')
    }
  }

  // Handler robusto e limpo para transição de Status
  const handleStatusChange = async (id: string, newStatus: WorkOrderStatus) => {
    const token = localStorage.getItem('token')
    const currentWo = workOrders.find((w) => w.id === id)

    const formattedStatus = newStatus.toLowerCase()

    // Payload estritamente limpo: envia APENAS status (e resolutionNotes se for done)
    const payload: Record<string, any> = {
      status: formattedStatus,
    }

    if (formattedStatus === 'done') {
      payload.resolutionNotes =
        (currentWo as any)?.resolutionNotes ||
        'Manutenção preventiva executada e testada conforme checklist.'
    }

    // Atualização otimista na UI
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: newStatus } : wo))
    )

    try {
      const response = await fetch(`${API_URL}/work-orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        addToast('success', `Status alterado para ${newStatus}`)
        await fetchWorkOrders()
      } else {
        const errorDetail = await response.json().catch(() => ({}))
        const msg =
          errorDetail?.error?.details ||
          errorDetail?.error?.message ||
          errorDetail?.message ||
          'Erro ao alterar status'

        addToast('error', 'Falha ao alterar status', typeof msg === 'object' ? JSON.stringify(msg) : String(msg))
        await fetchWorkOrders() // Reverte estado na tela se o backend rejeitar
      }
    } catch (error) {
      console.error(error)
      addToast('error', 'Erro de conexão com o servidor')
      await fetchWorkOrders()
    }
  }

  const handleChecklistToggle = (woId: string, itemId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo
        const safeChecklist = wo.checklist || (wo as any).items || []
        const updated = safeChecklist.map((item: any) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
        return { ...wo, checklist: updated, updatedAt: new Date().toISOString() }
      })
    )
  }

  // 8. Renderização
  const screenTitles: Record<Screen, string> = {
    dashboard: 'Dashboard',
    'work-orders': 'Work Orders',
  }

  const selectedWorkOrder = workOrders.find((wo) => wo.id === selectedWorkOrderId) ?? null
  const editingWorkOrder = workOrders.find((wo) => wo.id === editingWorkOrderId) ?? null

  if (!user) {
    return (
      <>
        <LoginScreen
          theme={theme}
          onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onLogin={handleLogin}
          onToast={addToast}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar
        user={user}
        screen={screen}
        onNavigate={(s) => {
          setScreen(s)
          setGlobalSearch('')
        }}
        onLogout={handleLogout}
      />

      <Navbar
        user={user}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        screenTitle={screenTitles[screen]}
      />

      <main style={{ marginLeft: 224, paddingTop: 52, minHeight: '100vh' }}>
        <div className="p-6">
          {screen === 'dashboard' && (
            <DashboardScreen
              workOrders={workOrders}
              user={user}
              onNavigateToWorkOrders={() => setScreen('work-orders')}
              isLoading={isLoading}
            />
          )}
          {screen === 'work-orders' && (
            <WorkOrdersScreen
              workOrders={workOrders}
              user={user}
              isLoading={isLoading}
              onSelectWorkOrder={handleSelectWorkOrder}
              onCreateNew={handleCreateNew}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
            />
          )}
        </div>
      </main>

      {isDrawerOpen && selectedWorkOrder && (
        <WorkOrderDrawer
          workOrder={selectedWorkOrder}
          user={user}
          onClose={handleCloseDrawer}
          onStatusChange={handleStatusChange}
          onChecklistToggle={handleChecklistToggle}
          onEdit={handleEditWorkOrder}
          onDelete={handleDeleteWorkOrder}
        />
      )}

      {isModalOpen && (
        <WorkOrderModal
          workOrder={editingWorkOrder}
          onClose={() => {
            setIsModalOpen(false)
            setEditingWorkOrderId(null)
          }}
          onSave={handleSaveWorkOrder}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}