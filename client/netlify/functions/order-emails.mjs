import nodemailer from "nodemailer";

const ORDER_NOTIFICATION_EMAIL = "mrz.lux.perfume@gmail.com";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable manquante : ${name}`);
  return value;
}

function createTransport() {
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    user,
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

function mapSmtpError(err) {
  const code = err?.code || err?.responseCode || "";
  const msg = String(err?.message || err);
  console.error("[order-emails]", code, msg);
  if (
    code === "EAUTH" ||
    /Invalid login|Username and Password not accepted|BadCredentials/i.test(msg)
  ) {
    return new Error(
      "Identifiants Gmail invalides. Vérifiez SMTP_USER et SMTP_PASS (mot de passe d’application) sur Netlify.",
    );
  }
  if (
    code === "EENVELOPE" ||
    /ENOTFOUND|ECONNECTION|ETIMEDOUT/i.test(String(code))
  ) {
    return new Error("Connexion SMTP impossible. Vérifiez SMTP_HOST / SMTP_PORT.");
  }
  return new Error(msg);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function requiredOrderNumber(session) {
  const orderNumber = String(session?.metadata?.order_number || "").trim();
  if (!/^MR\d{5}$/.test(orderNumber)) {
    throw new Error("Numéro de commande manquant ou invalide");
  }
  return orderNumber;
}

function merchantInbox(smtpUser) {
  return process.env.MAIL_TO?.trim() || ORDER_NOTIFICATION_EMAIL || smtpUser;
}

function siteBaseUrl() {
  return (process.env.CLIENT_URL || "https://mrz-perfume.fr").replace(/\/$/, "");
}

function formatOrderMoney(amountCents, currency = "eur") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: String(currency || "eur").toUpperCase(),
  }).format((Number(amountCents) || 0) / 100);
}

function paymentIntentId(session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || "";
}

function orderDateLabel(session) {
  const created = Number(session?.created) || Math.floor(Date.now() / 1000);
  return new Date(created * 1000).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function shippingAddressParts(session) {
  const metadata = session.metadata || {};
  const details =
    session.customer_details?.address || session.shipping_details?.address || {};
  const line1 = [details.line1, details.line2].filter(Boolean).join(", ");
  return {
    name:
      metadata.name ||
      session.customer_details?.name ||
      session.shipping_details?.name ||
      "",
    email: session.customer_details?.email || session.customer_email || "",
    phone: metadata.phone || session.customer_details?.phone || "",
    address: metadata.address || line1 || "",
    city: details.city || metadata.city || "",
    postalCode: details.postal_code || metadata.postal_code || "",
    country: details.country || metadata.country || "",
  };
}

function lineItemImage(item) {
  const product = item?.price?.product;
  if (product && typeof product === "object") {
    const image = String(product.images?.[0] || "").trim();
    if (/^https:\/\//i.test(image) && !/mrz-perfume\.com/i.test(image)) {
      return image;
    }
  }
  return "";
}

function buildOrderLineRows(lineItems, currency) {
  return (lineItems || []).map((item) => {
    const name = item.description || "Article MRZ Perfume";
    const quantity = Number(item.quantity) || 1;
    const unitCents =
      item.price?.unit_amount ??
      Math.round((Number(item.amount_subtotal) || 0) / quantity);
    const lineTotalCents = item.amount_total ?? unitCents * quantity;
    const image = lineItemImage(item);
    const unit = formatOrderMoney(unitCents, currency);
    const lineTotal = formatOrderMoney(lineTotalCents, currency);
    return {
      text: `${quantity} × ${name} — ${unit} / u. — ${lineTotal}`,
      html: `<tr>
        <td style="padding:12px 8px;border-bottom:1px solid #eee8e0;vertical-align:top;">
          <table role="presentation" cellspacing="0" cellpadding="0"><tr>
            ${
              image
                ? `<td style="padding-right:12px;"><img src="${escapeHtml(image)}" alt="" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border:1px solid #eee8e0;background:#f7f5f2;" /></td>`
                : ""
            }
            <td style="font-size:14px;color:#1a1a1a;">${escapeHtml(name)}<br /><span style="font-size:12px;color:#7a7268;">Prix unitaire : ${escapeHtml(unit)}</span></td>
          </tr></table>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee8e0;text-align:center;vertical-align:top;">${quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee8e0;text-align:right;vertical-align:top;">${escapeHtml(lineTotal)}</td>
      </tr>`,
    };
  });
}

function orderEmailShell({ title, bodyHtml, ctaLabel, ctaUrl }) {
  const site = siteBaseUrl();
  const logoUrl = `${site}/mrz-logo-footer.jpeg`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f2;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e8e2da;">
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid #eee8e0;text-align:center;">
              <img src="${escapeHtml(logoUrl)}" alt="MRZ Perfume" width="72" height="72" style="display:block;margin:0 auto;width:72px;height:72px;border-radius:50%;object-fit:cover;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">${bodyHtml}</td>
          </tr>
          ${
            ctaLabel && ctaUrl
              ? `<tr>
            <td style="padding:8px 28px 32px;text-align:center;">
              <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#1f3d2f;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(ctaLabel)}</a>
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:22px 28px;background:#1a1a1a;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#d9d2c8;">MRZ Perfume</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9a9288;">
                61 rue Racine, 69100 Villeurbanne<br />
                <a href="${site}" style="color:#d9d2c8;text-decoration:none;">mrz-perfume.fr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Email 3 — notification boutique après paiement webhook. */
