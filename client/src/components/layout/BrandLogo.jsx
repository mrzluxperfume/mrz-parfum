import { Link } from 'react-router-dom'
import { cn } from '../../utils/format'
import { brand } from '../../data/brand'

const sizes = {
  sm: 'h-8 sm:h-9',
  md: 'h-10',
  lg: 'h-11 xl:h-12',
}

export default function BrandLogo({
  size = 'lg',
  className,
  onClick,
  to = '/',
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={brand.name}
      className={cn('inline-flex shrink-0 items-center', className)}
    >
      <img
        src="/logonav2.png"
        alt={brand.name}
        decoding="async"
        className={cn(
          'block w-auto object-contain object-left',
          sizes[size] || sizes.lg,
        )}
      />
    </Link>
  )
}
