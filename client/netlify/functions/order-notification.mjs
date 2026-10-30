import { json, preflight, readJson } from "./http.mjs";
import { sendOrderNotificationFromDB, sendCustomerOrderConfirmationFromDB } from "./mail.mjs";

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  try {
    const body = readJson(event);
    const { order_id, customer, items, total, note, created_at } = body;

    // Validation
    if (!order_id || !/^MR\d{5}$/.test(order_id)) {
      return json(400, { error: "Numéro de commande invalide." });
    }

    if (!customer?.email || !customer?.name) {
      return json(400, { error: "Informations client manquantes." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return json(400, { error: "Panier vide." });
    }

    console.log(`[order-notification] Processing order ${order_id} for ${customer.email}`);

    const orderData = {
      orderNumber: order_id,
      customer,
      items,
      total,
      note: note || '',
      createdAt: created_at,
    };

    // Envoyer les deux emails en parallèle
    const results = await Promise.allSettled([
      sendOrderNotificationFromDB(orderData),
      sendCustomerOrderConfirmationFromDB(orderData),
    ]);

    const merchantResult = results[0];
    const customerResult = results[1];

    const response = {
      order_id,
      merchant_notified: merchantResult.status === 'fulfilled',
      customer_notified: customerResult.status === 'fulfilled',
    };

    if (merchantResult.status === 'rejected') {
      console.error('[order-notification] Merchant email failed:', merchantResult.reason);
      response.merchant_error = merchantResult.reason?.message || String(merchantResult.reason);
    }

    if (customerResult.status === 'rejected') {
      console.error('[order-notification] Customer email failed:', customerResult.reason);
      response.customer_error = customerResult.reason?.message || String(customerResult.reason);
    }

    // On retourne 200 même si un email échoue, pour ne pas bloquer le trigger
    return json(200, response);
  } catch (err) {
    console.error("[order-notification]", err.message);
    return json(500, {
      error: err.message || "Impossible de traiter la notification.",
    });
  }
}
