import { Link } from 'react-router-dom'
import { cn } from '../../utils/format'

export default function SectionHeading({
  title,
  href = '/shop',
  linkLabel = 'Tout voir',
  className,
}) {
  return (
    <div
      className={cn(
        'mb-6 flex items-end justify-between gap-6 md:mb-8',
        className,
      )}
    >
      <h2 className="section-title">{title}</h2>
      <Link
        to={href}
        className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-ink underline-offset-4 transition hover:underline sm:text-[11px]"
      >
        {linkLabel}
      </Link>
    </div>
  )
}
