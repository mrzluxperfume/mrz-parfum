import { collections } from '../data/collections.js'
import { products } from '../data/products.js'
import { SITE } from './seo.js'

const HIDDEN_COLLECTION = 'parfum-rp-paris'

const STATIC_PATHS = [
  '/',
  '/shop',
  '/collections',
  '/trouver-mon-parfum',
  '/about',
  '/about/histoire',
  '/about/temoignages',
  '/blog',
  '/blog/concentrations',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
]

export { SITE }

export function sitemapPaths() {
  const paths = [...STATIC_PATHS]

  for (const collection of collections) {
    if (collection.slug === HIDDEN_COLLECTION) continue
    paths.push(`/collection/${collection.slug}`)
    paths.push(`/category/${collection.slug}`)
  }

  const slugs = new Set()
  for (const product of products) {
    if (
      !product.slug ||
      slugs.has(product.slug) ||
      product.collectionSlug === HIDDEN_COLLECTION ||
      product.categorySlug === HIDDEN_COLLECTION
    ) {
      continue
    }
    slugs.add(product.slug)
    paths.push(`/product/${product.slug}`)
  }

  return paths
}