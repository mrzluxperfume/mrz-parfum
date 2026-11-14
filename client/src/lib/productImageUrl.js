/** Local fallbacks used when WordPress / external product photos are missing. */
export const COLLECTION_IMAGE_FALLBACKS = {
  'maison-mrz': '/product/bottle-maison-mrz.png',
  lamas: '/product/bottle-lamas.png',
  'collection-dubai': '/product/bottle-dubai.png',
  'body-splash': '/product/bottle-body-splash.png',
  'room-diffuseur': '/product/bottle-diffuseur.png',
  'parfum-osma': '/product/bottle-osma.png',
}

export const DEFAULT_PRODUCT_IMAGE = '/product/bottle-maison-mrz.png'

export function isUnusableProductImage(url) {
  const value = String(url || '').trim()
  if (!value) return true
  // Old WordPress host is dead — DNS no longer resolves.
  if (/mrz-perfume\.com\/wp-content/i.test(value)) return true
  if (/^https?:\/\/mrz-perfume\.com\//i.test(value)) return true
  return false
}

export function collectionImageFallback(slug) {
  return (
    COLLECTION_IMAGE_FALLBACKS[String(slug || '').trim()] || DEFAULT_PRODUCT_IMAGE
  )
}

export function resolveProductImage(productOrUrl, collectionSlug) {
  if (typeof productOrUrl === 'string' || productOrUrl == null) {
    const url = String(productOrUrl || '').trim()
    if (!isUnusableProductImage(url)) return url
    return collectionImageFallback(collectionSlug)
  }

  const product = productOrUrl
  const url = String(product?.image || '').trim()
  if (!isUnusableProductImage(url)) return url
  return collectionImageFallback(
    product?.categorySlug || product?.collectionSlug || collectionSlug,
  )
}
