import { Search, Bell, Sun, Moon } from 'lucide-react'
import { RoleBadge } from './Badge'
import type { User } from '../types'

interface NavbarProps {
  user: User
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  searchValue: string
  onSearchChange: (v: string) => void
  screenTitle: string
}

export function Navbar({
  user,
  theme,
  onThemeToggle,
  searchValue,
  onSearchChange,
  screenTitle,
}: NavbarProps) {
  return (
    <header
      className="fixed top-0 right-0 left-56 h-13 flex items-center justify-between px-5 border-b z-20"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border)',
        height: 52,
      }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {screenTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-subtle)' }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search work orders…"
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none transition-all w-52"
            style={{
              backgroundColor: 'var(--bg-muted)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)'
              e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        </button>

        {/* Theme */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Divider */}
        <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

        {/* User */}
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            {user.avatar}
          </div>
        </div>
      </div>
    </header>
  )
}
