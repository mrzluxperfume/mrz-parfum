import { useEffect, useMemo, useState } from 'react'
import { Mail, Send, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

function apiBase() {
  return (
    import.meta.env.PROD
      ? '/api'
      : import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  ).replace(/\/$/, '')
}

const emptyForm = {
  subject: 'Offre exclusive MRZ Perfume',
  title: 'Une remise pour vous',
  message:
    'Retrouvez notre sélection de fragrances et profitez d’une offre réservée à nos clients.',
  discountCode: 'MRZ10',
  discountLabel: '−10 % sur votre prochaine commande',
  ctaLabel: 'Voir la boutique',
  ctaUrl: 'https://www.mrz-perfume.fr/shop',
}

export default function AdminNewsletterPage() {
  const { adminToken } = useAuth()
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(() => new Set())
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'X-Mrz-Admin': adminToken || '',
    }),
    [adminToken],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${apiBase()}/newsletter`, { headers })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger les clients.')
        }
        if (cancelled) return
        const list = data.customers || []
        setCustomers(list)
        setSelected(new Set(list.map((c) => c.email)))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erreur de chargement.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [headers])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setResult(null)
  }

  const toggle = (email) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === customers.length
        ? new Set()
        : new Set(customers.map((c) => c.email)),
    )
  }

  const send = async (e) => {
    e.preventDefault()
    if (!selected.size) {
      setError('Sélectionnez au moins un destinataire.')
      return
    }
    setSending(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`${apiBase()}/newsletter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          emails: [...selected],
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Envoi impossible.')
      }
      setResult(data)
    } catch (err) {
      setError(err.message || 'Envoi impossible.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl">Newsletter</h2>
        <p className="mt-2 text-sm text-ink/65">
          Liste des comptes clients et envoi d&apos;emails promotionnels.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-ink/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Clients inscrits
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums">
            {customers.length}
          </p>
        </div>
        <div className="border border-ink/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Sélectionnés
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums">
            {selected.size}
          </p>
        </div>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {result && (
        <p className="border border-forest/20 bg-white px-4 py-3 text-sm text-ink/80">
          Envoyés : {result.sent}/{result.total}
          {result.failed ? ` — échecs : ${result.failed}` : ''}
          {result.errors?.length ? (
            <span className="mt-2 block text-xs text-ink/55">
              {result.errors.join(' · ')}
            </span>
          ) : null}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <section className="border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-forest" />
              <h3 className="text-[11px] uppercase tracking-[0.14em]">
                Destinataires
              </h3>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] uppercase tracking-[0.12em] text-ink/60 transition hover:text-ink"
            >
              {selected.size === customers.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-ink/55">Chargement…</p>
          ) : customers.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink/55">
              Aucun compte client pour le moment.
            </p>
          ) : (
            <ul className="max-h-[420px] divide-y divide-ink/5 overflow-y-auto">
              {customers.map((customer) => {
                const checked = selected.has(customer.email)
                return (
                  <li key={customer.email}>
                    <label className="flex cursor-pointer items-start gap-3 px-5 py-3.5 transition hover:bg-fog/70">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(customer.email)}
                        className="mt-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {customer.firstName} {customer.lastName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink/55">
                          {customer.email}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-muted">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString(
                              'fr-FR',
                            )
                          : '—'}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="space-y-6">
          <form
            onSubmit={send}
            className="space-y-4 border border-ink/10 bg-white p-5 md:p-6"
          >
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-forest" />
              <h3 className="text-[11px] uppercase tracking-[0.14em]">
                Composer l&apos;email
              </h3>
            </div>

            <Field label="Objet">
              <input
                value={form.subject}
                onChange={update('subject')}
                className="field-input"
                required
              />
            </Field>
            <Field label="Titre">
              <input
                value={form.title}
                onChange={update('title')}
                className="field-input"
                required
              />
            </Field>
            <Field label="Message">
              <textarea
                value={form.message}
                onChange={update('message')}
                className="field-input min-h-32"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code remise">
                <input
                  value={form.discountCode}
                  onChange={update('discountCode')}
                  className="field-input"
                  placeholder="MRZ10"
                />
              </Field>
              <Field label="Libellé remise">
                <input
                  value={form.discountLabel}
                  onChange={update('discountLabel')}
                  className="field-input"
                  placeholder="−10 % sur la commande"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texte du bouton">
                <input
                  value={form.ctaLabel}
                  onChange={update('ctaLabel')}
                  className="field-input"
                />
              </Field>
              <Field label="Lien du bouton">
                <input
                  value={form.ctaUrl}
                  onChange={update('ctaUrl')}
                  className="field-input"
                />
              </Field>
            </div>

            <Button type="submit" disabled={sending || selected.size === 0}>
              <span className="inline-flex items-center gap-2">
                <Send className="size-3.5" />
                {sending
                  ? 'Envoi en cours…'
                  : `Envoyer à ${selected.size} client${selected.size > 1 ? 's' : ''}`}
              </span>
            </Button>
          </form>

          <EmailPreview form={form} />
        </section>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
        {label}
      </span>
      {children}
    </label>
  )
}

function EmailPreview({ form }) {
  return (
    <div className="overflow-hidden border border-ink/10 bg-[#f7f5f2]">
      <p className="border-b border-ink/10 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.14em]">
        Aperçu email
      </p>
      <div className="px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-[520px] border border-[#e8e2da] bg-white">
          <div className="border-b border-[#eee8e0] px-8 py-7 text-center">
            <p className="font-display text-2xl tracking-[0.22em]">MRZ</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#8a8278]">
              L&apos;essence du luxe
            </p>
          </div>
          <div className="px-8 py-8">
            <p className="text-sm text-[#3d3d3d]">Bonjour,</p>
            <h3 className="mt-4 font-display text-3xl leading-tight">
              {form.title || 'Titre'}
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#3d3d3d]">
              {(form.message || 'Votre message…')
                .split(/\n+/)
                .filter(Boolean)
                .map((line) => (
                  <p key={line}>{line}</p>
                ))}
            </div>
            {form.discountCode ? (
              <div className="mt-6 border border-[#e4ddd3] bg-[#f4f1ec] px-5 py-5 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a7268]">
                  Votre code remise
                </p>
                <p className="mt-2 font-display text-2xl tracking-[0.12em]">
                  {form.discountCode}
                </p>
                {form.discountLabel ? (
                  <p className="mt-2 text-sm text-[#5c554c]">
                    {form.discountLabel}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-7 text-center">
              <span className="inline-block bg-forest px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-white">
                {form.ctaLabel || 'Découvrir'}
              </span>
            </div>
          </div>
          <div className="bg-ink px-8 py-5 text-center text-white">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#d9d2c8]">
              MRZ Perfume
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
