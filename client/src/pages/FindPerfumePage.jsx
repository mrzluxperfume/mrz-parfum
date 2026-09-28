import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Apple,
  Cake,
  Flame,
  Flower2,
  Monitor,
  Moon,
  Mountain,
  Sparkles,
  Star,
  Sun,
  Trees,
  UtensilsCrossed,
  Wind,
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { brand } from '../data/brand'
import {
  profileLine,
  questions,
  recommendPerfumes,
} from '../data/matchmaker'
import { useCatalog } from '../context/CatalogContext'
import { formatPrice } from '../utils/format'

const ICONS = {
  cake: Cake,
  trees: Trees,
  sun: Sun,
  flower: Flower2,
  spark: Sparkles,
  wind: Wind,
  apple: Apple,
  flame: Flame,
  monitor: Monitor,
  utensils: UtensilsCrossed,
  mountain: Mountain,
  moon: Moon,
  star: Star,
}

const emptyAnswers = {
  univers: [],
  moments: [],
  avoid: [],
  presence: null,
  budget: null,
}

export default function FindPerfumePage() {
  const { products } = useCatalog()
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState(emptyAnswers)

  const question = questions[step]
  const results = useMemo(() => {
    if (step !== questions.length) return []
    return recommendPerfumes(products, answers)
  }, [step, products, answers])

  const selected = question ? answers[question.id] : null
  const canContinue = question
    ? question.max === 1
      ? Boolean(selected)
      : Array.isArray(selected) &&
        (question.id === 'avoid' || selected.length > 0)
    : false

  const toggle = (optionId) => {
    if (!question) return
    setAnswers((prev) => {
      if (question.max === 1) {
        return { ...prev, [question.id]: optionId }
      }
      const current = prev[question.id] || []
      if (question.exclusive && optionId === question.exclusive) {
        return {
          ...prev,
          [question.id]: current.includes(optionId) ? [] : [optionId],
        }
      }
      const withoutExclusive = question.exclusive
        ? current.filter((id) => id !== question.exclusive)
        : current
      const next = withoutExclusive.includes(optionId)
        ? withoutExclusive.filter((id) => id !== optionId)
        : withoutExclusive.length >= question.max
          ? withoutExclusive
          : [...withoutExclusive, optionId]
      return { ...prev, [question.id]: next }
    })
  }

  const restart = () => {
    setAnswers(emptyAnswers)
    setStep(-1)
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <Container>
        <AnimatePresence mode="wait">
          {step < 0 && (
            <Intro key="intro" onStart={() => setStep(0)} />
          )}
          {question && (
            <QuestionStep
              key={question.id}
              question={question}
              index={step}
              total={questions.length}
              selected={selected}
              canContinue={canContinue}
              onToggle={toggle}
              onBack={() => setStep((value) => value - 1)}
              onNext={() => setStep((value) => value + 1)}
              isLast={step === questions.length - 1}
            />
          )}
          {step === questions.length && (
            <Results
              key="results"
              answers={answers}
              results={results}
              onRestart={restart}
            />
          )}
        </AnimatePresence>
      </Container>
    </section>
  )
}

function Intro({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-xl py-10 text-center md:py-20"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
        {brand.name} · 5 questions
      </p>
      <h1 className="mt-5 font-title text-[34px] font-medium uppercase leading-[0.95] tracking-tight md:text-[52px]">
        Trouver
        <br />
        mon parfum
      </h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/65">
        Cinq questions, quelques instants, trois fragrances choisies dans la
        collection MRZ pour ce que vous cherchez vraiment.
      </p>
      <Button type="button" onClick={onStart} className="mt-10 min-w-[220px]">
        Commencer
      </Button>
    </motion.div>
  )
}

