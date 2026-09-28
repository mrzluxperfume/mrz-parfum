import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Container from '../components/ui/Container'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'
import { useCatalog } from '../context/CatalogContext'
import { useCollections } from '../context/CollectionsContext'
import { formatPrice } from '../utils/format'

const PRICE_MIN = 0
const PRICE_MAX = 70

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sélection' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A–Z' },
]

const defaultFilters = {
  query: '',
  collection: 'all',
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  inStockOnly: false,
  newOnly: false,
  sort: 'featured',
}

export default function ShopPage() {
  const { products: allProducts } = useCatalog()
  const { collections } = useCollections()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    newOnly: searchParams.get('filter') === 'new',
    collection: searchParams.get('collection') || 'all',
    sort:
      searchParams.get('filter') === 'new'
        ? 'newest'
        : searchParams.get('sort') || 'featured',
    query: searchParams.get('q') || '',
  }))
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const next = new URLSearchParams()
    if (filters.newOnly) next.set('filter', 'new')
    if (filters.collection !== 'all') next.set('collection', filters.collection)
    if (filters.sort !== 'featured' && !(filters.newOnly && filters.sort === 'newest')) {
      next.set('sort', filters.sort)
    }
    if (filters.query.trim()) next.set('q', filters.query.trim())
    setSearchParams(next, { replace: true })
  }, [filters, setSearchParams])

  const filtered = useMemo(() => {
    let list = [...allProducts]

    const q = filters.query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q),
      )
    }

    if (filters.collection !== 'all') {
      list = list.filter(
        (p) =>
          p.collectionSlug === filters.collection ||
          p.categorySlug === filters.collection,
      )
    }

    list = list.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice,
    )

    if (filters.inStockOnly) {
      list = list.filter((p) => p.inStock)
    }

    if (filters.newOnly) {
      list = list.filter((p) => p.newProduct)
    }

    switch (filters.sort) {
      case 'newest':
        list.sort((a, b) => Number(b.newProduct) - Number(a.newProduct) || a.id - b.id)
        break
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        break
      default:
        list.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) || a.id - b.id,
        )
    }

    return list
  }, [filters, allProducts])

  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }))

  const resetFilters = () =>
    setFilters({
      ...defaultFilters,
      sort: filters.sort,
    })

  const activeFilterCount = [
    filters.collection !== 'all',
    filters.minPrice > PRICE_MIN || filters.maxPrice < PRICE_MAX,
    filters.inStockOnly,
    filters.newOnly,
    filters.query.trim() !== '',
  ].filter(Boolean).length

  return (
    <div>
      <section className="border-b border-ink/5 bg-fog py-12 md:py-16">
        <Container>
          <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
            MRZ Perfume
          </p>
          <h1 className="text-center font-display text-4xl md:text-5xl lg:text-6xl">
            Boutique
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink/70">
            Tous les parfums et collections de la maison.
          </p>
        </Container>
      </section>

      <Container className="py-8 md:py-10">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-[17px] -translate-y-1/2 text-ink/50"
              strokeWidth={1.5}
            />
            <input
              type="text"
              inputMode="search"
              autoComplete="off"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="Rechercher un parfum..."
              className="w-full border border-ink/25 bg-white py-3 pl-11 pr-10 text-[13px] text-ink outline-none transition placeholder:text-ink/40 hover:border-ink/40 focus:border-ink"
            />
            {filters.query && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => update({ query: '' })}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-ink/45 transition hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] lg:hidden"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.5} />
              Filtrer
              {activeFilterCount > 0 && (
                <span className="bg-ink px-1.5 py-0.5 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]">
              <span className="text-ink/55">Trier</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value })}
                className="border border-ink/20 bg-white px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] outline-none focus:border-ink"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">
              {filtered.length} produit{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Desktop sidebar — sticky while scrolling products */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-[108px] max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <FilterPanel
                filters={filters}
                update={update}
                resetFilters={resetFilters}
                collections={collections}
              />
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="border border-ink/10 py-20 text-center">
                <p className="text-sm text-ink/70">
                  Aucun produit ne correspond à votre recherche.
                </p>
                <div className="mt-6">
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Fermer les filtres"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white"
            >
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <h2 className="text-[12px] uppercase tracking-[0.16em]">
                  Filtres
                </h2>
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="size-5" strokeWidth={1.25} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <FilterPanel
                  filters={filters}
                  update={update}
                  resetFilters={resetFilters}
                  collections={collections}
                />
              </div>
              <div className="border-t border-ink/10 p-5">
                <Button
                  type="button"
                  size="full"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Voir {filtered.length} produit{filtered.length > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterPanel({ filters, update, resetFilters, collections = [] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[12px] uppercase tracking-[0.16em]">Filtres</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[10px] uppercase tracking-[0.14em] text-ink/50 underline-offset-2 hover:text-ink hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink/55">
          Collection
        </h3>
        <ul className="space-y-2">
          <li>
            <FilterRadio
              checked={filters.collection === 'all'}
              onChange={() => update({ collection: 'all' })}
              label="Toutes"
            />
          </li>
          {collections.map((c) => (
            <li key={c.slug}>
              <FilterRadio
                checked={filters.collection === c.slug}
                onChange={() => update({ collection: c.slug })}
                label={c.name}
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink/55">
          Prix
        </h3>
        <p className="mb-3 text-sm text-ink/70">
          {formatPrice(filters.minPrice)} — {formatPrice(filters.maxPrice)}
        </p>
        <div className="space-y-3">
          <label className="block text-[10px] uppercase tracking-[0.12em] text-ink/45">
            Min
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1}
              value={filters.minPrice}
              onChange={(e) => {
                const value = Number(e.target.value)
                update({
                  minPrice: Math.min(value, filters.maxPrice),
                })
              }}
              className="mt-1 w-full accent-forest"
            />
          </label>
          <label className="block text-[10px] uppercase tracking-[0.12em] text-ink/45">
            Max
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1}
              value={filters.maxPrice}
              onChange={(e) => {
                const value = Number(e.target.value)
                update({
                  maxPrice: Math.max(value, filters.minPrice),
                })
              }}
              className="mt-1 w-full accent-forest"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="mb-1 text-[11px] uppercase tracking-[0.14em] text-ink/55">
          Disponibilité
        </h3>
        <FilterCheck
          checked={filters.inStockOnly}
          onChange={(checked) => update({ inStockOnly: checked })}
          label="En stock uniquement"
        />
        <FilterCheck
          checked={filters.newOnly}
          onChange={(checked) =>
            update({
              newOnly: checked,
              sort: checked ? 'newest' : filters.sort,
            })
          }
          label="Nouveautés"
        />
      </div>

      <div className="border-t border-ink/10 pt-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink/55">
          Accès rapide
        </p>
        <ul className="space-y-2">
          {collections.slice(0, 4).map((c) => (
            <li key={c.slug}>
              <Link
                to={`/collection/${c.slug}`}
                className="text-sm text-ink/70 transition hover:text-ink"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FilterRadio({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-forest"
      />
      {label}
    </label>
  )
}

function FilterCheck({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-forest"
      />
      {label}
    </label>
  )
}
