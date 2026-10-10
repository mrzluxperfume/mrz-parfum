import { useEffect, useMemo, useState } from 'react'
import { Tags } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCatalog } from '../../context/CatalogContext'
import Button from '../../components/ui/Button'
import { formatPrice } from '../../utils/format'

function apiBase() {
  return (
    import.meta.env.PROD
      ? '/api'
      : import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  ).replace(/\/$/, '')
}

function reductionLabel(offer) {
  if (offer.type === 'percent') return `−${offer.value} %`
  return `−${formatPrice(offer.value)}`
}

export default function AdminOffersPage() {
  const { adminToken } = useAuth()
  const { products } = useCatalog()
  const [offers, setOffers] = useState([])
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('50')
  const [selected, setSelected] = useState(() => new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'X-Mrz-Admin': adminToken || '',
    }),
    [adminToken],
  )

  const names = useMemo(() => {
    const map = new Map()
    products.forEach((product) => map.set(String(product.id), product.name))
    return map
  }, [products])

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    return products.filter((product) =>
      term ? product.name.toLowerCase().includes(term) : true,
    )
  }, [products, query])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBase()}/offers`, { headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Chargement impossible.')
      setOffers(data.offers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken])

  function toggle(id) {
    const key = String(id)
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function createOffer(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${apiBase()}/offers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          value: Number(value),
          productIds: [...selected],
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Création impossible.')
      setSelected(new Set())
      setNotice('Offre créée.')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeOffer(id) {
    setError('')
    setNotice('')
    try {
      const response = await fetch(
        `${apiBase()}/offers?id=${encodeURIComponent(id)}`,
        { method: 'DELETE', headers },
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Suppression impossible.')
      setOffers((current) => current.filter((offer) => offer.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl">Offres</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/65">
          Sélectionnez les produits concernés. Dès que le client en achète au
          moins deux, la réduction choisie s’applique sur le moins cher.
        </p>
      </div>

      <form
        onSubmit={createOffer}
        className="space-y-4 border border-ink/10 bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
              Type de réduction
            </span>
            <select
              className="field-input"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="percent">Pourcentage</option>
              <option value="amount">Montant en euros</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
              {type === 'percent' ? 'Pourcentage' : 'Euros'}
            </span>
            <input
              className="field-input"
              type="number"
              min="1"
              max={type === 'percent' ? '100' : undefined}
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
            Produits de l’offre ({selected.size})
          </span>
          <input
            className="field-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit"
          />
        </label>
        <ul className="max-h-72 space-y-1 overflow-y-auto border border-ink/10 p-2">
          {visibleProducts.map((product) => {
            const id = String(product.id)
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm hover:bg-fog">
                  <input
                    type="checkbox"
                    checked={selected.has(id)}
                    onChange={() => toggle(product.id)}
                  />
                  <span className="flex-1">{product.name}</span>
                  <span className="tabular-nums text-ink/55">
                    {formatPrice(product.price)}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <Button type="submit" disabled={saving}>
          {saving ? 'Création…' : 'Créer l’offre'}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="text-sm text-ink/70">{notice}</p> : null}

      <div className="border border-ink/10 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-ink/60">Chargement…</p>
        ) : offers.length === 0 ? (
          <p className="p-5 text-sm text-ink/60">Aucune offre pour le moment.</p>
        ) : (
          <ul>
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-5 py-4 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <Tags className="mt-0.5 h-4 w-4 text-forest" />
                  <div>
                    <p className="text-sm">{reductionLabel(offer)} sur le moins cher</p>
                    <p className="mt-1 text-xs text-ink/55">
                      {(offer.productIds || [])
                        .map((id) => names.get(String(id)) || 'Produit')
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeOffer(offer.id)}
                  className="text-[11px] uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