function QuestionStep({
  question,
  index,
  total,
  selected,
  canContinue,
  onToggle,
  onBack,
  onNext,
  isLast,
}) {
  const progress = Math.round((index / total) * 100)
  const isSingle = question.max === 1
  const isList = question.id === 'avoid' || question.id === 'budget'
  const isSelected = (id) =>
    isSingle ? selected === id : (selected || []).includes(id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-3xl"
    >
      <div className="mb-8 flex items-center justify-between gap-6 text-[11px] uppercase tracking-[0.16em] text-ink/55">
        <span>
          Question {index + 1} / {total}
        </span>
        <span>{progress} %</span>
      </div>
      <div className="mb-8 h-px w-full bg-ink/10">
        <div
          className="h-px bg-ink transition-all duration-500"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      <h1 className="font-title text-[32px] font-medium uppercase leading-none tracking-tight md:text-[44px]">
        {question.title}
      </h1>
      <p className="mt-3 text-sm text-ink/60">{question.hint}</p>

      <div
        className={
          isList
            ? 'mt-8 flex flex-col gap-3'
            : 'mt-8 grid gap-3 sm:grid-cols-2'
        }
      >
        {question.options.map((option) => {
          const active = isSelected(option.id)
          const Icon = ICONS[option.icon]
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={[
                'border text-center transition duration-200',
                isList ? 'px-4 py-4 text-left' : 'px-4 py-7',
                active
                  ? isList
                    ? 'border-ink/20 bg-[#eef3ef]'
                    : 'border-ink'
                  : 'border-ink/15 bg-white hover:border-ink/40',
              ].join(' ')}
            >
              {isList ? (
                <span className="flex items-start gap-3">
                  <span
                    className={[
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-forest bg-forest' : 'border-ink/30',
                    ].join(' ')}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {option.label}
                    </span>
                    {option.caption && (
                      <span className="mt-0.5 block text-xs text-ink/55">
                        {option.caption}
                      </span>
                    )}
                  </span>
                </span>
              ) : (
                <>
                  {Icon && (
                    <Icon
                      className="mx-auto mb-3 h-6 w-6 text-ink/70"
                      strokeWidth={1.25}
                    />
                  )}
                  {question.id === 'presence' && (
                    <PresenceMark active={active} id={option.id} />
                  )}
                  <span className="block text-sm text-ink">{option.label}</span>
                  {option.caption && (
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-ink/45">
                      {option.caption}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex items-center gap-4">
        {index > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] uppercase tracking-[0.16em] text-ink/70 underline-offset-4 hover:underline"
          >
            Retour
          </button>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] uppercase tracking-[0.16em] text-ink/70 underline-offset-4 hover:underline"
          >
            Retour
          </button>
        )}
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className={[
            'flex-1 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] transition',
            canContinue
              ? 'bg-forest text-white hover:bg-forest-hover'
              : 'cursor-not-allowed bg-[#ececec] text-ink/35',
          ].join(' ')}
        >
          {isLast ? 'Voir ma sélection' : 'Continuer'}
        </button>
      </div>
    </motion.div>
  )
}

function PresenceMark({ active, id }) {
  const rings = id === 'discrete' ? 1 : id === 'equilibree' ? 2 : 3
  return (
    <span className="mx-auto mb-3 flex h-8 items-center justify-center">
      <span className="relative flex h-6 w-6 items-center justify-center">
        {Array.from({ length: rings }).map((_, ring) => (
          <span
            key={ring}
            className={[
              'absolute rounded-full border',
              active ? 'border-forest' : 'border-ink/25',
            ].join(' ')}
            style={{
              width: 8 + ring * 7,
              height: 8 + ring * 7,
            }}
          />
        ))}
        <span
          className={[
            'h-1.5 w-1.5 rounded-full',
            active ? 'bg-forest' : 'bg-ink/40',
          ].join(' ')}
        />
      </span>
    </span>
  )
}

function Results({ answers, results, onRestart }) {
  const icons = [
    ...questions[0].options.filter((option) => answers.univers?.includes(option.id)),
    ...questions[1].options.filter((option) => answers.moments?.includes(option.id)),
  ].slice(0, 4)
  const presence = questions[3].options.find(
    (option) => option.id === answers.presence,
  )
  const summary = profileLine(answers)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <div className="mb-8 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-ink/55">
        <span>Terminé</span>
        <span>100 %</span>
      </div>
      <div className="mb-8 h-px w-full bg-ink" />

      <div className="flex flex-wrap gap-2">
        {icons.map((option) => {
          const Icon = ICONS[option.icon]
          return (
            <span
              key={option.id}
              className="flex h-16 w-16 items-center justify-center bg-fog"
            >
              {Icon && <Icon className="h-6 w-6 text-ink/70" strokeWidth={1.25} />}
            </span>
          )
        })}
        {presence && (
          <span className="flex h-16 w-16 items-center justify-center bg-[#eef3ef]">
            <PresenceMark active id={presence.id} />
          </span>
        )}
      </div>

      {summary && (
        <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink/50">
          {summary}
        </p>
      )}

      <h1 className="mt-8 font-title text-[34px] font-medium uppercase leading-[0.95] tracking-tight md:text-[48px]">
        Trois parfums
        <br />
        pour vous
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/65">
        {summary
          ? `Profil ${summary.toLowerCase()}. Trois propositions issues du catalogue MRZ.`
          : 'Trois propositions issues du catalogue MRZ, selon vos réponses.'}
      </p>

      <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {results.map(({ product, affinity }, index) => (
          <li
            key={product.id}
            className="grid gap-4 py-6 sm:grid-cols-[88px_1fr_auto] sm:items-center"
          >
            <Link to={`/product/${product.slug}`} className="block bg-fog">
              {product.image ? (
                <img
                  src={product.image}
                  alt=""
                  className="h-24 w-full object-cover sm:h-[88px] sm:w-[88px]"
                />
              ) : (
                <span className="block h-24 sm:h-[88px] sm:w-[88px]" />
              )}
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] text-ink/45">N° {index + 1}</p>
              <p className="text-[11px] text-ink/55">{product.collection}</p>
              <Link
                to={`/product/${product.slug}`}
                className="mt-1 block font-title text-lg font-semibold uppercase tracking-wide"
              >
                {product.name}
              </Link>
              <p className="mt-1 text-sm text-ink/60">
                {product.description ||
                  `${product.collection} — ${product.volume || 'format au choix'}.`}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.14em] text-ink/45">
                  Affinité
                </span>
                <span className="h-px flex-1 bg-ink/10">
                  <span
                    className="block h-px bg-ink"
                    style={{ width: `${affinity}%` }}
                  />
                </span>
                <span className="text-[11px] tabular-nums text-ink/70">
                  {affinity} %
                </span>
              </div>
              <p className="mt-3 text-sm">{formatPrice(product.price)}</p>
            </div>
            <Button
              as={Link}
              to={`/product/${product.slug}`}
              variant="outline"
              size="sm"
              className="sm:self-end"
            >
              Découvrir
            </Button>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">
          Aucun parfum ne correspond encore à ces critères.
        </p>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 text-[11px] uppercase tracking-[0.16em] text-ink/70 underline-offset-4 hover:underline"
      >
        Recommencer
      </button>
    </motion.div>
  )
}
