import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE, sitemapPaths } from '../src/lib/sitemap-routes.js'

const pages = sitemapPaths()

const urls = pages
  .map(
    (path) => `  <url>
    <loc>${SITE}${path}</loc>
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
