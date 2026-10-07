import { motion } from 'framer-motion'
import BrandTimeline from '../components/about/BrandTimeline'
import Container from '../components/ui/Container'

function Section({ eyebrow, title, children, tone = 'light' }) {
  const dark = tone === 'dark'
  const fog = tone === 'fog'
  return (
    <section
      className={
        dark
          ? 'bg-ink py-16 text-white md:py-24'
          : fog
            ? 'bg-fog py-16 md:py-24'
            : 'py-16 md:py-24'
      }
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow && (
              <p
                className={`text-[11px] uppercase tracking-[0.2em] ${
                  dark ? 'text-white/55' : 'text-muted'
                }`}
              >
                {eyebrow}
              </p>
            )}
            <h2
              className={`mt-4 font-display text-3xl leading-tight md:text-4xl ${
                dark ? 'text-white' : 'text-ink'
              }`}
            >
              {title}
            </h2>
          </motion.div>
          <motion.div
            className={`space-y-5 text-sm leading-relaxed md:text-base md:leading-[1.75] lg:col-span-7 ${
              dark ? 'text-white/80' : 'text-ink/80'
            }`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            {children}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

export default function HistoryPage() {
  return (
    <article>
      <section className="bg-[#faf9f6] pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a7d]">
              Notre histoire
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl lg:text-[3.25rem]">
              D’une passion pour la fragrance à la naissance de MRZ
            </h1>
          </motion.div>
        </Container>
      </section>

      <section className="pb-8 md:pb-12">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-ink/80 md:text-base md:leading-[1.75]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p>
              Tout commence en 2025, avec une passion pour l’univers de la
              parfumerie et l’envie de créer quelque chose de différent.
            </p>
            <p>
              Pour se démarquer des parfumeries traditionnelles, l’idée était
              simple : ne pas seulement proposer des fragrances, mais créer son
              propre univers olfactif.
            </p>
            <p>
              C’est ainsi qu’est née MRZ, une marque de parfums imaginée pour
              proposer des fragrances singulières, destinées aux femmes, aux
              hommes et à celles et ceux qui aiment les parfums mixtes.
            </p>
          </motion.div>
        </Container>
      </section>

      <Section
        eyebrow="Le parcours"
        title="Un savoir-faire issu de la cosmétique et de la pharmacie"
        tone="fog"
      >
        <p>
          Derrière MRZ se trouve un parcours étroitement lié aux sciences, à la
          cosmétique et à la pharmacie.
        </p>
        <p>
          Le créateur de la maison a suivi un parcours en bio-industrie de
          transformation, spécialisé dans les produits pharmaco-cosmétiques,
          avant d’acquérir une expérience professionnelle dans différents
          environnements : laboratoire d’analyses médicales, production
          cosmétique et production pharmaceutique.
        </p>
        <p>
          Un parcours qui a permis de développer une véritable sensibilité pour
          les produits, leur conception et leur univers.
        </p>
        <p>
          Mais derrière cette approche scientifique se trouve surtout une
          passion personnelle : celle des parfums, des belles fragrances et de
          cette sensation unique que procure le fait de sentir bon.
        </p>
        <p>
          C’est cette passion qui a naturellement conduit à l’envie de créer sa
          propre marque.
        </p>
      </Section>

      <Section
        eyebrow="Avril 2025"
        title="La naissance d’une parfumerie"
      >
        <p>
          Après la création de MRZ, l’aventure prend une nouvelle dimension.
        </p>
        <p>
          En avril 2025, la première boutique ouvre ses portes à Villeurbanne,
          avec une ambition : créer un lieu où la découverte du parfum devient
          une véritable expérience.
        </p>
        <p>
          La boutique réunit aujourd’hui différents univers de la parfumerie :
          parfums de niche, parfums de Dubaï, brumes, muscs, parfums
          d’intérieur, ainsi que les créations de la maison MRZ.
        </p>
        <p>
          Une sélection pensée pour permettre à chacun de trouver une fragrance
          qui correspond à sa personnalité et à son univers.
        </p>
      </Section>

      <Section
        eyebrow="Identité"
        title="MRZ, un nom qui nous ressemble"
        tone="dark"
      >
        <p>Le nom MRZ possède lui aussi une histoire.</p>
        <p>
          Il s’agit d’un diminutif inspiré du nom de famille du créateur de la
          maison.
        </p>
        <p>
          Associé à Perfume, qui signifie « parfum » en anglais, MRZ Perfume
          devient ainsi bien plus qu’un nom : il représente l’identité d’une
          maison créée autour d’une passion personnelle pour la parfumerie.
        </p>
      </Section>

      <Section eyebrow="Projection" title="Et demain ?">
        <p>
          L’ouverture de la boutique à Villeurbanne n’est que le début de
          l’aventure.
        </p>
        <p>
          Notre ambition est de développer MRZ à l’échelle nationale puis
          internationale, et de faire découvrir notre univers au plus grand
          nombre, avec à terme la volonté de voir nos créations référencées dans
          de grandes enseignes spécialisées dans la parfumerie.
        </p>
      </Section>

      <section className="bg-[#faf9f6] py-16 md:py-20">
        <Container>
          <motion.div
            className="mx-auto max-w-2xl space-y-3 text-center font-display text-2xl leading-snug text-ink md:text-3xl"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p>Une passion devenue une marque.</p>
            <p>Une marque devenue une boutique.</p>
            <p>Et une histoire qui ne fait que commencer.</p>
          </motion.div>
        </Container>
      </section>

      <BrandTimeline
        eyebrow="Les jalons"
        title="Une passion devenue une maison"
      />
    </article>
  )
}
