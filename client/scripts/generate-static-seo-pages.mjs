import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections } from '../src/data/collections.js'
import { products } from '../src/data/products.js'
import { resolveSeo } from '../src/lib/seo.js'
import { sitemapPaths } from '../src/lib/sitemap-routes.js'

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = join(clientRoot, 'dist')
const template = readFileSync(join(distRoot, 'index.html'), 'utf8')

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function setMeta(html, attribute, key, value) {
  const keyPattern = escapeRegExp(key)
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${keyPattern}["'])[^>]*>`,
    'i',
  )
  const tag = `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(value)}" />`
  return html.replace(pattern, tag)
}

function setCanonical(html, canonical) {
  return html.replace(
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
  )
}

function renderSeoHtml(pathname) {
  const productSlug = pathname.match(/^\/product\/([^/]+)/)?.[1]
  const collectionSlug = pathname.match(/^\/(?:collection|category)\/([^/]+)/)?.[1]
  const product = productSlug
    ? products.find((item) => item.slug === decodeURIComponent(productSlug))
    : null
  const collection = collectionSlug
    ? collections.find((item) => item.slug === decodeURIComponent(collectionSlug))
    : null
  const seo = resolveSeo({ pathname, product, collection })

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(seo.title)}</title>`,
  )
  html = setCanonical(html, seo.canonical)

  const meta = [
    ['name', 'description', seo.description],
    ['name', 'title', seo.title],
    ['name', 'robots', seo.noindex ? 'noindex, nofollow' : 'index, follow'],
    ['property', 'og:title', seo.title],
    ['property', 'og:description', seo.description],
    ['property', 'og:url', seo.canonical],
    ['property', 'og:type', seo.type === 'product' ? 'product' : 'website'],
    ['property', 'og:image', seo.image],
    ['name', 'twitter:title', seo.title],
    ['name', 'twitter:description', seo.description],
    ['name', 'twitter:image', seo.image],
  ]

  for (const [attribute, key, value] of meta) {
    html = setMeta(html, attribute, key, value)
  }

  if (seo.jsonLd) {
    const jsonLd = JSON.stringify(seo.jsonLd).replaceAll('<', '\\u003c')
    html = html.replace(
      '</head>',
      `<script id="mrz-jsonld" type="application/ld+json">${jsonLd}</script>\n  </head>`,
    )
  }

  return html
}

for (const pathname of sitemapPaths()) {
  const segments = pathname.split('/').filter(Boolean)
  const outputPath = join(distRoot, ...segments, 'index.html')
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, renderSeoHtml(pathname), 'utf8')
}

console.log(`Static SEO pages generated: ${sitemapPaths().length}`)