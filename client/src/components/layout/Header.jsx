import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
} from 'lucide-react'
import { navigation, brand } from '../../data/brand'
import { useCollections } from '../../context/CollectionsContext'
import { useCart } from '../../context/CartContext'
import { cn } from '../../utils/format'

export default function Header() {
  const { count } = useCart()
  const { collections } = useCollections()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileSubmenu, setMobileSubmenu] = useState(null)

  useEffect(() => {
    setMobileOpen(false)
    setMobileSearchOpen(false)
    setOpenMenu(null)
    setMobileSubmenu(null)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const submitSearch = (e) => {
    e?.preventDefault()
    const q = query.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    setMobileSearchOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/95 backdrop-blur-md">
      <div className="container-mrz">
        {/* Mobile bar: Menu | Logo | Search + Cart */}
        <div className="flex items-center justify-between gap-2 py-3 lg:hidden">
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-6" strokeWidth={1.25} />
          </button>

          <Link
            to="/"
            className="font-display text-[22px] font-semibold tracking-[0.2em] text-ink sm:text-[26px]"
            aria-label={brand.name}
          >
            MRZ
          </Link>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              aria-label="Rechercher"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              {mobileSearchOpen ? (
                <X className="size-5" strokeWidth={1.25} />
              ) : (
                <Search className="size-5" strokeWidth={1.25} />
              )}
            </button>
            <Link
              to="/account"
              className="flex size-11 items-center justify-center"
              aria-label="Compte client"
            >
              <User className="size-6" strokeWidth={1.25} />
            </Link>
            <Link
              to="/cart"
              className="relative flex size-11 items-center justify-center"
              aria-label="Panier"
            >
              <ShoppingBag className="size-6" strokeWidth={1.25} />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-forest text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search — compact under header */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pb-3 lg:hidden"
              onSubmit={submitSearch}
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/45"
                  strokeWidth={1.5}
                />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un parfum..."
                  className="w-full border border-ink/25 bg-white py-3 pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ink"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Desktop header */}
        <div className="hidden items-center gap-4 py-4 lg:flex xl:gap-6">
          <Link
            to="/"
            className="shrink-0 font-display text-[32px] font-semibold tracking-[0.18em] text-ink"
            aria-label={brand.name}
          >
            MRZ
          </Link>

          <nav className="ml-2 flex min-w-0 flex-1 items-center">
            <ul className="flex items-center gap-3 xl:gap-6 2xl:gap-10">
              {navigation.map((item) => {
                const menuLinks = item.children
                  ? item.children
                  : item.type === 'dropdown'
                    ? collections.map((collection) => ({
                        label: collection.name,
                        href: `/category/${collection.slug}`,
                      }))
                    : null

                if (menuLinks) {
                  const isOpen = openMenu === item.label
                  return (
                    <li
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(item.label)}
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <button
                        type="button"
                        className={`nav-link inline-flex items-center gap-1 py-5${
                          menuLinks.some((link) => location.pathname === link.href)
                            ? ' opacity-55'
                            : ''
                        }`}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        onClick={() =>
                          setOpenMenu((current) =>
                            current === item.label ? null : item.label,
                          )
                        }
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            'size-3 opacity-60 transition-transform duration-200',
                            isOpen && 'rotate-180',
                          )}
                          strokeWidth={1.5}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-0 top-full z-[100] pt-1"
                          >
                            <div className="min-w-[220px] border border-ink/10 bg-white p-5 shadow-md">
                              <ul className="flex flex-col gap-3">
                                {menuLinks.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      to={link.href}
                                      className="block text-[12px] uppercase tracking-[0.12em] text-ink transition hover:opacity-55"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                }

                return (
                  <li key={item.href} className="shrink-0">
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) => {
                        const onNew =
                          location.pathname === '/shop' &&
                          location.search.includes('filter=new')
                        const active = item.href.includes('filter=new')
                          ? onNew
                          : isActive && !onNew
                        return `nav-link inline-flex items-center gap-1 py-5${
                          active ? ' opacity-55' : ''
                        }`
                      }}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <form onSubmit={submitSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-ink/45"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-[140px] border border-ink bg-white py-2 pl-10 pr-3 text-[13px] text-ink outline-none placeholder:text-ink/50 focus:border-ink xl:w-[180px] 2xl:w-[220px]"
              />
            </form>

            <Link to="/account" className="p-2" aria-label="Compte client">
              <User className="size-6" strokeWidth={1.25} />
            </Link>
            <Link to="/cart" className="relative p-2" aria-label="Panier">
              <ShoppingBag className="size-6" strokeWidth={1.25} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-forest text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-ink/50"
              aria-label="Fermer le menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute left-0 top-0 flex h-dvh w-[min(100%,340px)] flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <Link
                  to="/"
                  className="font-display text-2xl tracking-[0.18em]"
                  onClick={() => setMobileOpen(false)}
                >
                  MRZ
                </Link>
                <button
                  type="button"
                  className="flex size-11 items-center justify-center"
                  aria-label="Fermer"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-6" strokeWidth={1.25} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="flex flex-col">
                  {navigation.map((item) => {
                    const menuLinks = item.children
                      ? item.children
                      : item.type === 'dropdown'
                        ? collections.map((collection) => ({
                            label: collection.name,
                            href: `/category/${collection.slug}`,
                          }))
                        : null

                    if (menuLinks) {
                      const isOpen = mobileSubmenu === item.label
                      return (
                        <li
                          key={item.label}
                          className="border-b border-ink/5"
                        >
                          <button
                            type="button"
                            className="flex min-h-12 w-full items-center justify-between py-3 text-left text-[13px] uppercase tracking-[0.16em]"
                            onClick={() =>
                              setMobileSubmenu((current) =>
                                current === item.label ? null : item.label,
                              )
                            }
                            aria-expanded={isOpen}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                'size-4 shrink-0 transition-transform',
                                isOpen && 'rotate-180',
                              )}
                              strokeWidth={1.5}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-fog/60"
                              >
                                {menuLinks.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      to={link.href}
                                      className="block py-3.5 pl-4 pr-2 text-sm text-ink/80"
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      )
                    }

                    return (
                      <li key={item.href} className="border-b border-ink/5">
                        <NavLink
                          to={item.href}
                          end={item.href === '/'}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-12 items-center py-3 text-[13px] uppercase tracking-[0.16em]',
                              isActive && 'text-forest',
                            )
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </nav>

            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
