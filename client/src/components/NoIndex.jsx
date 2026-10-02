import { useEffect } from 'react'

/** Sets noindex for private pages (account, cart, admin). */
export default function NoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const previous = meta?.getAttribute('content') || null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (previous == null) {
        meta.remove()
      } else {
        meta.setAttribute('content', previous)
      }
    }
  }, [])

  return null
}
