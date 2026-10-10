import { Router } from "express";
import Stripe from "stripe";
import {
  discountFromCoupon,
  findPromotion,
  normalizeCode,
  publicCoupon,
  removePromotion,
} from "../../../client/netlify/functions/coupon-stripe.mjs";

const router = Router();

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    const error = new Error("STRIPE_SECRET_KEY manquante");
    error.status = 500;
    throw error;
  }
  return new Stripe(key);
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

function couponObject(promo) {
  if (promo?.coupon && typeof promo.coupon === "object") return promo.coupon;
  if (promo?.promotion?.coupon && typeof promo.promotion.coupon === "object") {
    return promo.promotion.coupon;
  }
  return null;
}

router.post("/preview", async (req, res) => {
  try {
    const stripe = stripeClient();
    const promo = await findPromotion(stripe, req.body?.code);
    if (!promo) {
      return res.status(404).json({ error: "Ce coupon n’est pas valide." });
    }
    const subtotalCents = Math.round(Number(req.body?.subtotal) * 100);
    const applied = discountFromCoupon(subtotalCents, promo.coupon);
    if (applied.error) return res.status(400).json({ error: applied.error });
    return res.json({
      code: promo.code,
      type: applied.type,
      value: applied.value,
      discount: applied.discount,
      total: applied.total,
    });
  } catch (err) {
    console.error("[coupons:preview]", err.message);
    return res.status(500).json({ error: "Impossible de vérifier ce coupon." });
  }
});

router.use((req, res, next) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Accès admin requis." });
  }
  next();
});

router.get("/", async (_req, res) => {
  try {
    const stripe = stripeClient();
    const list = await stripe.promotionCodes.list({
      limit: 100,
      expand: ["data.coupon", "data.promotion.coupon"],
    });
    const coupons = (list.data || [])
      .map((promo) => publicCoupon({ ...promo, coupon: couponObject(promo) }))
      .filter(Boolean);
    return res.json({ coupons });
  } catch (err) {
    console.error("[coupons:list]", err.message);
    return res.status(500).json({ error: "Impossible de charger les coupons." });
  }
});

router.post("/", async (req, res) => {
  try {
    const stripe = stripeClient();
    const code = normalizeCode(req.body?.code);
    const type = req.body?.type === "amount" ? "amount" : "percent";
    const value = Number(req.body?.value);
    if (code.length < 3) {
      return res.status(400).json({
        error: "Le code doit contenir au moins 3 caractères.",
      });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Indiquez une réduction supérieure à 0." });
    }
    if (type === "percent" && value > 100) {
      return res.status(400).json({ error: "Le pourcentage ne peut pas dépasser 100." });
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
    return res.json({ coupon: publicCoupon({ ...promo, coupon }) });
  } catch (err) {
    console.error("[coupons:create]", err.message);
    const message = /already exists/i.test(err.message || "")
      ? "Ce code existe déjà."
      : "Impossible d’enregistrer ce coupon.";
    return res.status(400).json({ error: message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = String(req.query.id || "");
    if (!id.startsWith("promo_")) {
      return res.status(400).json({ error: "Coupon introuvable." });
    }
    const stripe = stripeClient();
    const removedId = await removePromotion(stripe, id);
    return res.json({ id: removedId });
  } catch (err) {
    console.error("[coupons:delete]", err.message);
    return res.status(500).json({ error: "Impossible de supprimer ce coupon." });
  }
});

export default router;
