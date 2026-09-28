import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { useCollections } from '../../context/CollectionsContext'

export default function CollectionsGrid() {
  const { collections } = useCollections()
  return (
    <section className="py-10 md:py-14">
      <Container>
        <div className="mb-8 md:mb-10">
          <h2 className="section-title">Collections</h2>
          <p className="mt-3 max-w-xl text-sm text-ink/70">
            Les collections officielles de la maison MRZ.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {collections.map((collection, index) => {
            const span =
              index === 0 || index === 1
                ? 'lg:col-span-6'
                : 'lg:col-span-4'
            return (
              <motion.article
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                className={`relative min-h-[300px] overflow-hidden bg-ink text-white sm:min-h-[360px] md:min-h-[400px] ${span}`}
              >
                <img
                  src={collection.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
                <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6 sm:min-h-[360px] sm:p-8 md:min-h-[400px] md:p-10">
                  <h3 className="font-title text-2xl font-medium uppercase leading-tight sm:text-3xl md:text-4xl">
                    {collection.name}
                  </h3>
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
      </Container>
    </section>
  )
}