export async function sendOrderNotification({ session, lineItems }) {
  const orderReference = requiredOrderNumber(session);
  const { user, transport } = createTransport();
  const to = merchantInbox(user);
  const metadata = session.metadata || {};
  const currency = String(session.currency || "eur").toUpperCase();
  const customer = shippingAddressParts(session);
  const rows = buildOrderLineRows(lineItems, currency);
  const subtotal = formatOrderMoney(
    session.amount_subtotal ?? session.amount_total,
    currency,
  );
  const shippingCents =
    session.total_details?.amount_shipping ??
    session.shipping_cost?.amount_total ??
    0;
  const shipping = formatOrderMoney(shippingCents, currency);
  const total = formatOrderMoney(session.amount_total, currency);
  const paymentIntent = paymentIntentId(session);
  const paymentUrl = paymentIntent
    ? `https://dashboard.stripe.com/${session.livemode ? "" : "test/"}payments/${encodeURIComponent(paymentIntent)}`
    : "";
  const adminUrl = `${siteBaseUrl()}/admin/orders?order=${encodeURIComponent(orderReference)}`;
  const cityLine = [customer.postalCode, customer.city].filter(Boolean).join(" ");
  const locationLine = [cityLine, customer.country].filter(Boolean).join(", ");

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-weight:normal;color:#1a1a1a;">Nouvelle commande reçue</h1>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3d3d3d;">Une commande vient d’être payée avec succès sur le site.</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#1a1a1a;">
      <strong>Numéro de commande :</strong> ${escapeHtml(orderReference)}<br />
      <strong>Date :</strong> ${escapeHtml(orderDateLabel(session))}<br />
      <strong>Statut du paiement :</strong> Confirmé<br />
      <strong>Référence Stripe :</strong> ${escapeHtml(paymentIntent || session.id)}
    </p>
    <h2 style="margin:0 0 10px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7268;">Client</h2>
    <p style="margin:0 0 22px;font-size:14px;line-height:1.7;color:#1a1a1a;">
      <strong>Nom :</strong> ${escapeHtml(customer.name || "Non renseigné")}<br />
      <strong>Email :</strong> ${escapeHtml(customer.email || "Non renseigné")}<br />
      <strong>Téléphone :</strong> ${escapeHtml(customer.phone || "Non renseigné")}<br />
      <strong>Adresse :</strong> ${escapeHtml(customer.address || "Non renseignée")}<br />
      ${locationLine ? `<strong>Ville / CP / Pays :</strong> ${escapeHtml(locationLine)}<br />` : ""}
      ${metadata.note ? `<strong>Note :</strong> ${escapeHtml(metadata.note)}` : ""}
    </p>
    <h2 style="margin:0 0 10px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7268;">Articles</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 18px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Produit</th>
          <th style="text-align:center;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Qté</th>
          <th style="text-align:right;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${rows.map((row) => row.html).join("")}</tbody>
    </table>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#1a1a1a;text-align:right;">
      Sous-total : ${escapeHtml(subtotal)}<br />
      Livraison : ${escapeHtml(shipping)}<br />
      ${metadata.coupon ? `Coupon : ${escapeHtml(metadata.coupon)}<br />` : ""}
      <strong style="font-size:18px;">Total payé : ${escapeHtml(total)}</strong>
    </p>
    ${paymentUrl ? `<p style="margin:18px 0 0;font-size:13px;"><a href="${escapeHtml(paymentUrl)}" style="color:#1f3d2f;">Voir le paiement dans Stripe</a></p>` : ""}
  `;

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: customer.email || undefined,
      subject: `Nouvelle commande reçue — #${orderReference}`.slice(0, 180),
      text: [
        "Nouvelle commande reçue",
        "",
        `Numéro : ${orderReference}`,
        `Date : ${orderDateLabel(session)}`,
        "Statut du paiement : Confirmé",
        `Référence Stripe : ${paymentIntent || session.id}`,
        "",
        `Client : ${customer.name || "Non renseigné"}`,
        `Email : ${customer.email || "Non renseigné"}`,
        `Téléphone : ${customer.phone || "Non renseigné"}`,
        `Adresse : ${customer.address || "Non renseignée"}`,
        locationLine ? `Ville / CP / Pays : ${locationLine}` : "",
        "",
        "Articles :",
        ...rows.map((row) => row.text),
        "",
        `Sous-total : ${subtotal}`,
        `Livraison : ${shipping}`,
        `Total payé : ${total}`,
        metadata.coupon ? `Coupon : ${metadata.coupon}` : "",
        metadata.note ? `Note : ${metadata.note}` : "",
        "",
        `Voir la commande : ${adminUrl}`,
        paymentUrl ? `Stripe : ${paymentUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      html: orderEmailShell({
        title: `Nouvelle commande reçue — #${orderReference}`,
        bodyHtml,
        ctaLabel: "Voir la commande",
        ctaUrl: adminUrl,
      }),
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

