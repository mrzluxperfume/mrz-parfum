import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import SectionHeading from '../ui/SectionHeading'
import Container from '../ui/Container'

export default function ProductCarousel({
  title,
  products,
  href = '/shop',
  linkLabel = 'Tout voir',
}) {
  const scrollerRef = useRef(null)

  const scrollBy = (direction) => {
    const node = scrollerRef.current
    if (!node) return
    const amount = Math.min(node.clientWidth * 0.85, 480)
    node.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="py-8 md:py-10">
      <Container>
        <div className="relative">
          <SectionHeading title={title} href={href} linkLabel={linkLabel} />
          <button
            type="button"
            aria-label="Produits suivants"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-2 hidden size-6 items-center justify-center text-ink transition hover:opacity-50 md:flex"
          >
            <ChevronRight className="size-6" strokeWidth={1.25} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Produits précédents"
            onClick={() => scrollBy(-1)}
            className="absolute -left-1 top-1/3 z-10 flex size-9 items-center justify-center bg-white/90 text-ink shadow-sm transition hover:bg-white"
          >
            <ChevronLeft className="size-5" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Produits suivants"
            onClick={() => scrollBy(1)}
            className="absolute -right-1 top-1/3 z-10 flex size-9 items-center justify-center bg-white/90 text-ink shadow-sm transition hover:bg-white"
          >
            <ChevronRight className="size-5" strokeWidth={1.25} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[85%] max-w-[280px] shrink-0 sm:w-[46%] sm:max-w-[320px] md:w-[32%] lg:w-[23.5%] lg:max-w-none"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
