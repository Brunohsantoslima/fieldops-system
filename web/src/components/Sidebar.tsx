import { LayoutDashboard, ClipboardList, Users, Settings, LogOut, Zap } from 'lucide-react'
import type { User, Screen } from '../types'

interface SidebarProps {
  user: User
  screen: Screen
  onNavigate: (screen: Screen) => void
  onLogout: () => void
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 group"
      style={{
        backgroundColor: active ? 'var(--bg-muted)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
          e.currentTarget.style.color = 'var(--text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }
      }}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      {label}
    </button>
  )
}

export function Sidebar({ user, screen, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-56 border-r flex flex-col z-30"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Zap size={14} color="white" fill="white" />
        </div>
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          FieldOps
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <NavItem
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          active={screen === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          icon={<ClipboardList size={15} />}
          label="Work Orders"
          active={screen === 'work-orders'}
          onClick={() => onNavigate('work-orders')}
        />
        {user.role === 'ADMIN' && (
          <NavItem
            icon={<Users size={15} />}
            label="Users"
            active={false}
            onClick={() => {}}
          />
        )}
        <NavItem
          icon={<Settings size={15} />}
          label="Settings"
          active={false}
          onClick={() => {}}
        />
      </nav>

      {/* User footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1"
          style={{ backgroundColor: 'var(--bg-muted)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user.role === 'ADMIN' ? 'Administrator' : 'Technician'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-100 text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
