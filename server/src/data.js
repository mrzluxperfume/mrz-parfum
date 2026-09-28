import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let products = [];

export function loadLocalProducts() {
  // The seed JSON is the same one we built from the xlsx.
  const file = path.resolve(__dirname, "..", "data", "products.json");
  if (!fs.existsSync(file)) {
    console.warn("[data] No local products.json found, API will return empty lists.");
    products = [];
    return products;
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  // Add optional variant sizes (50ml / 100ml) for the product page.
  products = raw.map((p) => ({
    ...p,
    sizes: [
      { label: "50ml", price_eur: roundPrice((p.price_eur || 0) * 0.7) },
      { label: "100ml", price_eur: roundPrice(p.price_eur || 0) },
    ],
  }));
  console.log(`[data] Loaded ${products.length} products from local JSON.`);
  return products;
}

function roundPrice(n) {
  return Math.round(n * 100) / 100;
}

export function getLocalProducts() {
  return products;
}

export function getLocalCategories() {
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.category)) {
      map.set(p.category, {
        slug: slugify(p.category),
        name: p.category,
        count: 0,
        cover: p.image,
      });
    }
    map.get(p.category).count += 1;
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
