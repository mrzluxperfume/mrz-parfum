import { isSupabaseConfigured, supabase } from './supabase'
import { slugify } from '../utils/productModel'

const BUCKET = 'product-images'

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl)
  return response.blob()
}

/**
 * Persist an admin photo into Supabase Storage, then return a public URL
 * to store on products.image / collections.image.
 * Falls back to the data URL itself (still saved in the DB text column)
 * when Storage is unavailable.
 */
export async function persistCatalogImage(
  image,
  { folder = 'products', name = 'image' } = {},
) {
  const value = String(image || '').trim()
  if (!value) return ''

  // Already a hosted URL — keep it.
  if (!value.startsWith('data:')) return value

  if (!isSupabaseConfigured || !supabase) {
    return value
  }

  try {
    const blob = await dataUrlToBlob(value)
    const safe = slugify(name) || 'image'
    const path = `${folder}/${safe}-${Date.now()}.jpg`

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
      cacheControl: '31536000',
    })

    if (error) {
      console.warn('[product-images] storage upload failed, saving in DB column:', error.message)
      return value
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data?.publicUrl || value
  } catch (err) {
    console.warn('[product-images] upload error, saving in DB column:', err)
    return value
  }
}
