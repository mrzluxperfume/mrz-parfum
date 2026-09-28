import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { brand } from '../../data/brand'

export default function CategoryNav() {
  return (
    <section className="border-t border-ink/5 bg-fog py-16 md:py-24">
      <Container className="flex flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {brand.name}
        </p>
        <p className="mt-5 max-w-md font-display text-2xl leading-snug text-ink md:text-3xl">
          Écrivez-nous. Nous vous répondrons dans les meilleurs délais.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/contact">
            Contactez-nous
          </Button>
        </div>
      </Container>
    </section>
  )
}
