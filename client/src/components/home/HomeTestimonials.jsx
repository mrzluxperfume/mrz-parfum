import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const fallbackTestimonials = [
  { id: 'preset-1', message: 'Commande reçue super rapidement', rating: 4 },
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
  { id: 'preset-5', message: 'Livraison rapide merci', rating: 4 },
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

function TestimonialCard({ item, hidden }) {
  return (
    <article
      aria-hidden={hidden || undefined}
      className="flex aspect-square w-[min(280px,78vw)] shrink-0 flex-col border border-ink/10 bg-fog p-5 sm:w-[300px] sm:p-6"
    >
      <StarRating value={item.rating} />
      <p className="mt-4 flex-1 overflow-hidden text-sm leading-relaxed text-ink/80">
        « {item.message} »
      </p>
      {item.name ? (
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
          {item.name}
        </p>
      ) : null}
    </article>
  )
}

export default function HomeTestimonials() {
  const scrollerRef = useRef(null)
  const [manualScroll, setManualScroll] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 1399px)').matches,
  )
  const [items, setItems] = useState(() =>
    isSupabaseConfigured ? [] : fallbackTestimonials,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1399px)')
    const apply = () => setManualScroll(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error || !data?.length) {
        setItems(fallbackTestimonials)
        return
      }
      setItems(
        data
          .map((row) => ({
            id: row.id,
            name: row.name,
            message: row.message,
            rating: Number(row.rating) || 5,
          }))
          .filter((item) => item.message),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!items.length) return null

  const scrollByCard = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('article')
    const styles = getComputedStyle(el)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16
    const amount = (card?.offsetWidth || 280) + gap
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (manualScroll) {
    return (
      <section className="py-10 md:py-14" aria-label="Témoignages">
        <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <button
            type="button"
            aria-label="Témoignages précédents"
            onClick={() => scrollByCard(-1)}
            className="flex size-10 shrink-0 items-center justify-center border border-ink bg-ink text-white"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <div
            ref={scrollerRef}
            className="flex min-w-0 flex-1 gap-4 overflow-x-auto scroll-smooth sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Témoignages suivants"
            onClick={() => scrollByCard(1)}
            className="flex size-10 shrink-0 items-center justify-center border border-ink bg-ink text-white"
          >
            <ChevronRight className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </section>
    )
  }

  const loop = [...items, ...items, ...items]

  return (
    <section className="overflow-hidden py-10 md:py-14" aria-label="Témoignages">
      <div className="testimonials-marquee flex w-max gap-4 px-4 sm:gap-5">
        {loop.map((item, index) => (
          <TestimonialCard
            key={`${item.id}-${index}`}
            item={item}
            hidden={index >= items.length}
          />
        ))}
      </div>
    </section>
  )
}
