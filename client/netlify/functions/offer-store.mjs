import { createClient } from "@supabase/supabase-js";

const FILE = "offers.json";

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function readOffers() {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from("offers").download(FILE);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed.offers) ? parsed.offers : [];
  } catch {
    return [];
  }
}

export async function writeOffers(offers) {
  const supabase = client();
  if (!supabase) {
    const error = new Error("Stockage des offres indisponible.");
    error.status = 503;
    throw error;
  }
  const { error } = await supabase.storage.from("offers").upload(
    FILE,
    JSON.stringify({ offers }),
    { upsert: true, contentType: "application/json" },
  );
  if (error) throw error;
}

export function activeOffers(offers) {
  return offers.filter((offer) => offer.active !== false);
}
