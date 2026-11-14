import { useEffect, useState } from 'react'
import {
  collectionImageFallback,
  resolveProductImage,
} from '../../lib/productImageUrl'

export default function ProductImage({
  product,
  src,
  alt = '',
  className = '',
  loading = 'lazy',
}) {
  const resolved = resolveProductImage(product || src, product?.categorySlug)
  const fallback = collectionImageFallback(
    product?.categorySlug || product?.collectionSlug,
  )
  const [current, setCurrent] = useState(resolved)

  useEffect(() => {
    setCurrent(resolved)
  }, [resolved])

  return (
    <img
      src={current}
      alt={alt || product?.name || ''}
      loading={loading}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback)
      }}
    />
  )
}
