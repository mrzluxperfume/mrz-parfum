import { json, preflight, readJson } from "./http.mjs";
import { sendAdminOrderConfirmation } from "./mail.mjs";

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  try {
    const body = readJson(event);
    const { orderNumber, customer, items, total, note } = body;

    if (!orderNumber || !customer?.email) {
      return json(400, { error: "Données de commande manquantes." });
    }

    await sendAdminOrderConfirmation({
      orderNumber,
      customer,
      items: items || [],
      total: total || 0,
      note: note || "",
    });

    return json(200, { success: true, message: "Email envoyé au client." });
  } catch (err) {
    console.error("[admin-send-confirmation]", err.message);
    return json(500, {
      error: err.message || "Impossible d'envoyer l'email de confirmation.",
    });
  }
}
