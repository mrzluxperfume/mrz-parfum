import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import BrandTimeline from '../components/about/BrandTimeline'
import { brand } from '../data/brand'

export default function AboutPage() {
  return (
    <div>
      <BrandTimeline />

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
