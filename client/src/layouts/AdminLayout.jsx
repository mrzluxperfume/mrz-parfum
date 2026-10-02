import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Folders, LayoutDashboard, LogOut, Mail, Package, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { brand } from '../data/brand'
import NoIndex from '../components/NoIndex'

export default function AdminLayout() {
  const { isAuthenticated, logout, session } = useAuth()
  const { newCount } = useOrders()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-fog text-ink">
      <NoIndex />
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Administration
            </p>
            <h1 className="font-display text-2xl leading-none">{brand.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink/60 sm:inline">
              {session?.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-ink/15 px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <AdminNavLink to="/admin" end icon={LayoutDashboard}>
            Tableau de bord
          </AdminNavLink>
          <AdminNavLink to="/admin/products" icon={Package}>
            Produits
          </AdminNavLink>
          <AdminNavLink to="/admin/collections" icon={Folders}>
            Collections
          </AdminNavLink>
          <AdminNavLink to="/admin/orders" icon={ShoppingBag} badge={newCount}>
            Commandes
          </AdminNavLink>
          <AdminNavLink to="/admin/newsletter" icon={Mail}>
            Newsletter
          </AdminNavLink>
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({ to, end, icon: Icon, badge, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex shrink-0 items-center gap-2 px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] transition',
          isActive
            ? 'bg-forest text-white'
            : 'bg-white text-ink hover:bg-mist',
        ].join(' ')
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{children}</span>
      {badge > 0 && (
        <span className="ml-auto rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] tabular-nums">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
