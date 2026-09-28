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

function emptySizes(basePrice = 0) {
  return SIZE_OPTIONS.map((volume) => ({
    volume,
    price: Number(basePrice) || 0,
    enabled: false,
  }))
}

function matchKnownVolume(rawVolume) {
  const v = String(rawVolume || '')
    .toLowerCase()
    .replace(/\s+/g, '')
  if (v.includes('50')) return '50 ml'
  if (v.includes('100')) return '100 ml'
  return null
}

export function normalizeProduct(raw) {
  if (!raw) return null

  const basePrice = Number(raw.price) || 0
  let sizes

  if (Array.isArray(raw.sizes) && raw.sizes.length > 0) {
    const map = new Map(
      raw.sizes.map((s) => {
        const volume =
          s.volume === '50 ml' || String(s.volume).includes('50')
            ? '50 ml'
            : '100 ml'
        return [
          volume,
          {
            volume,
            price: Number(s.price) || basePrice,
            enabled: s.enabled !== false,
          },
        ]
      }),
    )
    sizes = SIZE_OPTIONS.map(
      (volume) =>
        map.get(volume) || {
          volume,
          price: basePrice,
          enabled: false,
        },
    )
  } else {
    sizes = emptySizes(basePrice)
    const known = matchKnownVolume(raw.volume)
    if (known) {
      sizes = sizes.map((s) =>
        s.volume === known ? { ...s, enabled: true, price: basePrice } : s,
      )
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
    fragranceNotes: raw.fragranceNotes ?? null,
    description: raw.description ?? null,
  }
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
