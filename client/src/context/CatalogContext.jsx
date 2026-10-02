import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { products as seedProducts } from '../data/products'
import { normalizeProduct, slugify } from '../utils/productModel'

const CatalogContext = createContext(null)
const STORAGE_KEY = 'mrz_catalog_v1'
const HIDDEN_COLLECTION = 'parfum-rp-paris'

function isPublicProduct(product) {
  return (
    product.collectionSlug !== HIDDEN_COLLECTION &&
    product.categorySlug !== HIDDEN_COLLECTION
  )
}

function loadCatalog() {
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

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(() => loadCatalog())

  const commit = useCallback((updater) => {
    setProducts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next)
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
    (data) => {
      const normalized = normalizeProduct({
        ...data,
        id: Date.now(),
        slug: data.slug || slugify(data.name),
      })
      commit((prev) => [normalized, ...prev])
      return normalized
    },
    [commit],
  )

  const updateProduct = useCallback(
    (id, data) => {
      commit((prev) =>
        prev.map((p) =>
          p.id === id
            ? normalizeProduct({
                ...p,
                ...data,
                id,
                slug: data.slug || p.slug || slugify(data.name || p.name),
              })
            : p,
        ),
      )
    },
    [commit],
  )

  const deleteProduct = useCallback(
    (id) => {
      commit((prev) => prev.filter((p) => p.id !== id))
    },
    [commit],
  )

  const resetCatalog = useCallback(() => {
    const next = seedProducts.map(normalizeProduct)
    persist(next)
    setProducts(next)
  }, [])

  const value = useMemo(
    () => ({
      products,
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
