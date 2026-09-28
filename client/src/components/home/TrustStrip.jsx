import { Heart, ShieldCheck, Sparkles } from 'lucide-react'
import Container from '../ui/Container'
import { trustItems } from '../../data/brand'

const icons = {
  sparkles: Sparkles,
  heart: Heart,
  shield: ShieldCheck,
}

export default function TrustStrip() {
  return (
    <section className="bg-mist pt-6 pb-0 md:pt-8">
      <Container>
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {trustItems.map((item) => {
            const Icon = icons[item.icon] || Sparkles
            return (
              <div
                key={item.title}
                className="flex flex-col items-center justify-center bg-white px-6 py-10 text-center"
              >
                <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-ink">
                  <Icon className="size-7" strokeWidth={1.25} />
                </div>
                <h3 className="font-title text-[18px] font-medium uppercase leading-tight md:text-[24px]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/75 px-1">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
