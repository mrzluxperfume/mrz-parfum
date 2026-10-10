import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import {
  discountFromCoupon,
  findPromotion,
} from "../../../client/netlify/functions/coupon-stripe.mjs";
import { checkoutLines } from "../../../client/netlify/functions/offer-logic.mjs";
import {
  activeOffers,
  readOffers,
} from "../../../client/netlify/functions/offer-store.mjs";

const router = Router();
const logoPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../client/public/mrz-nav-logo.png",
);

// Wordmark used on Checkout must match the navbar "MRZ".
let logoFileId = null;

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    const error = new Error("STRIPE_SECRET_KEY manquante");
    error.status = 500;
    throw error;
  }
  return new Stripe(key);
}

async function mrzLogoFile(stripe) {
  if (logoFileId) return logoFileId;
  if (!fs.existsSync(logoPath)) return null;
  const uploaded = await stripe.files.create({
    purpose: "business_logo",
    file: {
      data: fs.readFileSync(logoPath),
      name: "mrz-nav-logo.png",
      type: "image/png",
    },
  });
  logoFileId = uploaded.id;
  return logoFileId;
}

function clientUrl() {
  return (process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")[0]
    .trim();
}

router.post("/", async (req, res) => {
  try {
    const stripe = stripeClient();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const customer = req.body?.customer || {};
    const name = String(customer.name || "").trim().slice(0, 120);
    const email = String(customer.email || "").trim().slice(0, 160);
    const phone = String(customer.phone || "").trim().slice(0, 40);
    const address = String(customer.address || "").trim().slice(0, 300);
    const note = String(req.body?.note || "").trim().slice(0, 300);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Nom et email sont requis." });
    }
    if (!items.length) {
      return res.status(400).json({ error: "Le panier est vide." });
    }

    const offers = activeOffers(await readOffers());
    const { lineItems } = checkoutLines(items, offers);

    const subtotalCents = lineItems.reduce(
      (sum, line) => sum + line.price_data.unit_amount * line.quantity,
      0,
    );
    let discounts;
    let couponCode = "";
    const requestedCode = String(req.body?.couponCode || "").trim();
    if (requestedCode) {
      const promo = await findPromotion(stripe, requestedCode);
      if (!promo) {
        return res.status(400).json({ error: "Ce coupon n’est pas valide." });
      }
      const applied = discountFromCoupon(subtotalCents, promo.coupon);
      if (applied.error) return res.status(400).json({ error: applied.error });
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

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err.message);
    return res.status(err.status || 500).json({
      error: err.message === "Article invalide"
        ? "Un article du panier est invalide."
        : "Le paiement n'a pas pu démarrer.",
    });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const stripe = stripeClient();
    const sessionId = String(req.body?.sessionId || "");
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Session de paiement invalide." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Le paiement n'est pas encore confirmé." });
    }

    const items = (session.line_items?.data || []).map((line) => ({
      id: line.id,
      name: line.description || "Parfum",
      image: "",
      price: (line.price?.unit_amount || 0) / 100,
      volume: "",
      quantity: line.quantity || 1,
    }));

    return res.json({
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
    return res.status(500).json({ error: "Impossible de confirmer le paiement." });
  }
});

export default router;
