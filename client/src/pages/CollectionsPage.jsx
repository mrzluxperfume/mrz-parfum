import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { brand } from '../data/brand'
import { useCollections } from '../context/CollectionsContext'
import { useCatalog } from '../context/CatalogContext'

export default function CollectionsPage() {
  const { getProductsByCategory, getProductBySlug } = useCatalog()
  const { collections } = useCollections()
  const heroImage =
    getProductBySlug('le-desir')?.image || collections[0]?.image

  return (
    <div>
      <section className="relative isolate min-h-[48vh] overflow-hidden bg-ink text-white md:min-h-[56vh]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <Container className="relative flex min-h-[48vh] flex-col justify-end pb-12 pt-28 md:min-h-[56vh] md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/70">
              {brand.name}
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl">
              Collections
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
              Explorez les univers de la maison : Maison MRZ, Lamas, Osma,
              Dubai, Body Splash et Room Diffuseur.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="pt-12 pb-0 md:pt-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
            {collections.map((collection, index) => {
              const count = getProductsByCategory(collection.slug).length
              const isFeatured = index < 2
              const span = isFeatured ? 'lg:col-span-6' : 'lg:col-span-4'

              return (
                <motion.article
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className={`group relative min-h-[300px] overflow-hidden bg-ink text-white sm:min-h-[380px] md:min-h-[420px] ${span}`}
                >
                  <img
                    src={collection.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                  <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6 sm:min-h-[380px] sm:p-7 md:min-h-[420px] md:p-9">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">
                      {count} produit{count > 1 ? 's' : ''}
                    </p>
                    <h2 className="mt-2 font-title text-2xl font-medium uppercase leading-tight sm:text-3xl md:text-4xl">
                      {collection.name}
                    </h2>
                    <p className="mt-3 max-w-sm text-sm text-white/80">
                      {collection.description}
                    </p>
                    <div className="mt-6">
                      <Button
                        as={Link}
                        to={`/collection/${collection.slug}`}
                        variant="secondary"
                        size="sm"
                      >
                        Découvrir
                      </Button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 border-t border-ink/10 pt-10 pb-0 text-center">
            <p className="text-sm text-ink/70">
              Vous préférez tout parcourir d&apos;un coup ?
            </p>
            <Button as={Link} to="/shop" variant="outline" className="mb-10">
              Voir toute la boutique
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
