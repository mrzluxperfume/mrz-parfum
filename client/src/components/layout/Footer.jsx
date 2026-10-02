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

const socialLinks = [
  {
    label: 'Instagram',
    href: brand.social.instagram,
    icon: InstagramIcon,
  },
  {
    label: 'Snapchat',
    href: brand.social.snapchat,
    icon: SnapchatIcon,
  },
  {
    label: 'TikTok',
    href: brand.social.tiktok,
    icon: TikTokIcon,
  },
].filter((item) => item.href)

function InstagramIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SnapchatIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.004 2c-3.4 0-5.86 2.35-5.86 6.05v1.12c-.7.14-1.84.53-2.35.89-.36.25-.4.5-.3.72.16.35.78.43 1.4.43.34 0 .7-.03 1.02-.08-.1 1.54-.9 2.46-1.84 3.14-.66.48-1.37.8-1.85 1.24-.42.38-.58.8-.43 1.17.24.63 1.13.86 1.9.86.35 0 .7-.05 1.01-.14.4-.12.8-.18 1.2-.18.38 0 .76.06 1.13.19.53.19 1.1.42 1.77.42.19 0 .38-.02.56-.05.5 1.23 1.48 2.03 2.84 2.03s2.34-.8 2.84-2.03c.18.03.37.05.56.05.67 0 1.24-.23 1.77-.42.37-.13.75-.19 1.13-.19.4 0 .8.06 1.2.18.31.09.66.14 1.01.14.77 0 1.66-.23 1.9-.86.15-.37-.01-.79-.43-1.17-.48-.44-1.19-.76-1.85-1.24-.94-.68-1.74-1.6-1.84-3.14.32.05.68.08 1.02.08.62 0 1.24-.08 1.4-.43.1-.22.06-.47-.3-.72-.51-.36-1.65-.75-2.35-.89V8.05C17.86 4.35 15.41 2 12.004 2z" />
    </svg>
  )
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.52a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.96a8.22 8.22 0 0 0 4.76 1.52V7.03a4.84 4.84 0 0 1-1-.34z" />
    </svg>
  )
}

function PaymentMethods() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Moyens de paiement">
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
      className="inline-flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-ink/10 bg-white"
    >
      {children}
    </span>
  )
}

function VisaMark() {
  return (
    <Badge label="Visa">
      <svg viewBox="0 0 48 16" className="h-3.5 w-10" aria-hidden="true">
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
      <svg viewBox="0 0 32 20" className="h-5 w-9" aria-hidden="true">
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
      <span className="text-[10px] font-bold leading-none tracking-tight text-[#2e77bc]">
        AMEX
      </span>
    </Badge>
  )
}

function CbMark() {
  return (
    <Badge label="Cartes Bancaires">
      <span className="text-[13px] font-semibold leading-none tracking-tight text-[#0a3d91]">
        CB
      </span>
    </Badge>
  )
}

function ApplePayMark() {
  return (
    <Badge label="Apple Pay">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/mrz-logo-footer.jpeg"
              alt="MRZ Luxury Perfume"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span>
              <span className="block font-display text-base tracking-[0.14em] text-ink">
                MRZ
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-muted">
                {brand.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Informations">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {infoLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-[11px] uppercase tracking-[0.12em] text-ink/70 transition hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-4" aria-label="Réseaux sociaux">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex text-ink/55 transition hover:text-ink"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
            © {new Date().getFullYear()} {brand.name}
          </p>
          <PaymentMethods />
        </div>
      </Container>
    </footer>
  )
}
