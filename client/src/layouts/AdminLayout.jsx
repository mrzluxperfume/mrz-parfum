import { useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Folders,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  ShoppingBag,
  TicketPercent,
  Tags,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { brand } from '../data/brand'
import NoIndex from '../components/NoIndex'
import { cn } from '../utils/format'

const navItems = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/products', icon: Package, label: 'Produits' },
  { to: '/admin/collections', icon: Folders, label: 'Collections' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Commandes', badge: true },
  { to: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
  { to: '/admin/coupons', icon: TicketPercent, label: 'Coupons' },
  { to: '/admin/offers', icon: Tags, label: 'Offres' },
]

export default function AdminLayout() {
  const { isAuthenticated, logout, session } = useAuth()
  const { newCount } = useOrders()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-fog text-ink lg:flex">
      <NoIndex />

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-white lg:flex">
        <div className="border-b border-ink/10 px-5 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Administration
          </p>
          <p className="mt-1 font-display text-2xl tracking-[0.08em]">
            {brand.name}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <AdminNavLink
              key={item.to}
              to={item.to}
              end={item.end}
              icon={item.icon}
              badge={item.badge ? newCount : 0}
            >
              {item.label}
            </AdminNavLink>
          ))}
        </nav>

        <div className="border-t border-ink/10 p-4">
          <p className="mb-3 truncate text-xs text-ink/55">{session?.username}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 border border-ink/15 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="flex size-10 items-center justify-center"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
          <p className="font-display text-lg tracking-[0.12em]">{brand.name}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-10 items-center justify-center"
            aria-label="Déconnexion"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
          </button>
        </header>

        <main className="min-h-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  Administration
                </p>
                <p className="font-display text-xl">{brand.name}</p>
              </div>
              <button
                type="button"
                className="flex size-10 items-center justify-center"
                aria-label="Fermer"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {navItems.map((item) => (
                <AdminNavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  icon={item.icon}
                  badge={item.badge ? newCount : 0}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </AdminNavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}

function AdminNavLink({ to, end, icon: Icon, badge = 0, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'inline-flex w-full items-center gap-3 px-3 py-3 text-[11px] uppercase tracking-[0.14em] transition',
          isActive
            ? 'bg-forest text-white'
            : 'text-ink/80 hover:bg-fog hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{children}</span>
          {badge > 0 ? (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-forest/10 text-forest',
              )}
            >
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}
