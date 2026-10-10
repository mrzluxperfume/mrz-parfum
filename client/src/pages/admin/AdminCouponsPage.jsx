import { useEffect, useMemo, useState } from 'react'
import { TicketPercent } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import { formatPrice } from '../../utils/format'

function apiBase() {
  return (
    import.meta.env.PROD
      ? '/api'
      : import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  ).replace(/\/$/, '')
}

function reductionLabel(coupon) {
  if (coupon.type === 'percent') return `−${coupon.value} %`
  return `−${formatPrice(coupon.value)}`
}

export default function AdminCouponsPage() {
  const { adminToken } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [code, setCode] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('10')
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

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBase()}/coupons`, { headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Chargement impossible.')
      setCoupons((data.coupons || []).filter((coupon) => coupon.active))
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

  async function createCoupon(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${apiBase()}/coupons`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, type, value: Number(value) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Création impossible.')
      setCode('')
      setNotice(`Coupon ${data.coupon?.code || ''} créé.`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteCoupon(coupon) {
    const confirmed = window.confirm(`Supprimer le coupon ${coupon.code} ?`)
    if (!confirmed) return
    const id = coupon.id
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${apiBase()}/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Suppression impossible.')
      setCoupons((current) => current.filter((coupon) => coupon.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl">Coupons</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/65">
          Créez un code. Le client le saisit dans son panier, et la réduction
          de ce code est déduite du paiement.
        </p>
      </div>

      <form
        onSubmit={createCoupon}
        className="grid gap-4 border border-ink/10 bg-white p-5 md:grid-cols-4 md:items-end"
      >
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
            Code
          </span>
          <input
            className="field-input uppercase"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="MRZ10"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
            Type
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
        <div className="md:col-span-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Création…' : 'Créer le coupon'}
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="text-sm text-ink/70">{notice}</p> : null}

      <div className="border border-ink/10 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-ink/60">Chargement…</p>
        ) : coupons.length === 0 ? (
          <p className="p-5 text-sm text-ink/60">Aucun coupon pour le moment.</p>
        ) : (
          <ul>
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <TicketPercent className="h-4 w-4 text-forest" />
                  <div>
                    <p className="text-sm tracking-[0.12em]">{coupon.code}</p>
                    <p className="mt-1 text-xs text-ink/55">{reductionLabel(coupon)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCoupon(coupon)}
                  className="border border-ink/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink/70 hover:border-ink hover:text-ink"
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
