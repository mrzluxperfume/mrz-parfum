import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import { brand } from '../data/brand'
import { useCollections } from '../context/CollectionsContext'
import { useCatalog } from '../context/CatalogContext'

export default function HistoryPage() {
  const { getProductBySlug } = useCatalog()
  const { collections } = useCollections()
  const image =
    getProductBySlug('nuit-passion')?.image || collections[0]?.image

  return (
    <article>
      <section className="border-b border-ink/5 bg-fog py-14 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            À propos
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {brand.historyTitle}
          </h1>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
            {image && (
              <motion.img
                src={image}
                alt=""
                className="aspect-[4/5] w-full object-cover"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <p className="text-sm leading-relaxed text-ink/75 md:text-base">
                {brand.history}
              </p>
              <blockquote className="mt-8 space-y-3 font-display text-2xl leading-snug text-ink md:text-3xl">
                {brand.philosophy.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </blockquote>
              <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-muted">
                — {brand.philosophy.attribution}
              </p>
            </motion.div>
          </div>
        </Container>
      </section>
    </article>
  )
}
