import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !String(url).includes('YOUR_PROJECT') &&
    !String(anonKey).includes('YOUR_ANON'),
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export function productFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price) || 0,
    image: row.image || '',
    brand: row.brand || '',
    category: row.category || '',
    categorySlug: row.category_slug || '',
    collection: row.collection || '',
    collectionSlug: row.collection_slug || '',
    volume: row.volume || null,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    inStock: row.in_stock !== false,
    featured: Boolean(row.featured),
    newProduct: Boolean(row.new_product),
    fragranceNotes: row.fragrance_notes ?? null,
    description: row.description ?? null,
  }
}

export function productToRow(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price) || 0,
    image: product.image || '',
    brand: product.brand || '',
    category: product.category || '',
    category_slug: product.categorySlug || '',
    collection: product.collection || '',
    collection_slug: product.collectionSlug || '',
    volume: product.volume || null,
    sizes: product.sizes || [],
    in_stock: product.inStock !== false,
    featured: Boolean(product.featured),
    new_product: Boolean(product.newProduct),
    fragrance_notes: product.fragranceNotes ?? null,
    description: product.description ?? null,
  }
}

export function collectionFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    image: row.image || '',
    tone: row.tone || 'dark',
  }
}

export function collectionToRow(collection) {
  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description || '',
    image: collection.image || '',
    tone: collection.tone || 'dark',
  }
}

export function orderFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status || 'new',
    customer: row.customer || {},
    note: row.note || '',
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total) || 0,
  }
}

export function orderToRow(order) {
  return {
    id: order.id,
    created_at: order.createdAt,
    status: order.status || 'new',
    customer: order.customer || {},
    note: order.note || '',
    items: order.items || [],
    total: Number(order.total) || 0,
  }
}
