/** Dead WordPress host — images there are gone for good. */
export function isUnusableProductImage(url) {
  const value = String(url || '').trim()
  if (!value) return true
  if (/mrz-perfume\.com\/wp-content/i.test(value)) return true
  if (/^https?:\/\/mrz-perfume\.com\//i.test(value)) return true
  return false
}

/**
 * Keep only usable images (Supabase Storage URL, data URL, local path).
 * Old mrz-perfume.com links become empty until a real photo is uploaded.
 */
export function resolveProductImage(productOrUrl) {
  if (typeof productOrUrl === 'string' || productOrUrl == null) {
    const url = String(productOrUrl || '').trim()
    return isUnusableProductImage(url) ? '' : url
  }

  const url = String(productOrUrl?.image || '').trim()
  return isUnusableProductImage(url) ? '' : url
}

/** @deprecated kept for existing imports — no generated bottle art anymore */
export function collectionImageFallback() {
  return ''
}
