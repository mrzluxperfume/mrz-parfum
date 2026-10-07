import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

const heroImage = '/about/IMG_0811.webp'

export default function AboutPage() {
  return (
    <div>
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-ink text-white md:min-h-[60vh]">
        <img
          src={heroImage}
          alt="Boutique MRZ Perfume"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <Container className="relative flex min-h-[52vh] flex-col justify-end pb-14 pt-28 md:min-h-[60vh] md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/70">
              Qui sommes-nous
            </p>
            <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Bienvenue dans l’univers MRZ
            </h1>
          </motion.div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-ink/80 md:text-base md:leading-[1.75]">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              MRZ est une boutique dédiée à l’univers du parfum, où l’élégance,
              la découverte et la personnalité se rencontrent.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Nous proposons une sélection de fragrances pour femmes, hommes et
              mixtes, allant des parfums de niche aux parfums de Dubaï, en
              passant par les brumes, les muscs et les parfums d’intérieur.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Notre particularité ? Vous faire découvrir des références que
              vous ne retrouverez pas forcément dans les autres boutiques de
              parfumerie à Lyon, tout en vous proposant notre propre univers à
              travers la collection de parfums MRZ.
            </motion.p>
          </div>
        </Container>
      </section>

      <section className="bg-fog py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Notre approche
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl lg:text-5xl">
                Une parfumerie pensée pour chaque personnalité
              </h2>
            </motion.div>
            <motion.div
              className="space-y-6 text-sm leading-relaxed text-ink/80 md:text-base lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <p>
                Chez MRZ, nous pensons que le parfum ne se résume pas à une
                simple fragrance. Il accompagne une personnalité, une humeur, un
                souvenir et une façon de se distinguer.
              </p>
              <p>
                C’est pourquoi nous avons imaginé un univers où chacun peut
                prendre le temps de découvrir, sentir et trouver la fragrance
                qui lui correspond véritablement.
              </p>
              <p>
                Que vous recherchiez une signature élégante, une fragrance
                intense, une senteur délicate ou simplement l’envie de découvrir
                quelque chose de nouveau, notre sélection vous invite à explorer
                différents univers olfactifs.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Accueil & conseil
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl lg:text-5xl">
                Une expérience avant tout
              </h2>
            </motion.div>
            <motion.div
              className="space-y-6 text-sm leading-relaxed text-ink/80 md:text-base lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <p>
                Nous accordons une importance particulière à l’accueil et au
                conseil.
              </p>
              <p>
                Chez MRZ, chaque client doit se sentir écouté, compris et
                accompagné.
              </p>
              <p>
                Nous souhaitons créer une expérience à la fois chaleureuse,
                moderne et raffinée, dans laquelle la découverte du parfum
                devient un véritable moment pour soi.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

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
              Notre univers
            </p>
            <p className="mt-8 font-display text-2xl leading-snug md:text-3xl lg:text-4xl">
              Élégant. Moderne. Chaleureux. Premium.
            </p>
            <p className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
              MRZ, c’est la rencontre entre une sélection singulière de
              fragrances et une vision contemporaine de la parfumerie.
            </p>
            <p className="mt-6 font-display text-xl leading-snug md:text-2xl">
              Découvrez notre univers. Trouvez votre signature. Laissez votre
              empreinte.
            </p>
            <div className="mt-10">
              <Button as={Link} to="/shop" variant="secondary">
                Découvrir la boutique
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
