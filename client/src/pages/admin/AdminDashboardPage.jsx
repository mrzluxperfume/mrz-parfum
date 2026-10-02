import { Link } from 'react-router-dom'
import { Folders, Mail, Package, ShoppingBag } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useCollections } from '../../context/CollectionsContext'
import { useOrders } from '../../context/OrdersContext'
import { formatPrice } from '../../utils/format'

export default function AdminDashboardPage() {
  const { products } = useCatalog()
  const { collections } = useCollections()
  const { orders, newCount } = useOrders()
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl md:text-4xl">Tableau de bord</h2>
        <p className="mt-2 text-sm text-ink/65">
          Vue d&apos;ensemble du catalogue et des commandes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produits" value={products.length} />
        <Stat label="Collections" value={collections.length} />
        <Stat label="Commandes" value={orders.length} />
        <Stat label="Nouvelles" value={newCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/products"
          className="flex items-start gap-4 border border-ink/10 bg-white p-5 transition hover:border-ink/30"
        >
          <Package className="mt-0.5 h-5 w-5 text-forest" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em]">Produits</p>
            <p className="mt-1 text-sm text-ink/70">
              Ajouter, modifier et définir 50 ml / 100 ml.
            </p>
          </div>
        </Link>
        <Link
          to="/admin/collections"
          className="flex items-start gap-4 border border-ink/10 bg-white p-5 transition hover:border-ink/30"
        >
          <Folders className="mt-0.5 h-5 w-5 text-forest" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em]">
              Collections
            </p>
            <p className="mt-1 text-sm text-ink/70">
              Ajouter ou supprimer une collection.
            </p>
          </div>
        </Link>
        <Link
          to="/admin/orders"
          className="flex items-start gap-4 border border-ink/10 bg-white p-5 transition hover:border-ink/30"
        >
          <ShoppingBag className="mt-0.5 h-5 w-5 text-forest" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em]">Commandes</p>
            <p className="mt-1 text-sm text-ink/70">
              Total encaissé (local) : {formatPrice(revenue)}
            </p>
          </div>
        </Link>
        <Link
          to="/admin/newsletter"
          className="flex items-start gap-4 border border-ink/10 bg-white p-5 transition hover:border-ink/30"
        >
          <Mail className="mt-0.5 h-5 w-5 text-forest" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em]">
              Newsletter
            </p>
            <p className="mt-1 text-sm text-ink/70">
              Emails clients et offres de remise.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="border border-ink/10 bg-white p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
    </div>
  )
}
