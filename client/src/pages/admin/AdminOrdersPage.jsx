import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { formatPrice } from '../../utils/format'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'done', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
]

const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label]),
)

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  const selected =
    filtered.find((o) => o.id === selectedId) ||
    orders.find((o) => o.id === selectedId) ||
    null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl md:text-4xl">Commandes</h2>
        <p className="mt-2 text-sm text-ink/65">
          Commandes reçues depuis le panier du site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          Toutes ({orders.length})
        </FilterChip>
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s.value).length
          return (
            <FilterChip
              key={s.value}
              active={filter === s.value}
              onClick={() => setFilter(s.value)}
            >
              {s.label} ({count})
            </FilterChip>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <p className="font-display text-2xl">Aucune commande</p>
          <p className="mt-2 text-sm text-ink/60">
            Les commandes passées sur le site apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto border border-ink/10 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-fog text-[10px] uppercase tracking-[0.14em] text-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Commande</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={[
                      'cursor-pointer border-b border-ink/5 last:border-0 transition',
                      selectedId === order.id
                        ? 'bg-forest/5'
                        : 'hover:bg-fog/80',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {order.id}
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.customer?.name || '—'}</p>
                      <p className="text-xs text-ink/50">
                        {order.customer?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-ink/50"
                    >
                      Aucune commande pour ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className="border border-ink/10 bg-white p-5">
            {!selected ? (
              <p className="text-sm text-ink/50">
                Sélectionnez une commande pour voir le détail.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Détail
                  </p>
                  <h3 className="mt-1 font-display text-2xl">{selected.id}</h3>
                  <p className="mt-1 text-xs text-ink/55">
                    {formatDate(selected.createdAt, true)}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selected.customer?.name}</p>
                  <p className="text-ink/70">{selected.customer?.email}</p>
                  {selected.customer?.phone && (
                    <p className="text-ink/70">{selected.customer.phone}</p>
                  )}
                  {selected.customer?.address && (
                    <p className="text-ink/70">{selected.customer.address}</p>
                  )}
                </div>

                {selected.note && (
                  <p className="border border-ink/10 bg-fog p-3 text-sm text-ink/75">
                    {selected.note}
                  </p>
                )}

                <ul className="space-y-3 border-t border-ink/10 pt-4">
                  {selected.items?.map((item, i) => (
                    <li key={`${item.productId}-${item.volume}-${i}`} className="flex gap-3 text-sm">
                      <div className="h-12 w-12 shrink-0 overflow-hidden bg-fog">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-ink/55">
                          {item.volume || '—'} · ×{item.quantity}
                        </p>
                      </div>
                      <p className="tabular-nums">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-sm">
                  <span className="uppercase tracking-[0.12em]">Total</span>
                  <span className="text-lg tabular-nums">
                    {formatPrice(selected.total)}
                  </span>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    Statut
                  </span>
                  <select
                    className="field-input"
                    value={selected.status}
                    onChange={(e) =>
                      updateOrderStatus(selected.id, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Supprimer cette commande ?')) {
                      deleteOrder(selected.id)
                      setSelectedId(null)
                    }
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 border border-red-700/40 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-700 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition',
        active
          ? 'bg-forest text-white'
          : 'border border-ink/15 bg-white hover:border-ink',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const tones = {
    new: 'bg-forest/10 text-forest',
    processing: 'bg-amber-100 text-amber-900',
    shipped: 'bg-sky-100 text-sky-900',
    done: 'bg-mist text-ink/70',
    cancelled: 'bg-red-50 text-red-700',
  }
  return (
    <span
      className={[
        'inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
        tones[status] || tones.new,
      ].join(' ')}
    >
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function formatDate(iso, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(d)
}
