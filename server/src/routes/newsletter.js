import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { sendNewsletterEmail } from "../../../client/netlify/functions/mail.mjs";
import { listNewsletterAudience } from "../../../client/netlify/functions/newsletter-audience.mjs";

const router = Router();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAdmin(req) {
  const provided = String(req.headers["x-mrz-admin"] || "");
  const expected = (
    process.env.ADMIN_API_KEY ||
    process.env.VITE_ADMIN_PASS ||
    ""
  ).trim();
  return Boolean(expected && provided && provided === expected);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.use((req, res, next) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Accès admin requis." });
  }
  next();
});

router.get("/", async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({
      error:
        "Supabase indisponible. Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const customers = await listNewsletterAudience(supabase);
    return res.json({ ok: true, customers, count: customers.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Lecture clients impossible." });
  }
});

router.post("/", async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({
      error:
        "Supabase indisponible. Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const subject = String(req.body.subject || "").trim();
  const title = String(req.body.title || "").trim();
  const message = String(req.body.message || "").trim();
  const discountCode = String(req.body.discountCode || "").trim().slice(0, 40);
  const discountLabel = String(req.body.discountLabel || "").trim().slice(0, 120);
  const ctaLabel = String(req.body.ctaLabel || "Découvrir la collection").trim();
  const ctaUrl = String(req.body.ctaUrl || "").trim();
  const emails = Array.isArray(req.body.emails)
    ? req.body.emails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean)
    : [];

  if (!subject || !title || message.length < 2) {
    return res.status(400).json({
      error: "Indiquez un objet, un titre et un message.",
    });
  }

  let audience;
  try {
    audience = await listNewsletterAudience(supabase);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Lecture destinataires impossible." });
  }
  const selectedEmails = new Set(emails);
  const recipients = audience
    .filter((contact) => contact.newsletterConsent)
    .filter((contact) => !emails.length || selectedEmails.has(contact.email))
    .map((contact) => ({ email: contact.email, first_name: contact.firstName }));

  if (!recipients.length) {
    return res.status(400).json({ error: "Aucun destinataire sélectionné." });
  }

  const results = { sent: 0, failed: 0, errors: [] };
  for (const recipient of recipients) {
    try {
      await sendNewsletterEmail({
        to: recipient.email,
        firstName: recipient.first_name || "",
        subject,
        title,
        message,
        discountCode,
        discountLabel,
        ctaLabel,
        ctaUrl,
      });
      results.sent += 1;
      await sleep(350);
    } catch (err) {
      results.failed += 1;
      if (results.errors.length < 5) {
        results.errors.push(`${recipient.email}: ${err.message || "échec"}`);
      }
    }
  }

  return res.json({
    ok: results.failed === 0,
    ...results,
    total: recipients.length,
  });
});

export default router;
