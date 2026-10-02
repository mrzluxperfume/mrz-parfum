/**
 * Seed Supabase with collections + products from the site data.
 *
 * Usage (from mrz-perfume/):
 *   node --env-file=server/.env supabase/seed.mjs
 *
 * Needs in the env file:
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */
import { createClient } from '@supabase/supabase-js'
import { products } from '../client/src/data/products.js'
import { collections } from '../client/src/data/collections.js'
import { normalizeProduct } from '../client/src/utils/productModel.js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key || url.includes('YOUR_PROJECT')) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to server/.env first.',
  )
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function productToRow(raw) {
  const product = normalizeProduct(raw)
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

function collectionToRow(collection) {
  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description || '',
    image: collection.image || '',
    tone: collection.tone || 'dark',
  }
}

async function upsertBatch(table, rows, onConflict) {
  const chunkSize = 50
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).upsert(chunk, { onConflict })
    if (error) throw error
  }
}

async function main() {
  const collectionRows = collections.map(collectionToRow)
  const productRows = products.map(productToRow)

  console.log(`Seeding ${collectionRows.length} collections…`)
  await upsertBatch('collections', collectionRows, 'id')

  console.log(`Seeding ${productRows.length} products…`)
  await upsertBatch('products', productRows, 'id')

  console.log('Done. Supabase is ready.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
