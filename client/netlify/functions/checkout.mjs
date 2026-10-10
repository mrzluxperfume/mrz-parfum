import { json, preflight, readJson } from "./http.mjs";
import { clientUrl, mrzLogoFile, stripeClient } from "./stripe-session.mjs";
import { discountFromCoupon, findPromotion } from "./coupon-stripe.mjs";
import { checkoutLines } from "./offer-logic.mjs";
import { activeOffers, readOffers } from "./offer-store.mjs";

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  try {
    const stripe = stripeClient();
    const body = readJson(event);
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};
    const name = String(customer.name || "").trim().slice(0, 120);
    const email = String(customer.email || "").trim().slice(0, 160);
    const phone = String(customer.phone || "").trim().slice(0, 40);
    const address = String(customer.address || "").trim().slice(0, 300);
    const note = String(body.note || "").trim().slice(0, 300);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { error: "Nom et email sont requis." });
    }
    if (!items.length) {
      return json(400, { error: "Le panier est vide." });
    }

    const offers = activeOffers(await readOffers());
    const { lineItems } = checkoutLines(items, offers);

    const subtotalCents = lineItems.reduce(
      (sum, line) => sum + line.price_data.unit_amount * line.quantity,
      0,
    );
    let discounts;
    let couponCode = "";
    const requestedCode = String(body.couponCode || "").trim();
    if (requestedCode) {
      const promo = await findPromotion(stripe, requestedCode);
      if (!promo) {
        return json(400, { error: "Ce coupon n’est pas valide." });
      }
      const applied = discountFromCoupon(subtotalCents, promo.coupon);
      if (applied.error) return json(400, { error: applied.error });
      discounts = [{ promotion_code: promo.id }];
      couponCode = promo.code;
    }

    const logo = await mrzLogoFile(stripe).catch((err) => {
      console.error("[checkout] logo", err.message);
      return null;
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      adaptive_pricing: { enabled: false },
      customer_email: email,
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
      success_url: `${clientUrl()}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl()}/cart?payment=cancel`,
      metadata: { name, phone, address, note, coupon: couponCode },
      branding_settings: {
        display_name: "MRZ Perfume",
        button_color: "#23372d",
        background_color: "#f6f6f7",
        border_style: "rectangular",
        ...(logo ? { logo: { type: "file", file: logo } } : {}),
      },
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error("[checkout]", err.message);
    return json(err.status || 500, {
      error: err.message === "Article invalide"
        ? "Un article du panier est invalide."
        : "Le paiement n'a pas pu démarrer.",
    });
  }
}
