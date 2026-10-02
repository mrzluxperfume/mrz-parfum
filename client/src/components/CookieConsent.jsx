import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/format'

const CONSENT_KEY = 'mrz_cookie_consent_v1'

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.necessary === true) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function hasAnalyticsConsent() {
  return Boolean(readCookieConsent()?.analytics)
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    setVisible(!readCookieConsent())
  }, [])

  const save = (next) => {
    const payload = {
      necessary: true,
      analytics: Boolean(next.analytics),
      decidedAt: new Date().toISOString(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="fixed inset-x-0 bottom-0 z-[200] border-t border-ink/10 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
    >
      <div className="container-mrz flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-xl text-ink">Cookies</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Nous utilisons des cookies nécessaires au fonctionnement du site
            (compte, panier, préférences). Avec votre accord, des cookies
            optionnels peuvent mesurer l’audience.{' '}
            <Link to="/privacy" className="underline underline-offset-2">
              Politique de confidentialité
            </Link>
          </p>

          {openDetails && (
            <label className="mt-4 flex items-start gap-3 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1"
              />
              <span>
                Cookies analytiques (mesure d’audience anonyme) — optionnel
              </span>
            </label>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpenDetails((v) => !v)}
            className="border border-ink/20 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ink/40 hover:text-ink"
          >
            {openDetails ? 'Masquer' : 'Personnaliser'}
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false })}
            className="border border-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-fog"
          >
            Essentiels uniquement
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: openDetails ? analytics : true })}
            className={cn(
              'bg-forest px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white transition hover:opacity-90',
            )}
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  )
}
