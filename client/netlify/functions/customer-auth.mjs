import { createClient } from "@supabase/supabase-js";
import { json, preflight, readJson } from "./http.mjs";
import {
  hashPassword,
  isEmail,
  isStrongPassword,
  verifyPassword,
} from "./password.mjs";

const hits = new Map();

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 12) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["x-forwarded-for"] ||
    "unknown";
  if (isRateLimited(ip)) {
    return json(429, { error: "Trop de tentatives. Réessayez plus tard." });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return json(503, { error: "Authentification indisponible." });
  }

  try {
    const body = readJson(event);
    const action = String(body.action || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!isEmail(email) || !password) {
      return json(400, { error: "Email et mot de passe requis." });
    }

    if (action === "register") {
      if (!isStrongPassword(password)) {
        return json(400, {
          error: "Le mot de passe doit contenir au moins 8 caractères.",
        });
      }
      const firstName = String(body.firstName || "").trim().slice(0, 80);
      const lastName = String(body.lastName || "").trim().slice(0, 80);
      if (!firstName) {
        return json(400, { error: "Indiquez votre prénom." });
      }

      const { data: existing } = await supabase
        .from("customers")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        return json(409, { error: "Un compte existe déjà avec cet email." });
      }

      const passwordHash = hashPassword(password);
      const { error } = await supabase.from("customers").insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
      });

      if (error) {
        return json(500, { error: error.message || "Création impossible." });
      }

      return json(200, {
        ok: true,
        customer: { firstName, lastName, email },
      });
    }

    if (action === "login") {
      const { data, error } = await supabase
        .from("customers")
        .select("email, first_name, last_name, password_hash")
        .eq("email", email)
        .maybeSingle();

      if (error || !data) {
        return json(401, { error: "Email ou mot de passe incorrect." });
      }

      const valid = verifyPassword(password, data.password_hash);
      if (!valid) {
        return json(401, { error: "Email ou mot de passe incorrect." });
      }

      return json(200, {
        ok: true,
        customer: {
          firstName: data.first_name,
          lastName: data.last_name || "",
          email: data.email,
        },
      });
    }

    return json(400, { error: "Action invalide." });
  } catch (err) {
    return json(500, { error: err.message || "Erreur serveur." });
  }
}
