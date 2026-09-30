import { json, preflight, readJson } from "./http.mjs";
import { stripeClient } from "./stripe-session.mjs";

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  try {
    const stripe = stripeClient();
    const body = readJson(event);
    const sessionId = String(body.sessionId || "");
    if (!sessionId.startsWith("cs_")) {
      return json(400, { error: "Session de paiement invalide." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return json(402, { error: "Le paiement n'est pas encore confirmé." });
    }

    const items = (session.line_items?.data || []).map((line) => ({
      id: line.id,
      name: line.description || "Parfum",
      image: "",
      price: (line.price?.unit_amount || 0) / 100,
      volume: "",
      quantity: line.quantity || 1,
    }));

    return json(200, {
      paid: true,
      sessionId: session.id,
      customer: {
        name: session.metadata?.name || session.customer_details?.name || "",
        email: session.customer_details?.email || session.customer_email || "",
        phone: session.metadata?.phone || "",
        address: session.metadata?.address || "",
      },
      note: session.metadata?.note || "",
      items,
      total: (session.amount_total || 0) / 100,
    });
  } catch (err) {
    console.error("[checkout:confirm]", err.message);
    return json(500, { error: "Impossible de confirmer le paiement." });
  }
}
