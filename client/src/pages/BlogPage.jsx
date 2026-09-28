import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'

const families = [
  {
    id: 'gourmands',
    title: 'Les gourmands',
    image: '/blog/gourmands.webp',
    lead: 'Pour celles et ceux qui aiment sentir… irrésistiblement bon.',
    notes: 'Vanille • Caramel • Chocolat • Noix de coco • Praliné',
    text: 'Les parfums gourmands évoquent souvent quelque chose de chaleureux, sucré et réconfortant.',
    mood: 'L’ambiance : cocooning, sensuelle, chaleureuse',
    when: 'Idéal pour : les soirées et les saisons froides',
    signature: 'Votre signature : un parfum qui donne envie de s’approcher',
    close: 'Vous aimez les odeurs sucrées ? Cette famille pourrait être la vôtre.',
  },
  {
    id: 'floraux',
    title: 'Les floraux',
    image: '/blog/floraux.webp',
    lead: 'Élégance, féminité et délicatesse.',
    notes: 'Rose • Jasmin • Fleur d’oranger • Iris • Tubéreuse',
    text: 'Les parfums floraux peuvent être doux et poudrés, mais également très sophistiqués et intenses.',
    mood: 'L’ambiance : élégante, romantique, raffinée',
    when: 'Idéal pour : le quotidien ou les occasions spéciales',
    signature: 'Votre signature : une élégance intemporelle',
  },
  {
    id: 'musques',
    title: 'Les musqués',
    image: '/blog/musques.webp',
    lead: 'L’impression de sortir de la douche… mais en mieux.',
    notes: 'Musc blanc • Notes poudrées • Notes propres • Fleur de coton',
    text: 'Les musqués séduisent ceux qui recherchent une odeur propre, douce et délicate.',
    mood: 'L’ambiance : propre, douce, fraîche',
    when: 'Idéal pour : tous les jours',
    signature: 'Votre signature : une peau naturellement parfumée',
  },
  {
    id: 'boises',
    title: 'Les boisés',
    image: '/blog/boises.webp',
    lead: 'Du caractère. De la profondeur. Une vraie présence.',
    notes: 'Bois de santal • Cèdre • Vétiver • Oud',
    text: 'Les fragrances boisées sont parfaites pour ceux qui recherchent un parfum avec du caractère.',
    mood: 'L’ambiance : élégante, profonde, sophistiquée',
    when: 'Idéal pour : le soir et les occasions particulières',
    signature: 'Votre signature : une présence qui ne passe pas inaperçue',
  },
  {
    id: 'ambres',
    title: 'Les ambrés',
    lead: 'Pour celles et ceux qui aiment laisser un sillage.',
    notes: 'Ambre • Épices • Vanille • Résines • Bois',
    text: 'Chaleureux, enveloppants et souvent intenses, les parfums ambrés sont particulièrement appréciés pour leur caractère.',
    mood: 'L’ambiance : mystérieuse, sensuelle, chaleureuse',
    when: 'Idéal pour : les soirées',
    signature: 'Votre signature : un sillage mémorable',
  },
]

const questions = [
  {
    id: 'dessert',
    prompt: 'Votre dessert préféré ?',
    options: [
      { id: 'A', label: 'Vanille / caramel' },
      { id: 'B', label: 'Fruits rouges' },
      { id: 'C', label: 'Quelque chose de floral' },
      { id: 'D', label: 'Un dessert léger et frais' },
    ],
  },
  {
    id: 'soiree',
    prompt: 'Pour une soirée, vous choisissez…',
    options: [
      { id: 'A', label: 'Un parfum qui sent très fort' },
      { id: 'B', label: 'Une odeur propre et élégante' },
      { id: 'C', label: 'Une fragrance féminine et délicate' },
      { id: 'D', label: 'Une fragrance mystérieuse et profonde' },
    ],
  },
  {
    id: 'style',
    prompt: 'Votre style ?',
    options: [
      { id: 'A', label: 'Chic et glamour' },
      { id: 'B', label: 'Minimaliste et naturel' },
      { id: 'C', label: 'Féminin et élégant' },
      { id: 'D', label: 'Audacieux et sophistiqué' },
    ],
  },
]

const results = {
  A: {
    title: 'Le gourmand',
    text: 'Vous aimez les parfums chaleureux, sucrés et addictifs.',
  },
  B: {
    title: 'Le musqué',
    text: 'Vous aimez les odeurs propres, douces et élégantes.',
  },
  C: {
    title: 'Le floral',
    text: 'Vous recherchez une fragrance raffinée et intemporelle.',
  },
  D: {
    title: 'L’ambré / le boisé',
    text: 'Vous aimez les parfums de caractère, profonds et mystérieux.',
  },
}

