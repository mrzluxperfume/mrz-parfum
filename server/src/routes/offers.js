import { Router } from "express";
import { checkoutLines } from "../../../client/netlify/functions/offer-logic.mjs";
import {
  activeOffers,
  readOffers,
  writeOffers,
} from "../../../client/netlify/functions/offer-store.mjs";

const router = Router();

function isAdmin(req) {
  const provided = String(req.headers["x-mrz-admin"] || "");
  const expected = (
    process.env.ADMIN_API_KEY ||
    process.env.VITE_ADMIN_PASS ||
    ""
  ).trim();
  return Boolean(expected && provided && provided === expected);
}

function publicOffer(offer) {
  return {
    id: offer.id,
    type: offer.type,
    value: offer.value,
    productIds: offer.productIds,
  };
}

router.post("/preview", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const offers = activeOffers(await readOffers());
    if (!items.length) return res.json({ discount: 0, total: 0 });
    const { offerCents, lineItems } = checkoutLines(items, offers);
    const totalCents = lineItems.reduce(
      (sum, line) => sum + line.price_data.unit_amount * line.quantity,
      0,
    );
    return res.json({ discount: offerCents / 100, total: totalCents / 100 });
  } catch (err) {
    console.error("[offers:preview]", err.message);
    return res.status(400).json({
      error: err.message === "Article invalide"
        ? "Un article du panier est invalide."
        : "Impossible de calculer l’offre.",
    });
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
    const offers = activeOffers(await readOffers());
    return res.json({ offers: offers.map(publicOffer) });
  } catch (err) {
    console.error("[offers:list]", err.message);
    return res.status(500).json({ error: "Impossible de charger les offres." });
  }
});

router.post("/", async (req, res) => {
  try {
    const type = req.body?.type === "amount" ? "amount" : "percent";
    const value = Number(req.body?.value);
    const productIds = [
      ...new Set(
        (Array.isArray(req.body?.productIds) ? req.body.productIds : [])
          .map((id) => String(id))
          .filter(Boolean),
      ),
    ];
    if (!productIds.length) {
      return res.status(400).json({ error: "Sélectionnez au moins un produit." });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Indiquez une réduction supérieure à 0." });
    }
    if (type === "percent" && value > 100) {
      return res.status(400).json({ error: "Le pourcentage ne peut pas dépasser 100." });
    }
    const offer = {
      id: crypto.randomUUID(),
      type,
      value,
      productIds,
      active: true,
    };
    const offers = await readOffers();
    await writeOffers([offer, ...offers]);
    return res.json({ offer: publicOffer(offer) });
  } catch (err) {
    console.error("[offers:create]", err.message);
    return res.status(500).json({ error: "Impossible d’enregistrer cette offre." });
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = String(req.query.id || "");
    const offers = await readOffers();
    const next = offers.filter((offer) => offer.id !== id);
    if (next.length === offers.length) {
      return res.status(404).json({ error: "Offre introuvable." });
    }
    await writeOffers(next);
    return res.json({ id });
  } catch (err) {
    console.error("[offers:delete]", err.message);
    return res.status(500).json({ error: "Impossible de supprimer cette offre." });
  }
});

export default router;
