import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { brand } from '../data/brand'
import { useCollections } from '../context/CollectionsContext'
import { useCatalog } from '../context/CatalogContext'

export default function AboutPage() {
  const { getProductBySlug } = useCatalog()
  const { collections } = useCollections()
  const heroImage =
    getProductBySlug('le-desir')?.image || collections[0]?.image

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-ink text-white md:min-h-[60vh]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <Container className="relative flex min-h-[52vh] flex-col justify-end pb-14 pt-28 md:min-h-[60vh] md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/70">
              {brand.aboutEyebrow}
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl">
              {brand.aboutTitle}
            </h1>
          </motion.div>
        </Container>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                {brand.aboutEyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                {brand.aboutHeadline}
              </h2>
            </motion.div>

            <motion.div
              className="space-y-6 text-sm leading-relaxed text-ink/80 md:text-base lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <p>{brand.aboutIntro}</p>
              <p>{brand.aboutExperience}</p>
              <div className="pt-2">
                <Button as={Link} to="/shop" variant="outline">
                  {brand.collectionLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Philosophie */}
      <section className="bg-ink py-20 text-white md:py-28">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              {brand.philosophyTitle}
            </p>
            <blockquote className="mt-8 space-y-4 font-display text-3xl leading-snug md:text-4xl lg:text-5xl">
              {brand.philosophy.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </blockquote>
            <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-white/55">
              — {brand.philosophy.attribution}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Maisons / CTA */}
      <section className="pt-16 pb-0 md:pt-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 border border-ink/10 border-b-0 bg-fog p-8 md:flex-row md:items-center md:p-12">
            <div>
              <h2 className="font-title text-2xl font-medium uppercase tracking-tight md:text-3xl">
                {brand.collectionLabel}
              </h2>
              <p className="mt-3 max-w-lg text-sm text-ink/70">
                Découvrez les univers Maison MRZ, Lamas, Osma et Dubai.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {brand.houses.map((house) => (
                  <span
                    key={house}
                    className="border border-ink/15 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-ink/75"
                  >
                    {house}
                  </span>
                ))}
              </div>
            </div>
            <Button as={Link} to="/shop">
              Découvrir la boutique
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
