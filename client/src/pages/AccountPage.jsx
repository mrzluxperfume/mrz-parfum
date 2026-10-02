import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
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

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const submit = (e) => {
    e.preventDefault()
    const result =
      mode === 'register'
        ? register(form)
        : login(form.email, form.password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError('')
    setForm(empty)
  }

  return (
    <section className="py-14 md:py-20">
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
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
              </label>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit">
                {mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
              </Button>
            </form>
          </>
        )}
      </Container>
    </section>
  )
}
