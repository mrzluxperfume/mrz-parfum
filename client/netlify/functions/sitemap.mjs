import { products } from "../../src/data/products.js";
import { collections } from "../../src/data/collections.js";

const SITE = "https://www.mrz-perfume.fr";
const HIDDEN = "parfum-rp-paris";

function buildSitemap() {
  const paths = [
    "/",
    "/shop",
    "/collections",
    "/trouver-mon-parfum",
    "/about",
    "/about/histoire",
    "/about/temoignages",
    "/blog",
    "/blog/concentrations",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
  ];

  for (const collection of collections) {
    if (collection.slug === HIDDEN) continue;
    paths.push(`/collection/${collection.slug}`);
    paths.push(`/category/${collection.slug}`);
  }

  const seen = new Set();
  for (const product of products) {
    if (
      !product.slug ||
      seen.has(product.slug) ||
      product.collectionSlug === HIDDEN ||
      product.categorySlug === HIDDEN
    ) {
      continue;
    }
    seen.add(product.slug);
    paths.push(`/product/${product.slug}`);
  }

  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${SITE}${path}</loc>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export async function handler() {
  const body = buildSitemap();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
    body,
  };
}
