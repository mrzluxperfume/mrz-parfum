import { SITE, sitemapPaths } from "../../src/lib/sitemap-routes.js";

function buildSitemap() {
  const paths = sitemapPaths();
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
