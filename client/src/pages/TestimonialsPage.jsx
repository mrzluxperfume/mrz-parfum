import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STORAGE_KEY = 'mrz_testimonials_v1'

const presetTestimonials = [
  {
    id: 'preset-1',
    message: 'Commande reçue super rapidement',
    rating: 4,
  },
  {
    id: 'preset-2',
    message:
      "J’avais un peu peur de commander un parfum sans l’avoir senti mais franchement pas déçue du tout. L’odeur est incroyable !",
    rating: 5,
  },
  {
    id: 'preset-3',
    message: 'First order on the website and I’m really satisfied.',
    rating: 4,
  },
  {
    id: 'preset-4',
    message:
      'Le parfum correspond exactement à la description, je suis trop contente de mon achat. Je recommanderai sans hésiter et merci pour les échantillons',
    rating: 5,
  },
  {
    id: 'preset-5',
    message: 'Livraison rapide merci',
    rating: 4,
  },
  {
    id: 'preset-6',
    message:
      'J’ai commandé un parfum MRZ Rouge Magnétique pour tester et franchement très belle surprise. L’odeur tient vraiment bien sur moi.',
    rating: 5,
  },
  {
    id: 'preset-7',
    message: 'Lamas 520 smells amazing',
    rating: 5,
  },
]

function StarRating({ value = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < value ? 'fill-[#b59a7d] text-[#b59a7d]' : 'text-ink/20'
          }`}
          strokeWidth={1.25}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ message, name, rating = 5 }) {
  return (
    <li className="flex aspect-square w-[min(280px,78vw)] shrink-0 snap-start flex-col border border-ink/10 bg-fog p-5 sm:w-[300px] sm:p-6">
      <StarRating value={rating} />
      <p className="mt-4 flex-1 overflow-hidden text-sm leading-relaxed text-ink/80">
        « {message} »
      </p>
      {name ? (
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
          {name}
        </p>
      ) : null}
    </li>
  )
}

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
  const [form, setForm] = useState({ name: '', message: '', rating: 5 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const scrollerRef = useRef(null)

  const scrollByCard = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('li')
    const step = (card?.offsetWidth || 280) + 16
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

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
          rating: Number(row.rating) || 5,
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
    const rating = Number(form.rating) || 5
    if (!name || !message) {
      setError('Merci d’indiquer votre prénom et votre message.')
      return
    }

    setSaving(true)
    setError('')
    try {
      if (isSupabaseConfigured && supabase) {
        const payload = { name, message }
        // rating column may not exist yet — try with it, fallback without
        let { data, error: insertError } = await supabase
          .from('testimonials')
          .insert({ ...payload, rating })
          .select('*')
          .single()
        if (insertError) {
          const retry = await supabase
            .from('testimonials')
            .insert(payload)
            .select('*')
            .single()
          data = retry.data
          insertError = retry.error
        }
        if (insertError) throw insertError
        setItems((prev) => [
          {
            id: data.id,
            name: data.name,
            message: data.message,
            rating: Number(data.rating) || rating,
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
            rating,
            createdAt: new Date().toISOString(),
          },
          ...items,
        ]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setItems(next)
      }
      setForm({ name: '', message: '', rating: 5 })
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
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Témoignage précédent"
            className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center border border-ink/15 bg-white/95 text-ink shadow-sm transition hover:border-ink md:left-4"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Témoignage suivant"
            className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center border border-ink/15 bg-white/95 text-ink shadow-sm transition hover:border-ink md:right-4"
          >
            <ChevronRight className="size-5" strokeWidth={1.5} />
          </button>

          <ul
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-2 sm:gap-5 sm:px-14 md:px-16 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {presetTestimonials.map((item) => (
              <TestimonialCard
                key={item.id}
                message={item.message}
                rating={item.rating}
              />
            ))}
            {items.map((item) => (
              <TestimonialCard
                key={item.id}
                message={item.message}
                name={item.name}
                rating={item.rating || 5}
              />
            ))}
          </ul>
        </div>

        <Container className="mt-12 max-w-3xl">
          <motion.form
            onSubmit={submit}
            className="space-y-5 border-t border-ink/10 pt-10"
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
            <fieldset>
              <legend className="mb-2 block text-[11px] uppercase tracking-[0.14em]">
                Note
              </legend>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                    className="p-0.5 transition hover:opacity-80"
                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`size-6 ${
                        n <= form.rating
                          ? 'fill-[#b59a7d] text-[#b59a7d]'
                          : 'text-ink/25'
                      }`}
                      strokeWidth={1.25}
                    />
                  </button>
                ))}
              </div>
            </fieldset>
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
