import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'

const INTERVAL_MS = 5000

const heroSlides = [
  {
    id: 'slide1',
    image: '/hero/slide1.webp',
    alt: 'MRZ Perfume — slide 1',
    objectPosition: 'center center',
    // Recadre les flacons, invisibles dans le centre du visuel large
    mobileObjectPosition: 'right center',
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const apply = () => setIsMobile(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (heroSlides.length < 2) return undefined
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const active = heroSlides[index]
  const lightMobile = isMobile && active.id === 'slide1'

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-ink text-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={active.id}
            src={active.image}
            alt={active.alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: lightMobile ? 1 : 0.7, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition:
                (isMobile && active.mobileObjectPosition) ||
                active.objectPosition ||
                'center center',
            }}
          />
        </AnimatePresence>
        {active.id === 'slide1' ? (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,236,228,0)_0%,rgba(243,236,228,0)_68%,rgba(243,236,228,0.82)_100%)] md:hidden" />
            <div className="absolute inset-0 hidden bg-gradient-to-t from-ink via-ink/45 to-ink/20 md:block" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        )}
      </div>

      <div className="container-mrz relative flex min-h-[70vh] flex-col justify-end pb-12 pt-24 md:min-h-[82vh] md:pb-24 md:pt-32">
        <div>
          <div className="mt-7 flex justify-center sm:mt-8">
            <Button
              as={Link}
              to="/shop"
              variant="secondary"
              style={
                lightMobile
                  ? { backgroundColor: '#151515', color: '#ffffff', borderColor: '#151515' }
                  : undefined
              }
            >
              Découvrir la collection
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 sm:mt-10">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-px transition-all duration-500 ${
                i === index
                  ? lightMobile
                    ? 'w-10 bg-ink'
                    : 'w-10 bg-white'
                  : lightMobile
                    ? 'w-6 bg-ink/35 hover:bg-ink/60'
                    : 'w-6 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
