import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'
import { useCatalog } from '../context/CatalogContext'
import { useCollections } from '../context/CollectionsContext'

export default function CategoryPage({ mode = 'category' }) {
  const { slug } = useParams()
  const { getProductsByCategory } = useCatalog()
  const { collections } = useCollections()
  const meta = collections.find((c) => c.slug === slug)

  const products = getProductsByCategory(slug)

  if (!meta) {
    return (
      <section className="py-20 md:py-28">
        <Container className="max-w-xl text-center">
          <h1 className="font-display text-4xl">Collection introuvable</h1>
          <p className="mt-4 text-sm text-ink/70">
            Cette catégorie n&apos;existe pas dans le catalogue MRZ.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/shop">
              Voir la boutique
            </Button>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section>
      <div className="relative isolate min-h-[280px] overflow-hidden bg-ink text-white md:min-h-[340px]">
        <img
          src={meta.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <Container className="relative flex min-h-[280px] flex-col justify-end pb-10 pt-24 md:min-h-[340px] md:pb-14">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/70">
            {mode === 'collection' ? 'Collection' : 'Catégorie'}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-title text-4xl font-medium uppercase tracking-tight md:text-5xl lg:text-6xl"
          >
            {meta.name}
          </motion.h1>
          <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
            {meta.description}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/60">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </p>
        </Container>
      </div>

      <Container className="pt-10 pb-10 md:pt-14 md:pb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.16em] text-ink/60 transition hover:text-ink"
          >
            ← Accueil
          </Link>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {collections.map((cat) => (
              <Link
                key={cat.slug}
                to={`/${mode === 'collection' ? 'collection' : 'category'}/${cat.slug}`}
                className={`shrink-0 border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition ${
                  cat.slug === slug
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/20 text-ink/70 hover:border-ink hover:text-ink'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink/70">
              Aucun produit disponible dans cette collection pour le moment.
            </p>
            <div className="mt-6">
              <Button as={Link} to="/shop" variant="outline">
                Voir tous les parfums
              </Button>
            </div>
          </div>
        ) : (
          <div
            key={slug}
            className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
