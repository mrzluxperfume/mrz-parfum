import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'

const types = [
  {
    title: 'Eau de toilette',
    kicker: 'Fraîche • Légère • Facile à porter',
    text: 'L’eau de toilette possède généralement une concentration supérieure à celle d’une eau de Cologne. Elle offre souvent un parfum présent sans être trop intense.',
    points: [
      'Concentration : généralement modérée',
      'Idéale pour : le quotidien et les journées',
      'Sensation : fraîche, légère et élégante',
    ],
    close: 'C’est le choix parfait si vous aimez sentir bon sans avoir un parfum trop présent.',
  },
  {
    title: 'Eau de parfum',
    kicker: 'Intense • Élégante • Plus persistante',
    text: 'L’eau de parfum contient généralement davantage de matières parfumantes que l’eau de toilette. Elle offre donc souvent une présence olfactive plus importante et une tenue plus longue.',
    points: [
      'Concentration : généralement plus élevée',
      'Idéale pour : le quotidien comme les soirées',
      'Sensation : plus riche et enveloppante',
    ],
    close: 'Vous voulez que votre parfum vous accompagne plus longtemps ? L’eau de parfum peut être une excellente option.',
  },
  {
    title: 'Extrait de parfum',
    kicker: 'Concentré • Riche • Intense',
    text: 'L’extrait de parfum, aussi appelé parfum, présente généralement une concentration encore plus importante. Quelques touches peuvent suffire pour profiter pleinement de la fragrance.',
    points: [
      'Concentration : généralement très élevée',
      'Idéal pour : les occasions particulières ou pour ceux qui aiment les fragrances intenses',
      'Sensation : riche, profonde et enveloppante',
    ],
    close: 'Avec un extrait, moins peut parfois être plus.',
  },
]

const glance = [
  ['Eau de toilette', 'Modérée', 'Fraîche et élégante'],
  ['Eau de parfum', 'Plus élevée', 'Intense et enveloppante'],
  ['Extrait', 'Très élevée', 'Riche et concentrée'],
]

const choices = [
  {
    when: 'Pour la journée',
    pick: 'Eau de toilette',
    text: 'Légère et facile à porter.',
  },
  {
    when: 'Pour une soirée',
    pick: 'Eau de parfum',
    text: 'Plus présente et enveloppante.',
  },
  {
    when: 'Pour une fragrance très concentrée',
    pick: 'Extrait de parfum',
    text: 'Quelques touches peuvent suffire.',
  },
  {
    when: 'Pour une sensation de fraîcheur',
    pick: 'Eau de Cologne',
    text: 'Légère et rafraîchissante.',
  },
]

const preferences = [
  {
    title: 'Eau de toilette',
    text: 'Pour un parfum discret et facile à porter.',
  },
  {
    title: 'Eau de parfum',
    text: 'Pour une présence plus intense.',
  },
  {
    title: 'Extrait de parfum',
    text: 'Pour une fragrance plus concentrée.',
  },
]

