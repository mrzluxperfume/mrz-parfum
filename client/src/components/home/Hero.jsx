import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'

const INTERVAL_MS = 6500

const heroSlides = [
  {
    id: 'slide1-photo1',
    image: '/hero/slide1-photo1.webp',
    alt: 'MRZ Perfume — fragrances de la maison',
    // Desktop: flacons à droite, texte à gauche
    objectPosition: '72% center',
    tabletObjectPosition: '78% center',
    // Mobile: cadrage sur les flacons
    mobileObjectPosition: '85% center',
    theme: 'light',
    intro: {
      text: "Chez MRZ Perfume, nous transformons des ingrédients rares en chefs-d'œuvre. Chaque fragrance est élaborée avec minutie pour évoquer l'élégance, l'émotion et un raffinement intemporel. Notre passion pour la parfumerie se reflète dans chaque flacon, offrant une expérience unique.",
      cta: {
        label: 'Découvrir la collection',
        to: '/shop',
      },
    },
  },
  {
    id: 'slide1-photo2',
    image: '/hero/slide1-photo2.webp',
    alt: 'MRZ Perfume — Le Désir',
    objectPosition: 'left center',
    tabletObjectPosition: '18% center',
    mobileObjectPosition: '18% center',
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
  const [viewport, setViewport] = useState('desktop')

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 767px)')
    const tabletMq = window.matchMedia(
      '(min-width: 768px) and (max-width: 1023px)',
    )
    const apply = () => {
      if (mobileMq.matches) setViewport('mobile')
      else if (tabletMq.matches) setViewport('tablet')
      else setViewport('desktop')
    }
    apply()
    mobileMq.addEventListener('change', apply)
    tabletMq.addEventListener('change', apply)
    return () => {
      mobileMq.removeEventListener('change', apply)
      tabletMq.removeEventListener('change', apply)
    }
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
  const isPanelSlide = Boolean(active.panel)
  const isIntroSlide = Boolean(active.intro)
  const stacked = viewport !== 'desktop'

  const objectPosition =
    viewport === 'mobile'
      ? active.mobileObjectPosition || active.objectPosition
      : viewport === 'tablet'
        ? active.tabletObjectPosition || active.objectPosition
        : active.objectPosition || 'center center'

  return (
    <section
      className={`relative isolate overflow-hidden ${
        lightTheme ? 'bg-[#f3ece4] text-ink' : 'bg-ink text-white'
      } ${
        stacked
          ? 'min-h-[min(92vh,820px)]'
          : 'min-h-[70vh] md:min-h-[82vh]'
      }`}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={active.id}
            src={active.image}
            alt={active.alt}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={
              stacked
                ? isPanelSlide
                  ? 'absolute inset-x-0 top-0 h-[52%] w-full object-cover sm:h-[54%]'
                  : 'absolute inset-x-0 top-0 h-[48%] w-full object-cover sm:h-[52%] md:h-[56%]'
                : 'absolute inset-0 h-full w-full object-cover'
            }
            style={{ objectPosition }}
          />
        </AnimatePresence>

        {/* Zones sous l’image (mobile / tablette) */}
        {stacked && isIntroSlide && (
          <div className="absolute inset-x-0 bottom-0 top-[48%] bg-[#f3ece4] sm:top-[52%] md:top-[56%]" />
        )}
        {stacked && isPanelSlide && (
          <div className="absolute inset-x-0 bottom-0 top-[52%] bg-ink sm:top-[54%]" />
        )}

        {/* Lisibilité desktop */}
        {!stacked && isIntroSlide && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f3ece4]/85 via-[#f3ece4]/35 to-transparent lg:from-[#f3ece4]/55 lg:via-transparent" />
        )}
        {!stacked && isPanelSlide && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-transparent" />
        )}
      </div>

      <div
        className={`container-mrz relative flex flex-col ${
          stacked
            ? 'min-h-[min(92vh,820px)] pb-8 pt-20'
            : 'min-h-[70vh] pb-12 pt-24 md:min-h-[82vh] md:pb-24 md:pt-32'
        }`}
      >
        {active.panel ? (
          <div
            className={
              stacked
                ? 'flex flex-1 flex-col justify-end pt-[50%] sm:pt-[52%]'
                : 'absolute inset-y-0 right-[3%] flex w-[min(360px,32%)] items-center justify-center lg:right-[4%] lg:w-[min(380px,30%)]'
            }
          >
            <motion.div
              key={`${active.id}-panel`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className={`w-full px-1 text-center ${
                stacked ? 'mx-auto max-w-md pb-2' : ''
              }`}
            >
              <p className="font-display text-[2rem] tracking-[0.18em] text-white sm:text-4xl lg:text-5xl">
                {active.panel.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-[15px]">
                « {active.panel.description} »
              </p>
              <div className="mt-5 flex justify-center sm:mt-8">
                <Button as={Link} to={active.panel.cta.to} variant="secondary">
                  {active.panel.cta.label}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : active.intro ? (
          <div
            className={
              stacked
                ? 'flex flex-1 flex-col justify-end pt-[46%] sm:pt-[50%] md:pt-[54%]'
                : 'flex flex-1 flex-col justify-center'
            }
          >
            <motion.div
              key={`${active.id}-intro`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className={`text-left ${
                stacked
                  ? 'mx-auto w-full max-w-lg'
                  : 'max-w-[min(440px,42%)] lg:max-w-[480px]'
              }`}
            >
              <p className="text-[13px] leading-relaxed text-ink sm:text-sm md:text-[15px] lg:text-base lg:leading-[1.7]">
                {active.intro.text}
              </p>
              <div className={`mt-5 sm:mt-7 ${stacked ? 'flex justify-center sm:justify-start' : ''}`}>
                <Button
                  as={Link}
                  to={active.intro.cta.to}
                  variant="secondary"
                  style={{
                    backgroundColor: '#151515',
                    color: '#ffffff',
                    borderColor: '#151515',
                  }}
                >
                  {active.intro.cta.label}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}

        <div
          className={`mt-auto flex items-center gap-2 pt-5 sm:pt-6 ${
            lightTheme || isPanelSlide || stacked
              ? 'justify-center'
              : 'justify-start'
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
