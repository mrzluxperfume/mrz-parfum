import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const router = Router();
const hits = new Map();

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(String(password), salt, ITERATIONS, KEY_LENGTH, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]) || ITERATIONS;
  const salt = Buffer.from(parts[2], "base64");
  const expected = Buffer.from(parts[3], "base64");
  const derived = pbkdf2Sync(
    String(password),
    salt,
    iterations,
    expected.length,
    "sha256",
  );
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 12) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

router.post("/", async (req, res) => {
  const ip = req.ip || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Trop de tentatives. Réessayez plus tard." });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: "Authentification indisponible." });
  }

  try {
    const action = String(req.body.action || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!isEmail(email) || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    if (action === "register") {
      if (password.length < 8) {
        return res.status(400).json({
          error: "Le mot de passe doit contenir au moins 8 caractères.",
        });
      }
      const firstName = String(req.body.firstName || "").trim().slice(0, 80);
      const lastName = String(req.body.lastName || "").trim().slice(0, 80);
      if (!firstName) {
        return res.status(400).json({ error: "Indiquez votre prénom." });
      }

      const { data: existing } = await supabase
        .from("customers")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
      }

      const { error } = await supabase.from("customers").insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: hashPassword(password),
      });

      if (error) {
        return res.status(500).json({ error: error.message || "Création impossible." });
      }

      return res.json({
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

      if (error || !data || !verifyPassword(password, data.password_hash)) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect." });
      }

      return res.json({
        ok: true,
        customer: {
          firstName: data.first_name,
          lastName: data.last_name || "",
          email: data.email,
        },
      });
    }

    return res.status(400).json({ error: "Action invalide." });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erreur serveur." });
  }
});

export default router;
