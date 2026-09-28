import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections } from '../src/data/collections.js'
import { products } from '../src/data/products.js'

const site = 'https://mrz-perfume.com'
const lastmod = new Date().toISOString().slice(0, 10)

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/shop', priority: '0.9' },
  { path: '/collections', priority: '0.8' },
  { path: '/trouver-mon-parfum', priority: '0.7' },
  { path: '/about', priority: '0.6' },
  { path: '/blog', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
  { path: '/faq', priority: '0.4' },
  { path: '/terms', priority: '0.3' },
  { path: '/privacy', priority: '0.3' },
]

for (const collection of collections) {
  pages.push({ path: `/collection/${collection.slug}`, priority: '0.8' })
  pages.push({ path: `/category/${collection.slug}`, priority: '0.7' })
}

const slugs = new Set()
for (const product of products) {
  if (product.slug && !slugs.has(product.slug)) {
    slugs.add(product.slug)
    pages.push({ path: `/product/${product.slug}`, priority: '0.8' })
  }
}

const urls = pages
  .map(
    (page) => `  <url>
    <loc>${site}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
writeFileSync(out, xml)
console.log(`sitemap.xml: ${pages.length} URLs`)
