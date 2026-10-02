import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections } from '../src/data/collections.js'
import { products } from '../src/data/products.js'

const site = 'https://www.mrz-perfume.fr'
const HIDDEN_COLLECTION = 'parfum-rp-paris'

const pages = [
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

for (const collection of collections) {
  if (collection.slug === HIDDEN_COLLECTION) continue
  pages.push(`/collection/${collection.slug}`)
  pages.push(`/category/${collection.slug}`)
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
  pages.push(`/product/${product.slug}`)
}

const urls = pages
  .map(
    (path) => `  <url>
    <loc>${site}${path}</loc>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
writeFileSync(out, xml.replaceAll('\r\n', '\n'), { encoding: 'utf8' })
console.log(`sitemap.xml: ${pages.length} URLs`)
