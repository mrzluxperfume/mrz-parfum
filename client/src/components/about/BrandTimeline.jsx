import { motion } from 'framer-motion'
import Container from '../components/ui/Container'

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
      "Développer MRZ à l'échelle nationale puis internationale.",
  },
]

export default function BrandTimeline({
  eyebrow = "L'histoire de MRZ",
  title = 'Une passion devenue une maison',
}) {
  return (
    <section className="bg-[#f7f5f2] py-16 md:py-24">
      <Container>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a8460]">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl lg:text-[3.25rem]">
            {title}
          </h2>
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div className="relative mt-16 hidden md:block">
          <div className="absolute left-0 right-0 top-[2.15rem] h-px bg-[#9a8460]/div"
          <ol className="relative grid grid-cols-4 gap-6">
            {milestones.map((item, index) => (
              <motion.li
                key={item.label}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#9a8460]">
                  {item.label}
                </p>
                <span className="relative z-10 mb-5 size-3.5 rounded-full border-[1.5px] border-[#9a8460] bg-white" />
                <h3 className="font-display text-xl text-ink md:text-[1.35rem]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-ink/70">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="relative mx-auto mt-12 max-w-md md:hidden">
          <div className="absolute bottom-2 left-[0.4rem] top-2 w-px bg-[#9a8460]/div"
          {milestones.map((item, index) => (
            <motion.li
              key={item.label}
              className="relative flex gap-5 pb-10 last:pb-0"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <span className="relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-[1.5px] border-[#9a8460] bg-white" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#9a8460]">
                  {item.label}
                </p>
                <h3 className="mt-2 font-display text-2xl text-ink">
                  {item.title}
                </h3>
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
