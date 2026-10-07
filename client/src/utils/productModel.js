/** @deprecated kept for any leftover imports — volumes are free-form now */
const SIZE_OPTIONS = ['50 ml', '100 ml']

export { SIZE_OPTIONS }

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Normalize user input like "75", "75ml", "75 ML" → "75 ml" */
export function formatVolume(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  const match = s.match(/^(\d+(?:[.,]\d+)?)\s*m?l?$/i)
  if (match) {
    const n = match[1].replace(',', '.')
    return `${n} ml`
  }
  return s
}

function normalizeSizeEntry(s, basePrice = 0) {
  const volume = formatVolume(s?.volume)
  if (!volume) return null
  return {
    volume,
    price: Number(s?.price) || basePrice || 0,
    enabled: s?.enabled !== false,
  }
}

export function normalizeProduct(raw) {
  if (!raw) return null

  const basePrice = Number(raw.price) || 0
  let sizes = []

  if (Array.isArray(raw.sizes) && raw.sizes.length > 0) {
    sizes = raw.sizes
      .map((s) => normalizeSizeEntry(s, basePrice))
      .filter(Boolean)
  }

  if (sizes.length === 0 && raw.volume) {
    const volume = formatVolume(raw.volume)
    if (volume) {
      sizes = [{ volume, price: basePrice, enabled: true }]
    }
  }

  const enabledSizes = sizes.filter((s) => s.enabled)
  const price =
    enabledSizes.length > 0
      ? Math.min(...enabledSizes.map((s) => s.price))
      : basePrice
  const volumeLabel =
    enabledSizes.length === 0
      ? null
      : enabledSizes.length === 1
        ? enabledSizes[0].volume
        : enabledSizes.map((s) => s.volume).join(' / ')

  return {
    id: raw.id,
    name: raw.name || '',
    slug: raw.slug || slugify(raw.name),
    image: raw.image || '',
    brand: raw.brand || raw.category || '',
    category: raw.category || raw.brand || '',
    categorySlug: raw.categorySlug || slugify(raw.category || raw.brand),
    collection: raw.collection || raw.category || '',
    collectionSlug:
      raw.collectionSlug || raw.categorySlug || slugify(raw.collection),
    sizes,
    price,
    volume: volumeLabel,
    inStock: raw.inStock !== false,
    featured: Boolean(raw.featured),
    newProduct: Boolean(raw.newProduct),
    fragranceNotes: normalizeFragranceNotes(raw.fragranceNotes),
    description: raw.description ?? null,
  }
}

export function normalizeFragranceNotes(raw) {
  if (!raw) return null
  let value = raw
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      value = JSON.parse(trimmed)
    } catch {
      return { top: trimmed, heart: '', base: '' }
    }
  }
  if (typeof value !== 'object') return null
  const top = String(value.top || value.tete || value.head || '').trim()
  const heart = String(value.heart || value.coeur || value.middle || '').trim()
  const base = String(value.base || value.fond || '').trim()
  if (!top && !heart && !base) return null
  return { top, heart, base }
}

export function getEnabledSizes(product) {
  return (product?.sizes || []).filter((s) => s.enabled)
}

export function getSizePrice(product, volume) {
  const size = (product?.sizes || []).find(
    (s) => s.volume === volume && s.enabled,
  )
  return size ? size.price : product?.price
}
