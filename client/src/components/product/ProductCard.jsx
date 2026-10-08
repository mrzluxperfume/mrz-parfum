import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'
import { getEnabledSizes } from '../../utils/productModel'
import { collectionDisplayName } from '../../data/collections'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const sizes = useMemo(() => getEnabledSizes(product), [product])
  const [selectedVolume, setSelectedVolume] = useState(
    () => sizes[0]?.volume || null,
  )

  const activeVolume =
    sizes.find((s) => s.volume === selectedVolume)?.volume ||
    sizes[0]?.volume ||
    null
  const activePrice =
    sizes.find((s) => s.volume === activeVolume)?.price ?? product.price

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group flex w-full min-w-0 flex-col gap-4"
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-[var(--radius-media)] bg-fog"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
        {product.category && (
          <span className="pointer-events-none absolute bottom-3 right-4 text-[12px] font-light text-ink/80">
            {collectionDisplayName(product.categorySlug, product.category)}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <Link
            to={`/category/${product.categorySlug}`}
            className="text-[12px] text-ink underline decoration-ink/30 underline-offset-2 transition hover:decoration-ink"
          >
            {collectionDisplayName(product.categorySlug, product.brand)}
          </Link>
          <Link
            to={`/product/${product.slug}`}
            className="font-title text-[12px] font-semibold uppercase tracking-[0.04em] text-ink"
          >
            {product.name}
          </Link>
          <p className="text-[18px] tracking-[0.02em] text-ink md:text-[20px]">
            {formatPrice(activePrice)}
          </p>
        </div>

        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <button
                key={size.volume}
                type="button"
                onClick={() => setSelectedVolume(size.volume)}
                className={[
                  'inline-flex border px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition',
                  activeVolume === size.volume
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink text-ink hover:bg-fog',
                ].join(' ')}
              >
                {size.volume}
              </button>
            ))}
          </div>
        )}

        <Button
          size="full"
          type="button"
          onClick={() => addItem(product, 1, activeVolume)}
          disabled={!product.inStock || (sizes.length > 0 && !activeVolume)}
        >
          {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
        </Button>
      </div>
    </motion.article>
  )
}
