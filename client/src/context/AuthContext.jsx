import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'mrz_admin_session'
const SESSION_MAX_MS = 1000 * 60 * 60 * 8

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'mrzparfum'
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || ''

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.username !== ADMIN_USER || !parsed?.ok) return null
    const loggedInAt = Date.parse(parsed.loggedInAt || '')
    if (!Number.isFinite(loggedInAt) || Date.now() - loggedInAt > SESSION_MAX_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  const login = (username, password) => {
    const user = String(username || '').trim()
    const pass = String(password || '')

    if (!ADMIN_PASS) {
      return {
        ok: false,
        error: 'Admin non configuré. Ajoutez VITE_ADMIN_PASS dans .env.',
      }
    }

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      const next = {
        ok: true,
        username: ADMIN_USER,
        loggedInAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSession(next)
      return { ok: true }
    }
    return { ok: false, error: 'Identifiants incorrects' }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.ok),
      session,
      login,
      logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
