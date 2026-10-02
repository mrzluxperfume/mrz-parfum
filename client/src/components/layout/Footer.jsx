import { Link } from 'react-router-dom'
import { brand } from '../../data/brand'
import Container from '../ui/Container'

const infoLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Conditions générales', href: '/terms' },
  { label: 'Politique de confidentialité', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
  { label: 'Compte', href: '/account' },
]

function PaymentMethods() {
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Moyens de paiement">
      <li>
        <VisaMark />
      </li>
      <li>
        <MastercardMark />
      </li>
      <li>
        <AmexMark />
      </li>
      <li>
        <CbMark />
      </li>
      <li>
        <ApplePayMark />
      </li>
      <li>
        <GooglePayMark />
      </li>
    </ul>
  )
}

function Badge({ children, label }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex h-7 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-ink/10 bg-white"
    >
      {children}
    </span>
  )
}

function VisaMark() {
  return (
    <Badge label="Visa">
      <svg viewBox="0 0 48 16" className="h-3 w-8" aria-hidden="true">
        <text
          x="24"
          y="13"
          textAnchor="middle"
          fill="#1a1f71"
          fontFamily="Arial, sans-serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="16"
        >
          VISA
        </text>
      </svg>
    </Badge>
  )
}

function MastercardMark() {
  return (
    <Badge label="Mastercard">
      <svg viewBox="0 0 32 20" className="h-4 w-7" aria-hidden="true">
        <circle cx="12" cy="10" r="7" fill="#eb001b" />
        <circle cx="20" cy="10" r="7" fill="#f79e1b" />
        <path
          d="M16 4.8a7 7 0 0 1 0 10.4 7 7 0 0 1 0-10.4z"
          fill="#ff5f00"
        />
      </svg>
    </Badge>
  )
}

function AmexMark() {
  return (
    <Badge label="American Express">
      <span className="text-[8px] font-bold leading-none tracking-tight text-[#2e77bc]">
        AMEX
      </span>
    </Badge>
  )
}

function CbMark() {
  return (
    <Badge label="Cartes Bancaires">
      <span className="text-[11px] font-semibold leading-none tracking-tight text-[#0a3d91]">
        CB
      </span>
    </Badge>
  )
}

function ApplePayMark() {
  return (
    <Badge label="Apple Pay">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#000"
          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
        />
      </svg>
    </Badge>
  )
}

function GooglePayMark() {
  return (
    <Badge label="Google Pay">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    </Badge>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-fog">
      <Container className="py-8 md:py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0">
              <img
                src="/mrz-logo-footer.jpeg"
                alt="MRZ Luxury Perfume"
                className="h-14 w-14 rounded-full object-cover"
              />
            </Link>
            <div>
              <p className="font-display text-lg tracking-[0.14em] text-ink">MRZ</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                {brand.tagline}
              </p>
            </div>
          </div>

          <nav aria-label="Informations">
            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              {infoLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-[12px] uppercase tracking-[0.12em] text-ink/70 transition hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
            © {new Date().getFullYear()} {brand.name}
          </p>
          <a
            href={`mailto:${brand.email}`}
            className="text-[11px] tracking-[0.04em] text-ink/70 transition hover:text-ink"
          >
            {brand.email}
          </a>
          <PaymentMethods />
        </div>
      </Container>
    </footer>
  )
}
