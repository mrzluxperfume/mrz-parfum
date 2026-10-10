import { json, preflight, readJson } from "./http.mjs";
import { checkoutLines } from "./offer-logic.mjs";
import { activeOffers, readOffers, writeOffers } from "./offer-store.mjs";

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

function publicOffer(offer) {
  return {
    id: offer.id,
    type: offer.type,
    value: offer.value,
    productIds: offer.productIds,
  };
}

export async function handler(event) {
  const early = preflight(event);
  if (early) return early;

  const path = event.path || "";
  const preview = path.endsWith("/preview");

  try {
    if (preview) {
      if (event.httpMethod !== "POST") {
        return json(405, { error: "Méthode non autorisée." });
      }
      const body = readJson(event);
      const items = Array.isArray(body.items) ? body.items : [];
      const offers = activeOffers(await readOffers());
      if (!items.length) return json(200, { discount: 0, total: 0 });
      const { offerCents, lineItems } = checkoutLines(items, offers);
      const totalCents = lineItems.reduce(
        (sum, line) => sum + line.price_data.unit_amount * line.quantity,
        0,
      );
      return json(200, {
        discount: offerCents / 100,
        total: totalCents / 100,
      });
    }

    if (!isAdmin(event)) {
      return json(401, { error: "Accès admin requis." });
    }

    const offers = await readOffers();

    if (event.httpMethod === "GET") {
      return json(200, {
        offers: activeOffers(offers).map(publicOffer),
      });
    }

    if (event.httpMethod === "POST") {
      const body = readJson(event);
      const type = body.type === "amount" ? "amount" : "percent";
      const value = Number(body.value);
      const productIds = [
        ...new Set(
          (Array.isArray(body.productIds) ? body.productIds : [])
            .map((id) => String(id))
            .filter(Boolean),
        ),
      ];
      if (!productIds.length) {
        return json(400, { error: "Sélectionnez au moins un produit." });
      }
      if (!Number.isFinite(value) || value <= 0) {
        return json(400, { error: "Indiquez une réduction supérieure à 0." });
      }
      if (type === "percent" && value > 100) {
        return json(400, { error: "Le pourcentage ne peut pas dépasser 100." });
      }
      const offer = {
        id: crypto.randomUUID(),
        type,
        value,
        productIds,
        active: true,
      };
      await writeOffers([offer, ...offers]);
      return json(200, { offer: publicOffer(offer) });
    }

    if (event.httpMethod === "DELETE") {
      const id = String(event.queryStringParameters?.id || "");
      const next = offers.filter((offer) => offer.id !== id);
      if (next.length === offers.length) {
        return json(404, { error: "Offre introuvable." });
      }
      await writeOffers(next);
      return json(200, { id });
    }

    return json(405, { error: "Méthode non autorisée." });
  } catch (err) {
    console.error("[offers]", err.message);
    return json(err.status || 500, {
      error: err.message === "Article invalide"
        ? "Un article du panier est invalide."
        : "Impossible de gérer les offres pour le moment.",
    });
  }
}
