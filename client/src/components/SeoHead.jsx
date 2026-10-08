import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useCollections } from '../context/CollectionsContext'
import { SITE_NAME, resolveSeo } from '../lib/seo'

function upsertMeta(attribute, key, content) {
  let el = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const id = 'mrz-jsonld'
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export default function SeoHead() {
  const { pathname } = useLocation()
  const { getProductBySlug } = useCatalog()
  const { collections } = useCollections()

  const productSlug = pathname.match(/^\/product\/([^/]+)/)?.[1]
  const collectionSlug = pathname.match(
    /^\/(?:collection|category)\/([^/]+)/,
  )?.[1]
  const product = productSlug
    ? getProductBySlug(decodeURIComponent(productSlug))
    : null
  const collection = collectionSlug
    ? collections.find((item) => item.slug === decodeURIComponent(collectionSlug))
    : null

  useEffect(() => {
    const seo = resolveSeo({ pathname, product, collection })
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'title', seo.title)
    upsertMeta(
      'name',
      'robots',
      seo.noindex ? 'noindex, nofollow' : 'index, follow',
    )
    upsertLink('canonical', seo.canonical)
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:url', seo.canonical)
    upsertMeta('property', 'og:type', seo.type === 'product' ? 'product' : 'website')
    upsertMeta('property', 'og:image', seo.image)
    upsertMeta('property', 'og:locale', 'fr_FR')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', seo.image)
    upsertJsonLd(seo.jsonLd)
  }, [pathname, product, collection])

  return null
}
