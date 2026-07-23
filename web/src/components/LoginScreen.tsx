import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { User } from '../types'

interface LoginScreenProps {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onLogin: (user: User) => void
  onToast: (type: 'success' | 'error', message: string, description?: string) => void
}

export function LoginScreen({ onLogin, onToast }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      // Fazendo a requisição real para a nossa API Fastify
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      // Extraímos a resposta do backend (JSON)
      const data = await response.json()

      // Salvamos o token no cofre do navegador
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // Avisamos o App.tsx que o login deu certo
      onLogin(data.user)
      onToast('success', 'Login realizado com sucesso!')
    } catch (error) {
      setErrors({ email: 'Credenciais inválidas' })
      onToast('error', 'Falha no login', 'Verifique seu email e senha.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
    'w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors duration-200'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-muted)' }}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Field operations management platform
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="you@fieldops.io"
                  className={inputBase}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.email ? '#f87171' : 'var(--border)',
                    color: 'var(--text)',
                    boxShadow: errors.email ? '0 0 0 2px rgba(248,113,113,0.2)' : undefined,
                  }}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    placeholder="••••••••"
                    className={`${inputBase} pr-10`}
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: errors.password ? '#f87171' : 'var(--border)',
                      color: 'var(--text)',
                      boxShadow: errors.password ? '0 0 0 2px rgba(248,113,113,0.2)' : undefined,
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-indigo-500"
                />
                <label
                  htmlFor="remember"
                  className="text-xs cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 mt-2"
                style={{
                  backgroundColor: isLoading ? 'var(--bg-muted)' : 'var(--primary)',
                  color: isLoading ? 'var(--text-muted)' : 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}