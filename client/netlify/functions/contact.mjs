import { sendContactEmail } from "./mail.mjs";
import { json, preflight, readJson } from "./http.mjs";

const hits = new Map();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
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

  try {
    const body = readJson(event);
    const firstName = String(body.firstName || "").trim().slice(0, 80);
    const lastName = String(body.lastName || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().slice(0, 160);
    const message = String(body.message || "").trim().slice(0, 4000);
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Visiteur";

    if (!isEmail(email) || message.length < 2) {
      return json(400, { error: "Merci d'indiquer un email valide et un message." });
    }

    const ip = event.headers["x-nf-client-connection-ip"]
      || event.headers["client-ip"]
      || "unknown";
    if (isRateLimited(ip)) {
      return json(429, { error: "Trop de messages. Réessayez dans quelques minutes." });
    }

    await sendContactEmail({ name, email, message });
    return json(200, { ok: true });
  } catch (err) {
    console.error("[contact]", err.message);
    const missing = /Variable manquante/.test(err.message);
    const auth = /Identifiants Gmail|mot de passe d’application/i.test(err.message);
    return json(500, {
      error: missing
        ? "L'envoi d'email n'est pas encore configuré (SMTP_USER / SMTP_PASS manquants sur Netlify)."
        : auth
          ? "Identifiants email invalides. Vérifiez SMTP_USER et SMTP_PASS sur Netlify (mot de passe d’application Gmail)."
          : "L'envoi du message a échoué. Réessayez dans un instant.",
    });
  }
}
