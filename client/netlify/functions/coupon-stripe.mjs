export function normalizeCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
}

export function describeCoupon(coupon) {
  if (!coupon) return null;
  if (coupon.percent_off != null) {
    return { type: "percent", value: Number(coupon.percent_off) };
  }
  if (coupon.amount_off != null) {
    return { type: "amount", value: Number(coupon.amount_off) / 100 };
  }
  return null;
}

export function discountFromCoupon(subtotalCents, coupon) {
  const info = describeCoupon(coupon);
  if (!info || !Number.isFinite(info.value) || info.value <= 0) {
    return { error: "Ce coupon n’est pas valide." };
  }
  if (coupon.valid === false) {
    return { error: "Ce coupon n’est plus valable." };
  }
  const subtotal = Math.round(Number(subtotalCents) || 0);
  if (subtotal < 50) {
    return { error: "Le panier est trop bas pour appliquer un coupon." };
  }
  const off =
    info.type === "percent"
      ? Math.round(subtotal * (info.value / 100))
      : Math.round(info.value * 100);
  if (off <= 0) {
    return { error: "Ce coupon ne s’applique pas à ce panier." };
  }
  if (subtotal - off < 50) {
    return { error: "La réduction est trop élevée pour ce panier." };
  }
  return {
    type: info.type,
    value: info.value,
    discountCents: off,
    discount: off / 100,
    total: (subtotal - off) / 100,
  };
}

function couponFromPromo(promo) {
  if (promo?.coupon && typeof promo.coupon === "object") return promo.coupon;
  const nested = promo?.promotion?.coupon;
  if (nested && typeof nested === "object") return nested;
  return null;
}

export async function findPromotion(stripe, code) {
  const normalized = normalizeCode(code);
  if (normalized.length < 3) return null;
  const list = await stripe.promotionCodes.list({
    code: normalized,
    active: true,
    limit: 1,
    expand: ["data.coupon", "data.promotion.coupon"],
  });
  const promo = list.data?.[0];
  if (!promo?.active) return null;
  const coupon = couponFromPromo(promo);
  if (!coupon) return null;
  return { ...promo, coupon };
}

export async function removePromotion(stripe, id) {
  const promo = await stripe.promotionCodes.retrieve(id, {
    expand: ["coupon", "promotion.coupon"],
  });
  const coupon = promo.coupon || promo.promotion?.coupon;
  const couponId = typeof coupon === "string" ? coupon : coupon?.id;
  await stripe.promotionCodes.update(id, { active: false });
  if (couponId) {
    await stripe.coupons.del(couponId).catch(() => {});
  }
  return promo.id;
}

export function publicCoupon(promo) {
  const info = describeCoupon(promo.coupon);
  if (!info) return null;
  return {
    id: promo.id,
    code: promo.code,
    active: Boolean(promo.active),
    type: info.type,
    value: info.value,
  };
}