export default function BlogConcentrationsPage() {
  return (
    <article>
      <section className="border-b border-ink/5 bg-fog py-14 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
            <motion.img
              src="/blog/blog2.webp"
              alt="Une goutte de concentré de parfum s’écoule d’une pipette"
              className="mx-auto w-full max-w-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Blog
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
                Eau de parfum, eau de toilette, extrait de parfum
              </h1>
              <p className="mt-4 font-display text-xl text-ink/80 md:text-2xl">
                Quelle est vraiment la différence ?
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="max-w-3xl">
          <div className="space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            <p>Vous avez déjà regardé un parfum en vous demandant :</p>
            <p className="font-display text-2xl text-ink md:text-3xl">
              « Eau de parfum ou eau de toilette… mais quelle différence ? »
            </p>
            <p>Vous n’êtes pas seul(e) !</p>
            <p>
              Derrière ces appellations se cache principalement une différence
              de concentration en matières parfumantes, mais aussi une différence
              de rendu, d’intensité et parfois de tenue.
            </p>
            <p>Voici comment choisir la concentration qui vous correspond.</p>
          </div>
        </Container>
      </section>

      <section className="bg-fog py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            La concentration, c’est quoi exactement ?
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            <p>Imaginez votre parfum comme une recette.</p>
            <p>
              Les matières parfumantes sont mélangées dans une base, généralement
              composée en grande partie d’alcool.
            </p>
            <p>
              Plus la concentration en matières parfumantes est importante, plus
              la fragrance peut être intense et persistante.
            </p>
            <p className="text-ink">
              À retenir : la concentration influence la tenue et l’intensité,
              mais elle ne détermine pas à elle seule la qualité d’un parfum.
            </p>
          </div>
        </Container>
      </section>

      {types.map((type, index) => (
        <section
          key={type.title}
          className={index % 2 === 0 ? 'py-14 md:py-20' : 'bg-fog py-14 md:py-20'}
        >
          <Container className="max-w-3xl">
            <h2 className="font-display text-4xl md:text-5xl">{type.title}</h2>
            <p className="mt-4 font-display text-xl text-ink/85 md:text-2xl">
              {type.kicker}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink/75 md:text-base">
              {type.text}
            </p>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink/75 md:text-base">
              {type.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink md:text-base">
              {type.close}
            </p>
          </Container>
        </section>
      ))}

      <section className="bg-fog py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">En un coup d’œil</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm md:text-base">
              <thead>
                <tr className="border-b border-ink/15 text-[11px] uppercase tracking-[0.16em] text-ink/60">
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Concentration*</th>
                  <th className="py-3 font-medium">Impression</th>
                </tr>
              </thead>
              <tbody>
                {glance.map(([type, concentration, impression]) => (
                  <tr key={type} className="border-b border-ink/10">
                    <td className="py-4 pr-4 text-ink">{type}</td>
                    <td className="py-4 pr-4 text-ink/75">{concentration}</td>
                    <td className="py-4 text-ink/75">{impression}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">
            *Les concentrations exactes varient selon les marques et les
            créations : il n’existe pas une norme universelle qui impose un
            pourcentage unique à chaque catégorie.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            Mais alors… lequel choisir ?
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink/75 md:text-base">
            Il n’y a pas une concentration « meilleure » qu’une autre. Tout
            dépend de l’effet que vous recherchez.
          </p>
          <ul className="mt-8 space-y-5">
            {choices.map((choice) => (
              <li key={choice.when}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">
                  {choice.when}
                </p>
                <p className="mt-1 font-display text-2xl text-ink">{choice.pick}</p>
                <p className="mt-1 text-sm text-ink/75 md:text-base">{choice.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-fog py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            Une idée reçue à oublier
          </h2>
          <p className="mt-5 font-display text-2xl text-ink md:text-3xl">
            « Plus c’est concentré, meilleur est le parfum. »
          </p>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            <p>Pas forcément.</p>
            <p>
              Un parfum très concentré n’est pas automatiquement meilleur qu’une
              eau de toilette.
            </p>
            <p>
              La qualité dépend aussi de la composition, des matières premières,
              du travail du parfumeur et de l’équilibre de la fragrance.
            </p>
            <p className="text-ink">
              Votre parfum préféré est celui que vous aimez porter.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            Le petit conseil de la boutique
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            <p>Ne choisissez pas uniquement votre parfum en fonction de son appellation.</p>
            <p>Testez-le sur votre peau.</p>
            <p>
              Une fragrance évolue au fil du temps : les premières notes que vous
              sentez ne sont pas forcément celles qui resteront le plus longtemps.
            </p>
            <p>
              Laissez-lui quelques minutes pour découvrir véritablement son
              caractère.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink/5 bg-ink py-16 text-white md:py-24">
        <Container className="max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl">Et vous ?</h2>
          <p className="mt-4 text-sm text-white/75 md:text-base">
            Quelle concentration préférez-vous ?
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {preferences.map((item) => (
              <li key={item.title} className="border border-white/20 px-5 py-6">
                <p className="font-display text-2xl">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-10 font-display text-2xl md:text-3xl">
            Découvrez notre sélection de parfums
          </p>
          <div className="mt-6">
            <Button as={Link} to="/shop" variant="secondary">
              Découvrir la collection
            </Button>
          </div>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Besoin d’aide pour choisir ? Venez découvrir nos fragrances en
            boutique et laissez-vous guider selon vos goûts et vos envies.
          </p>
        </Container>
      </section>
    </article>
  )
}
