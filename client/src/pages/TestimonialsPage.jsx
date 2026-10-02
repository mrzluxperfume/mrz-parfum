import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STORAGE_KEY = 'mrz_testimonials_v1'

function readLocalTestimonials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function TestimonialsPage() {
  const [items, setItems] = useState(() =>
    isSupabaseConfigured ? [] : readLocalTestimonials(),
  )
  const [form, setForm] = useState({ name: '', message: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let cancelled = false
    ;(async () => {
      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (fetchError) {
        setItems(readLocalTestimonials())
        return
      }
      setItems(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          message: row.message,
          createdAt: row.created_at,
        })),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    const message = form.message.trim()
    if (!name || !message) {
      setError('Merci d’indiquer votre prénom et votre message.')
      return
    }

    setSaving(true)
    setError('')
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: insertError } = await supabase
          .from('testimonials')
          .insert({ name, message })
          .select('*')
          .single()
        if (insertError) throw insertError
        setItems((prev) => [
          {
            id: data.id,
            name: data.name,
            message: data.message,
            createdAt: data.created_at,
          },
          ...prev,
        ])
      } else {
        const next = [
          {
            id: Date.now(),
            name,
            message,
            createdAt: new Date().toISOString(),
          },
          ...items,
        ]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setItems(next)
      }
      setForm({ name: '', message: '' })
    } catch (err) {
      setError(err.message || 'Envoi impossible pour le moment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article>
      <section className="border-b border-ink/5 bg-fog py-14 md:py-20">
        <Container className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            À propos
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl">
            Témoignages
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 md:text-base">
            Les mots de celles et ceux qui portent MRZ.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="max-w-3xl">
          {items.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink/70 md:text-base">
              Aucun témoignage publié pour le moment. Le premier peut être le vôtre.
            </p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="border border-ink/10 bg-fog px-6 py-6">
                  <p className="text-sm leading-relaxed text-ink/80 md:text-base">
                    {item.message}
                  </p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {item.name}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <motion.form
            onSubmit={submit}
            className="mt-12 space-y-5 border-t border-ink/10 pt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-display text-3xl">Laisser un témoignage</h2>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                Prénom
              </span>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                className="field-input"
                autoComplete="given-name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                Message
              </span>
              <textarea
                rows={5}
                value={form.message}
                onChange={update('message')}
                className="field-input min-h-[120px] resize-y"
              />
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? 'Publication…' : 'Publier'}
            </Button>
          </motion.form>
        </Container>
      </section>
    </article>
  )
}
