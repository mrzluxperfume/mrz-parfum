import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { hashPassword, isStrongPassword, verifyPassword } from '../utils/crypto'

const CustomerContext = createContext(null)
const ACCOUNTS_KEY = 'mrz_customers_v2'
const LEGACY_ACCOUNTS_KEY = 'mrz_customers_v1'
const SESSION_KEY = 'mrz_customer_session'

function authEndpoint() {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
  return `${base}/auth`
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  localStorage.removeItem(LEGACY_ACCOUNTS_KEY)
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.email && !parsed.password && !parsed.passwordHash) return parsed
  } catch {
    /* ignore */
  }
  return null
}

function toSession(account) {
  return {
    firstName: account.firstName,
    lastName: account.lastName || '',
    email: account.email,
  }
}

async function apiAuth(payload) {
  const response = await fetch(authEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false, error: data.error || 'Erreur d’authentification.' }
  }
  return { ok: true, customer: data.customer }
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(readSession)

  const persistSession = (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCustomer(session)
  }

  const register = useCallback(async ({ firstName, lastName, email, password }) => {
    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanPassword = String(password || '')
    const name = String(firstName || '').trim()

    if (!name || !cleanEmail || !isStrongPassword(cleanPassword)) {
      return {
        ok: false,
        error:
          'Indiquez votre prénom, un email, et un mot de passe d’au moins 8 caractères.',
      }
    }

    if (isSupabaseConfigured) {
      try {
        const result = await apiAuth({
          action: 'register',
          firstName: name,
          lastName: String(lastName || '').trim(),
          email: cleanEmail,
          password: cleanPassword,
        })
        if (!result.ok) return result
        persistSession(result.customer)
        return { ok: true }
      } catch {
        return {
          ok: false,
          error: 'Serveur d’authentification indisponible.',
        }
      }
    }

    const accounts = readAccounts()
    if (accounts.some((account) => account.email === cleanEmail)) {
      return { ok: false, error: 'Un compte existe déjà avec cet email.' }
    }

    const passwordHash = await hashPassword(cleanPassword)
    const account = {
      firstName: name,
      lastName: String(lastName || '').trim(),
      email: cleanEmail,
      passwordHash,
    }
    writeAccounts([...accounts, account])
    persistSession(toSession(account))
    return { ok: true }
  }, [])

  const login = useCallback(async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanPassword = String(password || '')

    if (isSupabaseConfigured) {
      try {
        const result = await apiAuth({
          action: 'login',
          email: cleanEmail,
          password: cleanPassword,
        })
        if (!result.ok) return result
        persistSession(result.customer)
        return { ok: true }
      } catch {
        return {
          ok: false,
          error: 'Serveur d’authentification indisponible.',
        }
      }
    }

    const accounts = readAccounts()
    const account = accounts.find((item) => item.email === cleanEmail)
    if (!account?.passwordHash) {
      return {
        ok: false,
        error:
          'Compte introuvable ou obsolète. Créez un nouveau compte sécurisé.',
      }
    }

    const valid = await verifyPassword(cleanPassword, account.passwordHash)
    if (!valid) return { ok: false, error: 'Email ou mot de passe incorrect.' }

    persistSession(toSession(account))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setCustomer(null)
  }, [])

  const value = useMemo(
    () => ({ customer, register, login, logout }),
    [customer, register, login, logout],
  )

  return (
    <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider')
  return ctx
}
