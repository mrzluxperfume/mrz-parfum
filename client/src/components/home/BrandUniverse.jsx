import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { brand } from '../../data/brand'

export default function BrandUniverse() {
  return (
    <section className="bg-fog py-16 md:py-24">
      <Container>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
            L&apos;univers MRZ
          </p>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            L&apos;essence de {brand.legalName}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink/75 md:text-base">
            {brand.shortDescription}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/75 md:text-base">
            {brand.history}
          </p>
          <div className="mt-8">
            <Button as={Link} to="/about" variant="outline">
              Notre histoire
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