function majority(answers) {
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  Object.values(answers).forEach((letter) => {
    if (counts[letter] != null) counts[letter] += 1
  })
  return ['A', 'B', 'C', 'D'].reduce((best, letter) =>
    counts[letter] > counts[best] ? letter : best,
  )
}

export default function BlogPage() {
  const [answers, setAnswers] = useState({})
  const answered = Object.keys(answers).length === questions.length
  const profile = useMemo(
    () => (answered ? results[majority(answers)] : null),
    [answered, answers],
  )

  return (
    <article>
      <section className="border-b border-ink/5 bg-fog py-14 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
            <motion.img
              src="/blog/familles.webp"
              alt="Les familles olfactives : floraux, gourmands, boisés, ambrés et musqués"
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
                Quel parfum est fait pour vous ?
              </h1>
              <p className="mt-4 font-display text-xl text-ink/80 md:text-2xl">
                Le petit guide pour trouver une fragrance qui vous ressemble.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            Vous ne savez jamais quel parfum choisir ?
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink/75 md:text-base">
            Pas besoin d’être expert en parfumerie. Découvrez votre famille
            olfactive en quelques minutes.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/trouver-mon-parfum">
              Trouver mon profil olfactif
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-fog py-14 md:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">
            Avant de choisir un parfum, découvrez votre univers olfactif
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            <p>
              Un parfum ne se choisit pas uniquement parce qu’il « sent bon ».
            </p>
            <p>
              Il doit aussi correspondre à votre personnalité, votre style et
              l’image que vous souhaitez dégager.
            </p>
            <p>
              Vous aimez les odeurs sucrées ? Les parfums propres et délicats ?
              Les fragrances puissantes et mystérieuses ?
            </p>
            <p>Il existe forcément une famille olfactive qui vous correspond.</p>
          </div>
        </Container>
      </section>

      {families.map((family, index) => (
        <section
          key={family.id}
          className={index % 2 === 1 ? 'bg-fog py-14 md:py-20' : 'py-14 md:py-20'}
        >
          <Container>
            <div
              className={`mx-auto grid max-w-5xl items-center gap-8 md:gap-14 ${
                family.image ? 'md:grid-cols-2' : 'max-w-3xl'
              }`}
            >
              {family.image && (
                <img
                  src={family.image}
                  alt={family.title}
                  className={`w-full object-cover ${
                    index % 2 === 1 ? 'md:order-2' : ''
                  }`}
                />
              )}
              <div>
                <h2 className="font-display text-4xl md:text-5xl">{family.title}</h2>
                <p className="mt-4 font-display text-xl text-ink/85 md:text-2xl">
                  {family.lead}
                </p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-ink/60">
                  {family.notes}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-ink/75 md:text-base">
                  {family.text}
                </p>
                <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink/75 md:text-base">
                  <li>{family.mood}</li>
                  <li>{family.when}</li>
                  <li>{family.signature}</li>
                </ul>
                {family.close && (
                  <p className="mt-5 text-sm leading-relaxed text-ink md:text-base">
                    {family.close}
                  </p>
                )}
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-ink/5 bg-ink py-16 text-white md:py-24">
        <Container className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
            Petit test
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Quel parfum êtes-vous ?
          </h2>
          <p className="mt-4 text-sm text-white/75 md:text-base">
            Choisissez instinctivement votre réponse.
          </p>

          <div className="mt-10 space-y-10">
            {questions.map((question, index) => (
              <fieldset key={question.id}>
                <legend className="font-display text-2xl md:text-3xl">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }))
                        }
                        className={`border px-4 py-4 text-left text-sm transition ${
                          selected
                            ? 'border-white bg-white text-ink'
                            : 'border-white/25 text-white hover:border-white'
                        }`}
                      >
                        <span className="mr-2 text-[11px] uppercase tracking-[0.16em]">
                          {option.id}.
                        </span>
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {profile && (
            <div className="mt-12 border border-white/20 px-6 py-8 md:px-8">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                Votre résultat
              </p>
              <h3 className="mt-3 font-display text-4xl">{profile.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
                {profile.text}
              </p>
              <div className="mt-6">
                <Button as={Link} to="/trouver-mon-parfum" variant="secondary">
                  Trouver mon profil olfactif
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </article>
  )
}
