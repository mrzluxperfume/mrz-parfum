function unitDiscount(unitCents, offer) {
  const value = Number(offer.value);
  if (!Number.isFinite(value) || value <= 0) return 0;
  let off =
    offer.type === "amount"
      ? Math.round(value * 100)
      : Math.round(unitCents * (value / 100));
  if (unitCents - off < 50) off = unitCents - 50;
  return off >= 1 ? off : 0;
}

export function checkoutLines(items, offers = []) {
  const prepared = items.map((item) => {
    const unit = Math.round(Number(item.price) * 100);
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (!item.name || !Number.isFinite(unit) || unit < 50) {
      throw new Error("Article invalide");
    }
    return { ...item, unit, quantity };
  });

  const units = [];
  prepared.forEach((item, itemIndex) => {
    for (let i = 0; i < item.quantity; i += 1) {
      units.push({ itemIndex, unit: item.unit, full: item.unit, used: false });
    }
  });

  let offerCents = 0;
  for (const offer of offers) {
    if (offer.active === false) continue;
    const ids = new Set((offer.productIds || []).map((id) => String(id)));
    const eligible = [];
    units.forEach((unit, index) => {
      if (unit.used) return;
      if (!ids.has(String(prepared[unit.itemIndex].id))) return;
      eligible.push(index);
    });
    if (eligible.length < 2) continue;
    eligible.sort((a, b) => units[a].unit - units[b].unit || a - b);
    const index = eligible[0];
    const off = unitDiscount(units[index].unit, offer);
    if (off <= 0) continue;
    units[index].unit -= off;
    units[index].used = true;
    offerCents += off;
  }

  const groups = new Map();
  for (const unit of units) {
    const key = `${unit.itemIndex}:${unit.unit}`;
    const row = groups.get(key) || {
      item: prepared[unit.itemIndex],
      unit: unit.unit,
      full: unit.full,
      quantity: 0,
    };
    row.quantity += 1;
    groups.set(key, row);
  }

  const lineItems = [...groups.values()].map((row) => {
    const label = row.item.volume
      ? `${row.item.name} — ${row.item.volume}`
      : String(row.item.name);
    return {
      quantity: row.quantity,
      price_data: {
        currency: "eur",
        unit_amount: row.unit,
        product_data: {
          name: row.unit < row.full ? `${label} (offre 2e produit)` : label,
          description: "Paiement sécurisé de votre commande MRZ.",
        },
      },
    };
  });

  return { lineItems, offerCents };
}
