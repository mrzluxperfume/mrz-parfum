import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ExternalLink } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { brand } from '../data/brand'
import api from '../services/api'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  message: '',
}

const LOCATION = {
  label: '61 rue Racine, 69100 Villeurbanne',
  mapsUrl: 'https://maps.app.goo.gl/8X36d2BMLNh82LF29',
  embedUrl:
    'https://maps.google.com/maps?q=61%20rue%20Racine%2C%2069100%20Villeurbanne&z=16&output=embed',
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.message.trim()) {
      setStatus('error')
      setErrorMessage('Merci d’indiquer votre email et votre message.')
      return
    }

    setStatus('sending')
    setErrorMessage('')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err.response?.data?.error ||
          'Envoi impossible pour le moment. Réessayez.',
      )
    }
  }

  return (
    <div>
      <section className="border-b border-ink/5 bg-fog py-14 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
              {brand.name}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl">
              Contactez-nous
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink/70 md:text-base">
              Écrivez-nous par email. Nous vous répondrons dans les meilleurs
              délais.
            </p>
            <a
              href={`mailto:${brand.email}`}
              className="mt-5 inline-block text-sm tracking-wide text-ink underline-offset-4 hover:underline"
            >
              {brand.email}
            </a>
          </motion.div>
        </Container>
      </section>

      <section className="pt-10 pb-0 md:pt-12">
        <Container>
          <div className="grid gap-12 pb-12 lg:grid-cols-12 lg:gap-14 lg:items-start lg:pb-16">
            <motion.form
              onSubmit={handleSubmit}
              className="mt-10 space-y-6 md:mt-14 lg:col-span-6 lg:mt-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Prénom" htmlFor="firstName">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={update('firstName')}
                    className="field-input"
                  />
                </Field>
                <Field label="Nom" htmlFor="lastName">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={update('lastName')}
                    className="field-input"
                  />
                </Field>
              </div>

              <Field label="Email *" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Entrez votre email"
                  value={form.email}
                  onChange={update('email')}
                  className="field-input"
                />
              </Field>

              <Field label="Message" htmlFor="message">
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Votre message"
                  value={form.message}
                  onChange={update('message')}
                  className="field-input min-h-[140px] resize-y"
                />
              </Field>

              {status === 'error' && (
                <p className="text-sm text-red-700">{errorMessage}</p>
              )}
              {status === 'success' && (
                <p className="text-sm text-forest">
                  Merci. Votre message a bien été envoyé. Nous vous
                  répondrons par email.
                </p>
              )}

              <Button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
              </Button>
            </motion.form>

            <motion.aside
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="mb-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  Localisation
                </p>
                <h2 className="mt-2 font-title text-2xl font-medium uppercase tracking-tight md:text-3xl">
                  Notre adresse
                </h2>
                <a
                  href={LOCATION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-start gap-2 text-sm leading-relaxed text-ink transition hover:opacity-70"
                >
                  <MapPin
                    className="mt-0.5 size-4 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>{LOCATION.label}</span>
                </a>
                <a
                  href={LOCATION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                >
                  Ouvrir dans Google Maps
                  <ExternalLink className="size-3.5" strokeWidth={1.5} />
                </a>
              </div>

              <div className="overflow-hidden border border-ink/10 bg-fog">
                <iframe
                  title="Localisation MRZ Perfume — 61 rue Racine, Villeurbanne"
                  src={LOCATION.embedUrl}
                  className="h-[280px] w-full border-0 sm:h-[360px] lg:h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-ink">
        {label}
      </span>
      {children}
    </label>
  )
}
