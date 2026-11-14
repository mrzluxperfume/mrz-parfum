import { useEffect, useState } from 'react'
import { resolveProductImage } from '../../lib/productImageUrl'

export default function ProductImage({
  product,
  src,
  alt = '',
  className = '',
  loading = 'lazy',
}) {
  const resolved = resolveProductImage(product || src)
  const [current, setCurrent] = useState(resolved)

  useEffect(() => {
    setCurrent(resolved)
  }, [resolved])

  if (!current) {
    return <span className={`block bg-fog ${className}`} aria-hidden="true" />
  }

  return (
    <img
      src={current}
      alt={alt || product?.name || ''}
      loading={loading}
      className={className}
      onError={() => setCurrent('')}
    />
  )
}
