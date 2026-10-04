import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'

const INTERVAL_MS = 6000

const heroSlides = [
  {
    id: 'slide1-photo1',
    image: '/hero/slide1-photo1.webp',
    alt: 'MRZ Perfume — L’art du parfum',
    objectPosition: 'center center',
    mobileObjectPosition: 'right center',
    theme: 'light',
    scriptCta: {
      label: "L'art Du Parfum",
      to: '/shop',
    },
  },
  {
    id: 'slide1-photo2',
    image: '/hero/slide1-photo2.webp',
    alt: 'MRZ Perfume — Le Désir',
    objectPosition: 'left center',
    mobileObjectPosition: 'left center',
    theme: 'dark',
    panel: {
      title: 'SAUGE',
      description:
        'Une présence douce et masculine, entre force maîtrisée et sensualité enveloppante.',
      cta: {
        label: 'Parfum Le Désir',
        to: '/product/le-desir',
      },
    },
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
  const lightTheme = active.theme === 'light'
  const lightMobile = isMobile && lightTheme

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-ink text-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={active.id}
            src={active.image}
            alt={active.alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{
              opacity: lightMobile || active.id === 'slide1-photo2' ? 1 : 0.85,
              scale: 1,
            }}
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

        {active.id === 'slide1-photo1' ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,236,228,0)_0%,rgba(243,236,228,0)_72%,rgba(243,236,228,0.55)_100%)] md:bg-none" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent md:bg-none" />
        )}
      </div>

      <div className="container-mrz relative flex min-h-[70vh] flex-col pb-12 pt-24 md:min-h-[82vh] md:pb-24 md:pt-32">
        {active.panel ? (
          <div className="flex flex-1 flex-col justify-end md:absolute md:inset-y-0 md:right-[4%] md:flex md:w-[min(340px,28%)] md:justify-center md:pb-0">
            <motion.div
              key={`${active.id}-panel`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="max-w-md text-left md:max-w-none md:text-center"
            >
              <p className="font-display text-4xl tracking-[0.18em] text-white md:text-5xl">
                {active.panel.title}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-white/85 md:text-[15px]">
                « {active.panel.description} »
              </p>
              <div className="mt-8 flex md:justify-center">
                <Button as={Link} to={active.panel.cta.to} variant="secondary">
                  {active.panel.cta.label}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : active.scriptCta ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <motion.div
              key={`${active.id}-script`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <Link
                to={active.scriptCta.to}
                className="font-script text-[clamp(2.75rem,7vw,5.5rem)] leading-none text-ink transition-opacity duration-300 hover:opacity-70"
              >
                {active.scriptCta.label}
              </Link>
            </motion.div>
          </div>
        ) : null}

        <div
          className={`mt-auto flex items-center gap-2 pt-8 ${
            lightMobile || lightTheme ? 'justify-center' : 'justify-start'
          }`}
        >
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-px transition-all duration-500 ${
                i === index
                  ? lightTheme
                    ? 'w-10 bg-ink'
                    : 'w-10 bg-white'
                  : lightTheme
                    ? 'w-6 bg-ink/35 hover:bg-ink/60'
                    : 'w-6 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
