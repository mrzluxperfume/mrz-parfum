import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import ProductEditorial from '../components/product/ProductEditorial'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { formatPrice } from '../utils/format'
import { getEnabledSizes } from '../utils/productModel'

export default function ProductPage() {
  const { slug } = useParams()
  const { getProductBySlug } = useCatalog()
  const { addItem } = useCart()
  const product = getProductBySlug(slug)
  const sizes = useMemo(() => getEnabledSizes(product), [product])
  const [selectedVolume, setSelectedVolume] = useState(
    () => sizes[0]?.volume || null,
  )

  if (!product) {
    return (
      <section className="py-20 md:py-28">
        <Container className="max-w-xl text-center">
          <h1 className="font-display text-4xl">Parfum introuvable</h1>
          <p className="mt-4 text-sm text-ink/70">
            Ce produit n&apos;est pas dans le catalogue.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/trouver-mon-parfum">
              Trouver mon parfum
            </Button>
            <Button as={Link} to="/shop" variant="outline">
              Voir la boutique
            </Button>
          </div>
        </Container>
      </section>
    )
  }

  const activeVolume =
    sizes.find((size) => size.volume === selectedVolume)?.volume ||
    sizes[0]?.volume ||
    null
  const activePrice =
    sizes.find((size) => size.volume === activeVolume)?.price ?? product.price

  return (
    <section className="py-10 md:py-16">
      <Container>
        <Link
          to="/trouver-mon-parfum"
          className="text-[11px] uppercase tracking-[0.16em] text-ink/60 transition hover:text-ink"
        >
          ← Trouver mon parfum
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-start md:gap-12 lg:gap-16">
          <div className="overflow-hidden bg-fog md:sticky md:top-28">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square" />
            )}
          </div>

          <div>
            <h1 className="font-title text-4xl font-medium uppercase leading-none tracking-tight md:text-5xl">
              {product.name}
            </h1>

            <ProductEditorial product={product} />

            <p className="mt-10 font-display text-3xl tabular-nums">
              {formatPrice(activePrice)}
            </p>

            {sizes.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink/55">
                  Format
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.volume}
                      type="button"
                      onClick={() => setSelectedVolume(size.volume)}
                      className={[
                        'border px-4 py-2 text-[11px] uppercase tracking-[0.12em] transition',
                        activeVolume === size.volume
                          ? 'border-ink bg-ink text-white'
                          : 'border-ink/20 text-ink hover:border-ink',
                      ].join(' ')}
                    >
                      {size.volume} — {formatPrice(size.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 max-w-sm">
              <Button
                type="button"
                size="full"
                disabled={!product.inStock}
                onClick={() => addItem(product, 1, activeVolume)}
              >
                {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
