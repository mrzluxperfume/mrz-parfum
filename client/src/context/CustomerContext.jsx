import { createContext, useContext, useMemo, useState } from 'react'

const CustomerContext = createContext(null)
const ACCOUNTS_KEY = 'mrz_customers_v1'
const SESSION_KEY = 'mrz_customer_session'

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.email) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(readSession)

  const register = ({ firstName, lastName, email, password }) => {
    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanPassword = String(password || '')
    const name = String(firstName || '').trim()
    if (!name || !cleanEmail || cleanPassword.length < 6) {
      return {
        ok: false,
        error: 'Indiquez votre prénom, un email, et un mot de passe d’au moins 6 caractères.',
      }
    }
    const accounts = readAccounts()
    if (accounts.some((account) => account.email === cleanEmail)) {
      return { ok: false, error: 'Un compte existe déjà avec cet email.' }
    }
    const account = {
      firstName: name,
      lastName: String(lastName || '').trim(),
      email: cleanEmail,
      password: cleanPassword,
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
    const session = {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCustomer(session)
    return { ok: true }
  }

  const login = (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase()
    const account = readAccounts().find(
      (item) => item.email === cleanEmail && item.password === String(password || ''),
    )
    if (!account) return { ok: false, error: 'Email ou mot de passe incorrect.' }
    const session = {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCustomer(session)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setCustomer(null)
  }

  const value = useMemo(
    () => ({ customer, register, login, logout }),
    [customer],
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
