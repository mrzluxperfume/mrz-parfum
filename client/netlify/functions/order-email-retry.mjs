import { createClient } from "@supabase/supabase-js";
import { deliverOrderEmails } from "./order-email-delivery.mjs";
import { json, preflight, readJson } from "./http.mjs";
import { stripeClient } from "./stripe-session.mjs";

/**
 * Manual / diagnostic retry for site order emails (merchant + customer).
 * POST { sessionId: "cs_..." }
 * Resets failed/stuck lanes then re-runs delivery.
 */
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration Supabase manquante");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  try {
    const body = readJson(event);
    const sessionId = String(body.sessionId || "").trim();
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return json(400, { error: "sessionId Stripe invalide." });
    }

    const stripe = stripeClient();
    const supabase = getSupabase();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      return json(402, { error: "Le paiement n'est pas confirmé." });
    }

    const { data: registry } = await supabase
      .from("order_number_registry")
      .select("order_number")
      .eq("checkout_session_id", sessionId)
      .maybeSingle();

    const orderNumber =
      registry?.order_number || session.metadata?.order_number || "";
    if (!/^MR\d{5}$/.test(String(orderNumber))) {
      return json(409, {
        error:
          "Numéro de commande introuvable pour cette session. Vérifiez order_number_registry.",
      });
    }

    // Force-reset lanes so a stuck "processing" or previous failure can retry.
    await supabase.from("stripe_order_email_deliveries").upsert(
      {
        checkout_session_id: sessionId,
        merchant_email_status: "pending",
        customer_email_status: "pending",
        merchant_email_error: null,
        customer_email_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "checkout_session_id" },
    );

    const emailSession = {
      ...session,
      metadata: { ...session.metadata, order_number: orderNumber },
    };

    await deliverOrderEmails(
      supabase,
      emailSession,
      session.line_items?.data || [],
    );

    const { data: delivery } = await supabase
      .from("stripe_order_email_deliveries")
      .select(
        "merchant_email_status, customer_email_status, merchant_email_error, customer_email_error",
      )
      .eq("checkout_session_id", sessionId)
      .maybeSingle();

    return json(200, {
      ok: true,
      sessionId,
      orderNumber,
      delivery,
    });
  } catch (err) {
    console.error("[order-email-retry]", err.message);
    return json(500, {
      error: err.message || "Renvoi des emails impossible.",
      smtpConfigured: Boolean(
        process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
      ),
    });
  }
}
