import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
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

export default function HomeTestimonials() {
  const [items, setItems] = useState(() =>
    isSupabaseConfigured ? [] : fallbackTestimonials,
  )

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

  const loop = [...items, ...items, ...items]

  return (
    <section className="overflow-hidden py-10 md:py-14" aria-label="Témoignages">
      <div className="testimonials-marquee flex w-max gap-4 px-4 sm:gap-5">
        {loop.map((item, index) => (
          <article
            key={`${item.id}-${index}`}
            aria-hidden={index >= items.length || undefined}
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
        ))}
      </div>
    </section>
  )
}
