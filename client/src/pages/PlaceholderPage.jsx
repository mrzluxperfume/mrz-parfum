import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-2xl text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
          MRZ Perfume
        </p>
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-5 text-sm leading-relaxed text-ink/70 md:text-base">
          {description ||
            'Cette page sera développée dans une prochaine phase.'}
        </p>
        <div className="mt-8">
          <Button as={Link} to="/">
            Retour à l&apos;accueil
          </Button>
        </div>
      </Container>
    </section>
  )
}
