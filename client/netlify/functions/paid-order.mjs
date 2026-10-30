export function paidOrderFromSession(session, orderNumber) {
  if (session?.mode !== "payment" || session.payment_status !== "paid") {
    throw new Error("Session Stripe non payée");
  }
  if (!/^MR\d{5}$/.test(String(orderNumber || ""))) {
    throw new Error("Numéro de commande invalide");
  }

  const lineItems = session.line_items?.data || [];
  if (!lineItems.length) {
    throw new Error("La session Stripe ne contient aucun article");
  }

  const items = lineItems.map((line) => {
    const quantity = Number(line.quantity) || 1;
    const unitPrice = (Number(line.price?.unit_amount) || 0) / 100;
    const lineTotal =
      line.amount_total == null
        ? unitPrice * quantity
        : Number(line.amount_total) / 100;
    return {
      productId: line.price?.product?.id || line.price?.product || line.id,
      name: line.description || "Parfum",
      image: "",
      volume: "",
      unitPrice,
      quantity,
      lineTotal,
    };
  });

  return {
    id: orderNumber,
    status: "new",
    customer: {
      name: session.metadata?.name || session.customer_details?.name || "",
      email: session.customer_details?.email || session.customer_email || "",
      phone: session.metadata?.phone || "",
      address: session.metadata?.address || "",
      newsletterOptIn: session.metadata?.newsletter_opt_in === "true",
    },
    note: session.metadata?.note || "",
    items,
    total: (Number(session.amount_total) || 0) / 100,
  };
}

export async function persistPaidOrder(supabase, session, orderNumber) {
  if (!supabase) throw new Error("Supabase indisponible pour enregistrer la commande");

  const order = paidOrderFromSession(session, orderNumber);
  const { error } = await supabase
    .from("orders")
    .upsert(
      {
        ...order,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (error) throw error;

  return order;
}
