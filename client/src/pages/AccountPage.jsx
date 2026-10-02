import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import NoIndex from '../components/NoIndex'
import { useCustomer } from '../context/CustomerContext'

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

export default function AccountPage() {
  const { customer, register, login, logout } = useCustomer()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      const result =
        mode === 'register'
          ? await register(form)
          : await login(form.email, form.password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setForm(empty)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="py-14 md:py-20">
      <NoIndex />
      <Container className="max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          MRZ Perfume
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Compte client</h1>

        {customer ? (
          <div className="mt-8 border border-ink/10 bg-fog px-6 py-8">
            <p className="font-display text-2xl">
              Bonjour {customer.firstName}
              {customer.lastName ? ` ${customer.lastName}` : ''}
            </p>
            <p className="mt-3 text-sm text-ink/70">{customer.email}</p>
            <p className="mt-2 text-xs text-ink/50">
              Session sécurisée — le mot de passe n’est jamais stocké en clair.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/shop" variant="outline">
                Voir les parfums
              </Button>
              <Button type="button" variant="primary" onClick={logout}>
                Se déconnecter
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-6 text-[11px] uppercase tracking-[0.16em]">
              <button
                type="button"
                className={mode === 'login' ? 'text-ink' : 'text-ink/40'}
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
              >
                Connexion
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'text-ink' : 'text-ink/40'}
                onClick={() => {
                  setMode('register')
                  setError('')
                }}
              >
                Créer un compte
              </button>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === 'register' && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                      Prénom
                    </span>
                    <input
                      value={form.firstName}
                      onChange={update('firstName')}
                      className="field-input"
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                      Nom
                    </span>
                    <input
                      value={form.lastName}
                      onChange={update('lastName')}
                      className="field-input"
                      autoComplete="family-name"
                    />
                  </label>
                </div>
              )}
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className="field-input"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                  Mot de passe
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={update('password')}
                  className="field-input"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  minLength={8}
                  required
                />
                {mode === 'register' && (
                  <span className="mt-1.5 block text-xs text-ink/50">
                    Au moins 8 caractères.
                  </span>
                )}
              </label>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={pending}>
                {pending
                  ? 'Patientez…'
                  : mode === 'register'
                    ? 'Créer mon compte'
                    : 'Se connecter'}
              </Button>
            </form>
          </>
        )}
      </Container>
    </section>
  )
}
