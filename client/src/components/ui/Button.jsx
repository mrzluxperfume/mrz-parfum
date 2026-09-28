import { cn } from '../../utils/format'

const variants = {
  primary:
    'bg-forest text-white hover:bg-forest-hover border border-transparent',
  secondary:
    'bg-white text-ink border border-white hover:bg-transparent hover:text-white',
  outline:
    'bg-transparent text-ink border border-ink hover:bg-ink hover:text-white',
  ghost: 'bg-transparent text-ink border border-transparent hover:opacity-60',
}

const sizes = {
  md: 'px-6 py-[14px] text-[10px]',
  sm: 'px-4 py-2.5 text-[10px]',
  full: 'w-full px-6 py-[14px] text-[10px]',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center font-cta font-medium uppercase tracking-[var(--tracking-cta)] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
