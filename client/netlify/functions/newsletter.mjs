import { createClient } from "@supabase/supabase-js";
import { json, preflight, readJson } from "./http.mjs";
import { sendNewsletterEmail } from "./mail.mjs";

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAdmin(event) {
  const provided =
    event.headers["x-mrz-admin"] ||
    event.headers["X-Mrz-Admin"] ||
    "";
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

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;

  if (!isAdmin(event)) {
    return json(401, { error: "Accès admin requis." });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return json(503, {
      error:
        "Supabase indisponible. Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    if (event.httpMethod === "GET") {
      const { data, error } = await supabase
        .from("customers")
        .select("email, first_name, last_name, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        return json(500, { error: error.message || "Lecture clients impossible." });
      }

      const customers = (data || []).map((row) => ({
        email: row.email,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        createdAt: row.created_at,
      }));

      return json(200, { ok: true, customers, count: customers.length });
    }

    if (event.httpMethod === "POST") {
      const body = readJson(event);
      const subject = String(body.subject || "").trim();
      const title = String(body.title || "").trim();
      const message = String(body.message || "").trim();
      const discountCode = String(body.discountCode || "").trim().slice(0, 40);
      const discountLabel = String(body.discountLabel || "").trim().slice(0, 120);
      const ctaLabel = String(body.ctaLabel || "Découvrir la collection").trim();
      const ctaUrl = String(body.ctaUrl || "").trim();
      const emails = Array.isArray(body.emails)
        ? body.emails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean)
        : [];

      if (!subject || !title || message.length < 2) {
        return json(400, {
          error: "Indiquez un objet, un titre et un message.",
        });
      }

      let recipients = [];
      if (emails.length) {
        const { data, error } = await supabase
          .from("customers")
          .select("email, first_name")
          .in("email", emails);
        if (error) {
          return json(500, { error: error.message || "Lecture destinataires impossible." });
        }
        recipients = data || [];
      } else {
        const { data, error } = await supabase
          .from("customers")
          .select("email, first_name");
        if (error) {
          return json(500, { error: error.message || "Lecture destinataires impossible." });
        }
        recipients = data || [];
      }

      if (!recipients.length) {
        return json(400, { error: "Aucun destinataire sélectionné." });
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
            results.errors.push(
              `${recipient.email}: ${err.message || "échec"}`,
            );
          }
        }
      }

      return json(200, {
        ok: results.failed === 0,
        ...results,
        total: recipients.length,
      });
    }

    return json(405, { error: "Méthode non autorisée." });
  } catch (err) {
    console.error("[newsletter]", err.message);
    return json(500, { error: err.message || "Erreur serveur." });
  }
}
