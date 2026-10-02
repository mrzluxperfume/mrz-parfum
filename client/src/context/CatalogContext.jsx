import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { products as seedProducts } from '../data/products'
import { normalizeProduct, slugify } from '../utils/productModel'
import {
  isSupabaseConfigured,
  productFromRow,
  productToRow,
  supabase,
} from '../lib/supabase'

const CatalogContext = createContext(null)
const STORAGE_KEY = 'mrz_catalog_v1'
const HIDDEN_COLLECTION = 'parfum-rp-paris'

function isPublicProduct(product) {
  return (
    product.collectionSlug !== HIDDEN_COLLECTION &&
    product.categorySlug !== HIDDEN_COLLECTION
  )
}

function loadLocalCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProduct)
      }
    }
  } catch {
    /* ignore */
  }
  return seedProducts.map(normalizeProduct)
}

function persistLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(() =>
    isSupabaseConfigured ? [] : loadLocalCatalog(),
  )
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let cancelled = false
    ;(async () => {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })

      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
        setProducts(loadLocalCatalog())
        setReady(true)
        return
      }
      setProducts((data || []).map((row) => normalizeProduct(productFromRow(row))))
      setError('')
      setReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((updater) => {
    setProducts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!isSupabaseConfigured) persistLocal(next)
      return next
    })
  }, [])

  const getProductBySlug = useCallback(
    (slug) => products.find((p) => p.slug === slug),
    [products],
  )

  const getFeaturedProducts = useCallback(
    (limit = 8) =>
      products.filter((p) => p.featured && isPublicProduct(p)).slice(0, limit),
    [products],
  )

  const getNewProducts = useCallback(
    (limit = 8) =>
      products.filter((p) => p.newProduct && isPublicProduct(p)).slice(0, limit),
    [products],
  )

  const getProductsByCategory = useCallback(
    (category) =>
      products.filter(
        (p) =>
          isPublicProduct(p) &&
          (p.category === category ||
            p.categorySlug === category ||
            p.collectionSlug === category),
      ),
    [products],
  )

  const addProduct = useCallback(
    async (data) => {
      const normalized = normalizeProduct({
        ...data,
        id: data.id || Date.now(),
        slug: data.slug || slugify(data.name),
      })

      if (isSupabaseConfigured && supabase) {
        const { error: upsertError } = await supabase
          .from('products')
          .upsert(productToRow(normalized), { onConflict: 'id' })
        if (upsertError) throw upsertError
      }

      commit((prev) => [normalized, ...prev])
      return normalized
    },
    [commit],
  )

  const updateProduct = useCallback(
    async (id, data) => {
      let updated = null
      commit((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          updated = normalizeProduct({
            ...p,
            ...data,
            id,
            slug: data.slug || p.slug || slugify(data.name || p.name),
          })
          return updated
        }),
      )

      if (updated && isSupabaseConfigured && supabase) {
        const { error: upsertError } = await supabase
          .from('products')
          .upsert(productToRow(updated), { onConflict: 'id' })
        if (upsertError) throw upsertError
      }
    },
    [commit],
  )

  const deleteProduct = useCallback(
    async (id) => {
      if (isSupabaseConfigured && supabase) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        if (deleteError) throw deleteError
      }
      commit((prev) => prev.filter((p) => p.id !== id))
    },
    [commit],
  )

  const resetCatalog = useCallback(async () => {
    const next = seedProducts.map(normalizeProduct)
    if (isSupabaseConfigured && supabase) {
      const rows = next.map(productToRow)
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(rows, { onConflict: 'id' })
      if (upsertError) throw upsertError
    } else {
      persistLocal(next)
    }
    setProducts(next)
  }, [])

  const value = useMemo(
    () => ({
      products,
      ready,
      error,
      source: isSupabaseConfigured ? 'supabase' : 'local',
      getProductBySlug,
      getFeaturedProducts,
      getNewProducts,
      getProductsByCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      resetCatalog,
    }),
    [
      products,
      ready,
      error,
      getProductBySlug,
      getFeaturedProducts,
      getNewProducts,
      getProductsByCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      resetCatalog,
    ],
  )

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
