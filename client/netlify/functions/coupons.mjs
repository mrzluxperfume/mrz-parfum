import { json, preflight, readJson } from "./http.mjs";
import { stripeClient } from "./stripe-session.mjs";
import {
  discountFromCoupon,
  findPromotion,
  normalizeCode,
  publicCoupon,
  removePromotion,
} from "./coupon-stripe.mjs";

function isAdmin(event) {
  const provided = String(
    event.headers["x-mrz-admin"] || event.headers["X-Mrz-Admin"] || "",
  );
  const expected = (
    process.env.ADMIN_API_KEY ||
    process.env.VITE_ADMIN_PASS ||
    ""
  ).trim();
  return Boolean(expected && provided && provided === expected);
}

function stripeError(err, fallback) {
  const message = err?.raw?.message || err?.message || "";
  if (/already exists/i.test(message)) return "Ce code existe déjà.";
  return fallback;
}

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;

  const path = event.path || "";
  const preview = path.endsWith("/preview");

  try {
    const stripe = stripeClient();

    if (preview) {
      if (event.httpMethod !== "POST") {
        return json(405, { error: "Méthode non autorisée." });
      }
      const body = readJson(event);
      const promo = await findPromotion(stripe, body.code);
      if (!promo) return json(404, { error: "Ce coupon n’est pas valide." });
      const subtotalCents = Math.round(Number(body.subtotal) * 100);
      const applied = discountFromCoupon(subtotalCents, promo.coupon);
      if (applied.error) return json(400, { error: applied.error });
      return json(200, {
        code: promo.code,
        type: applied.type,
        value: applied.value,
        discount: applied.discount,
        total: applied.total,
      });
    }

    if (!isAdmin(event)) {
      return json(401, { error: "Accès admin requis." });
    }

    if (event.httpMethod === "GET") {
      const list = await stripe.promotionCodes.list({
        limit: 100,
        expand: ["data.coupon", "data.promotion.coupon"],
      });
      const coupons = (list.data || [])
        .map((promo) => {
          const coupon =
            (promo.coupon && typeof promo.coupon === "object" && promo.coupon) ||
            (promo.promotion?.coupon &&
              typeof promo.promotion.coupon === "object" &&
              promo.promotion.coupon) ||
            null;
          return publicCoupon({ ...promo, coupon });
        })
        .filter(Boolean);
      return json(200, { coupons });
    }

    if (event.httpMethod === "POST") {
      const body = readJson(event);
      const code = normalizeCode(body.code);
      const type = body.type === "amount" ? "amount" : "percent";
      const value = Number(body.value);
      if (code.length < 3) {
        return json(400, { error: "Le code doit contenir au moins 3 caractères." });
      }
      if (!Number.isFinite(value) || value <= 0) {
        return json(400, { error: "Indiquez une réduction supérieure à 0." });
      }
      if (type === "percent" && value > 100) {
        return json(400, { error: "Le pourcentage ne peut pas dépasser 100." });
      }

      const coupon = await stripe.coupons.create({
        duration: "once",
        name: code,
        ...(type === "percent"
          ? { percent_off: value }
          : { amount_off: Math.round(value * 100), currency: "eur" }),
      });
      const promo = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: coupon.id },
        code,
        active: true,
      });
      return json(200, {
        coupon: publicCoupon({
          ...promo,
          coupon,
        }),
      });
    }

    if (event.httpMethod === "DELETE") {
      const id = String(event.queryStringParameters?.id || "");
      if (!id.startsWith("promo_")) {
        return json(400, { error: "Coupon introuvable." });
      }
      const removedId = await removePromotion(stripe, id);
      return json(200, { id: removedId });
    }

    return json(405, { error: "Méthode non autorisée." });
  } catch (err) {
    console.error("[coupons]", err.message);
    const status = err.status || err.statusCode || 500;
    return json(status >= 400 && status < 500 ? status : 500, {
      error: stripeError(err, "Impossible de gérer les coupons pour le moment."),
    });
  }
}
