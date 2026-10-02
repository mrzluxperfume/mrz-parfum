import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections } from '../src/data/collections.js'
import { products } from '../src/data/products.js'

const site = 'https://www.mrz-perfume.fr'
const lastmod = new Date().toISOString().slice(0, 10)
const HIDDEN_COLLECTION = 'parfum-rp-paris'

/** Pages publiques uniquement — jamais /admin, /cart, /account */
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/shop', priority: '0.9' },
  { path: '/collections', priority: '0.8' },
  { path: '/trouver-mon-parfum', priority: '0.7' },
  { path: '/about', priority: '0.6' },
  { path: '/about/histoire', priority: '0.5' },
  { path: '/about/temoignages', priority: '0.5' },
  { path: '/blog', priority: '0.6' },
  { path: '/blog/concentrations', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
  { path: '/faq', priority: '0.4' },
  { path: '/terms', priority: '0.3' },
  { path: '/privacy', priority: '0.3' },
]

const publicCollections = collections.filter(
  (collection) => collection.slug !== HIDDEN_COLLECTION,
)

for (const collection of publicCollections) {
  pages.push({ path: `/collection/${collection.slug}`, priority: '0.8' })
  pages.push({ path: `/category/${collection.slug}`, priority: '0.7' })
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
  pages.push({ path: `/product/${product.slug}`, priority: '0.8' })
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

// Format minimal recommandé par Google : loc + lastmod uniquement
const urls = pages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(`${site}${page.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
writeFileSync(out, xml, 'utf8')
console.log(`sitemap.xml: ${pages.length} URLs publiques (format Google minimal)`)
