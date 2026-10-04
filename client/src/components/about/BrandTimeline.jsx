import { motion } from 'framer-motion'
import Container from '../ui/Container'

const milestones = [
  {
    label: '2025',
    title: 'La naissance de MRZ',
    description:
      "Une passion pour le parfum donne naissance à l'idée de créer sa propre maison.",
  },
  {
    label: 'Avril 2025',
    title: 'Ouverture à Villeurbanne',
    description: 'La première boutique MRZ PERFUME ouvre ses portes.',
  },
  {
    label: "Aujourd'hui",
    title: "Un univers qui s'élargit",
    description:
      "Niche, Dubaï, brumes, muscs, parfums d'intérieur et créations MRZ.",
  },
  {
    label: 'Demain',
    title: 'Voir plus grand',
    description:
      'Développer MRZ à l’échelle nationale puis internationale.',
  },
]

export default function BrandTimeline({
  eyebrow = "L'histoire de MRZ",
  title = 'Une passion devenue une maison',
}) {
  return (
    <section className="bg-[#faf9f6] py-16 md:py-24 lg:py-28">
      <Container>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a7d]">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div className="relative mt-16 hidden md:block lg:mt-20">
          <div className="absolute left-[6%] right-[6%] top-[2.35rem] h-px bg-[#b59a7d]/div>
          <ol className="relative grid grid-cols-4 gap-4 lg:gap-8">
            {milestones.map((item, index) => (
              <motion.li
                key={item.label}
                className="flex flex-col items-center px-2 text-center"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#b59a7d]">
                  {item.label}
                </p>
                <span className="relative z-10 mb-6 size-4 rounded-full border border-[#b59a7d] bg-white" />
                <h2 className="font-display text-xl text-ink lg:text-[1.4rem]">
                  {item.title}
                </h2>
                <p className="mt-3 max-w-[230px] text-sm leading-relaxed text-ink/70">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="relative mx-auto mt-12 max-w-md md:hidden">
          <div className="absolute bottom-2 left-[0.45rem] top-2 w-px bg-[#b59a7d]" />
          {milestones.map((item, index) => (
            <motion.li
              key={item.label}
              className="relative flex gap-5 pb-10 last:pb-0"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <span className="relative z-10 mt-1.5 size-4 shrink-0 rounded-full border border-[#b59a7d] bg-white" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#b59a7d]">
                  {item.label}
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {item.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
