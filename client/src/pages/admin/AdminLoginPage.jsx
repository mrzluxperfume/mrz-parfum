import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { brand } from '../../data/brand'

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(username, password)
    if (result.ok) {
      navigate('/admin')
      return
    }
    setError(result.error || 'Connexion impossible')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fog px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-ink/10 bg-white p-8 shadow-sm md:p-10"
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
          Espace admin
        </p>
        <h1 className="mt-2 font-display text-4xl">{brand.name}</h1>
        <p className="mt-2 text-sm text-ink/65">
          Connectez-vous pour gérer les produits et les commandes.
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
              Nom d&apos;utilisateur
            </span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              className="field-input"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
              Mot de passe
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="field-input"
              required
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="full" className="mt-8">
          Se connecter
        </Button>
      </motion.form>
    </div>
  )
}