/** Email 4 — confirmation client après paiement webhook. */
export async function sendCustomerOrderConfirmation({ session, lineItems }) {
  const reference = requiredOrderNumber(session);
  const { user, transport } = createTransport();
  const metadata = session.metadata || {};
  const customer = shippingAddressParts(session);
  const to = customer.email;
  if (!to) throw new Error("Email client manquant dans la session Stripe");

  const currency = String(session.currency || "eur").toUpperCase();
  const rows = buildOrderLineRows(lineItems, currency);
  const total = formatOrderMoney(session.amount_total, currency);
  const firstName = String(customer.name || "")
    .trim()
    .split(/\s+/)[0];
  const hello = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const accountUrl = `${siteBaseUrl()}/account`;
  const cityLine = [customer.postalCode, customer.city].filter(Boolean).join(" ");
  const locationLine = [cityLine, customer.country].filter(Boolean).join(", ");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3d3d3d;">${escapeHtml(hello)}</p>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:28px;font-weight:normal;color:#1a1a1a;">Votre commande est confirmée</h1>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#3d3d3d;">
      Merci pour votre confiance. Votre paiement a bien été reçu et votre commande est désormais confirmée.
    </p>
    <p style="margin:0 0 22px;font-size:14px;line-height:1.7;color:#1a1a1a;">
      <strong>Numéro de commande :</strong> ${escapeHtml(reference)}<br />
      <strong>Date :</strong> ${escapeHtml(orderDateLabel(session))}<br />
      <strong>Statut :</strong> Commande confirmée<br />
      <strong>Paiement :</strong> Confirmé
    </p>
    <h2 style="margin:0 0 10px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7268;">Vos articles</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 18px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Produit</th>
          <th style="text-align:center;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Qté</th>
          <th style="text-align:right;padding:8px;border-bottom:1px solid #1a1a1a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${rows.map((row) => row.html).join("")}</tbody>
    </table>
    <p style="margin:0 0 18px;font-size:18px;text-align:right;color:#1a1a1a;"><strong>Total : ${escapeHtml(total)}</strong></p>
    ${
      customer.address || locationLine
        ? `<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#1a1a1a;"><strong>Adresse de livraison :</strong><br />${escapeHtml(
            [customer.address, locationLine].filter(Boolean).join(" — "),
          )}</p>`
        : ""
    }
    ${customer.phone ? `<p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;"><strong>Téléphone :</strong> ${escapeHtml(customer.phone)}</p>` : ""}
    ${metadata.note ? `<p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;"><strong>Votre note :</strong> ${escapeHtml(metadata.note)}</p>` : ""}
    <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#3d3d3d;">Nous préparons votre colis avec soin.<br />À très bientôt,<br /><strong>L’équipe MRZ Perfume</strong></p>
  `;

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: user,
      subject: `Votre commande #${reference} est confirmée !`.slice(0, 180),
      text: [
        hello,
        "",
        "Votre commande est confirmée.",
        `Numéro : ${reference}`,
        `Date : ${orderDateLabel(session)}`,
        "Statut : Commande confirmée",
        "Paiement : Confirmé",
        "",
        "Articles :",
        ...rows.map((row) => row.text),
        "",
        `Total : ${total}`,
        customer.address ? `Adresse : ${customer.address}` : "",
        locationLine || "",
        customer.phone ? `Téléphone : ${customer.phone}` : "",
        "",
        `Suivre ma commande : ${accountUrl}`,
        "",
        "Merci pour votre confiance,",
        "MRZ Perfume",
      ]
        .filter(Boolean)
        .join("\n"),
      html: orderEmailShell({
        title: `Votre commande #${reference} est confirmée !`,
        bodyHtml,
        ctaLabel: "Suivre ma commande",
        ctaUrl: accountUrl,
      }),
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}
