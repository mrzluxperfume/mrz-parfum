import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'
import { brand } from '../../data/brand'

const INTERVAL_MS = 5000

const heroSlides = [
  {
    id: 'slide1',
    image: '/hero/slide1.webp',
    alt: 'MRZ Perfume — slide 1',
    objectPosition: 'center center',
  },
  {
    id: 'slide2',
    image: '/hero/slide2.webp',
    alt: 'MRZ Perfume — slide 2',
    // Descend le cadrage pour mieux montrer le visage
    objectPosition: 'center 28%',
  },
]

export default function Hero() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (heroSlides.length < 2) return undefined
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const active = heroSlides[index]

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-ink text-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={active.id}
            src={active.image}
            alt={active.alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: active.objectPosition || 'center center' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
      </div>

      <div className="container-mrz relative flex min-h-[70vh] flex-col justify-end pb-12 pt-24 md:min-h-[82vh] md:pb-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="max-w-2xl">
            <p className="mb-3 font-display text-xs tracking-[0.3em] text-white/80 sm:mb-4 sm:text-sm md:text-base">
              {brand.name.toUpperCase()}
            </p>
            <h1 className="font-display text-[38px] font-medium leading-[0.95] tracking-tight sm:text-[48px] md:text-[72px] lg:text-[88px]">
              L&apos;art du parfum.
            </h1>
            <p className="mt-3 font-display text-xl font-medium tracking-tight text-white/90 sm:mt-4 sm:text-2xl md:text-3xl lg:text-4xl">
              L&apos;essence du luxe
            </p>
          </div>
          <div className="mt-7 flex justify-center sm:mt-8">
            <Button as={Link} to="/shop" variant="secondary">
              Découvrir la collection
            </Button>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center gap-2 sm:mt-10">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-px transition-all duration-500 ${
                i === index
                  ? 'w-10 bg-white'
                  : 'w-6 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
