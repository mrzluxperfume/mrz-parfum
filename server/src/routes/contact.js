import { Router } from "express";
import { sendContactEmail } from "../mailer.js";

const router = Router();

const hits = new Map();

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

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post("/", async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || "").trim().slice(0, 80);
    const lastName = String(req.body?.lastName || "").trim().slice(0, 80);
    const email = String(req.body?.email || "").trim().slice(0, 160);
    const message = String(req.body?.message || "").trim().slice(0, 4000);
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Visiteur";

    if (!isEmail(email) || message.length < 2) {
      return res.status(400).json({
        error: "Merci d'indiquer un email valide et un message.",
      });
    }

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: "Trop de messages. Réessayez dans quelques minutes.",
      });
    }

    await sendContactEmail({ name, email, message });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err.message);
    const missing = /Variable manquante/.test(err.message);
    return res.status(500).json({
      error: missing
        ? "L'envoi d'email n'est pas encore configuré (compte Gmail manquant)."
        : "L'envoi du message a échoué. Réessayez dans un instant.",
    });
  }
});

export default router;
