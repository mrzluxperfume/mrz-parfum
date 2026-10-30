import nodemailer from "nodemailer";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable manquante : ${name}`);
  }
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
  console.error("[mail]", code, msg);
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

export async function sendContactEmail({ name, email, message }) {
  const { user, transport } = createTransport();
  const to = process.env.MAIL_TO?.trim() || user;

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: email,
      subject: `Nouveau message — ${name}`.slice(0, 180),
      text: [
        "Nouveau message depuis le site MRZ Perfume",
        "",
        `Nom : ${name}`,
        `Email : ${email}`,
        "",
        message,
      ].join("\n"),
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function requiredOrderNumber(session) {
  const orderNumber = String(session?.metadata?.order_number || '').trim()
  if (!/^MR\d{5}$/.test(orderNumber)) {
    throw new Error('Numéro de commande manquant ou invalide')
  }
  return orderNumber
}

function formatMessageHtml(message) {
  return escapeHtml(message)
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3d3d3d;">${line}</p>`)
    .join("");
}

export function buildNewsletterHtml({
  firstName,
  title,
  message,
  discountCode,
  discountLabel,
  ctaLabel,
  ctaUrl,
}) {
  const site = (process.env.CLIENT_URL || "https://www.mrz-perfume.fr").replace(
    /\/$/,
    "",
  );
  const logoUrl = `${site}/mrz-logo-footer.jpeg`;
  const hello = firstName ? `Bonjour ${escapeHtml(firstName)},` : "Bonjour,";
  const code = String(discountCode || "").trim();
  const label = String(discountLabel || "").trim();
  const buttonLabel = String(ctaLabel || "Découvrir la collection").trim();
  const buttonUrl = String(ctaUrl || `${site}/shop`).trim();

  const discountBlock = code
    ? `
      <tr>
        <td style="padding:8px 36px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ec;border:1px solid #e4ddd3;">
            <tr>
              <td style="padding:22px 20px;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7268;">Votre code remise</p>
                <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;letter-spacing:0.12em;color:#1a1a1a;">${escapeHtml(code)}</p>
                ${
                  label
                    ? `<p style="margin:0;font-size:14px;color:#5c554c;">${escapeHtml(label)}</p>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "MRZ Perfume")}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f2;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e8e2da;">
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid #eee8e0;text-align:center;">
              <img src="${escapeHtml(logoUrl)}" alt="MRZ Perfume" width="72" height="72" style="display:block;margin:0 auto;width:72px;height:72px;border-radius:50%;object-fit:cover;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3d3d3d;">${hello}</p>
              <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:28px;line-height:1.25;font-weight:normal;color:#1a1a1a;">${escapeHtml(title || "Une sélection pour vous")}</h1>
              ${formatMessageHtml(message)}
            </td>
          </tr>
          ${discountBlock}
          <tr>
            <td style="padding:8px 36px 36px;text-align:center;">
              <a href="${escapeHtml(buttonUrl)}" style="display:inline-block;background:#1f3d2f;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(buttonLabel)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px;background:#1a1a1a;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#d9d2c8;">MRZ Perfume</p>
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#9a9288;">
                61 rue Racine, 69100 Villeurbanne<br />
                <a href="${site}" style="color:#d9d2c8;text-decoration:none;">mrz-perfume.fr</a>
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:#7a7268;">
                Vous recevez cet email car vous avez un compte sur MRZ Perfume.<br />
                <a href="mailto:mrz.lux.perfume@gmail.com?subject=Desinscription%20newsletter" style="color:#bdb5aa;text-decoration:underline;">Se désinscrire</a>
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

export async function sendNewsletterEmail({
  to,
  firstName,
  subject,
  title,
  message,
  discountCode,
  discountLabel,
  ctaLabel,
  ctaUrl,
}) {
  const { user, transport } = createTransport();
  const html = buildNewsletterHtml({
    firstName,
    title,
    message,
    discountCode,
    discountLabel,
    ctaLabel,
    ctaUrl,
  });
  const text = [
    firstName ? `Bonjour ${firstName},` : "Bonjour,",
    "",
    title || "",
    "",
    message || "",
    discountCode ? `\nCode : ${discountCode}` : "",
    discountLabel || "",
    "",
    ctaUrl || process.env.CLIENT_URL || "https://www.mrz-perfume.fr/shop",
    "",
    "MRZ Perfume — 61 rue Racine, 69100 Villeurbanne",
    "Se désinscrire : mailto:mrz.lux.perfume@gmail.com?subject=Desinscription%20newsletter",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: user,
      subject: String(subject || title || "MRZ Perfume").slice(0, 180),
      text,
      html,
      headers: {
        "List-Unsubscribe": `<mailto:mrz.lux.perfume@gmail.com?subject=Desinscription%20newsletter>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Mailer": "MRZ Perfume",
      },
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

export async function sendOrderNotification({ session, lineItems }) {
  const orderReference = requiredOrderNumber(session)
  const { user, transport } = createTransport();
  const to = process.env.MAIL_TO?.trim() || user;
  const metadata = session.metadata || {};
  const currency = String(session.currency || 'eur').toUpperCase();
  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format((Number(amount) || 0) / 100);
  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;
  const paymentUrl = paymentIntent
    ? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}payments/${encodeURIComponent(paymentIntent)}`
    : '';
  const rows = lineItems.map((item) => {
    const name = item.description || 'Article MRZ Perfume';
    const quantity = Number(item.quantity) || 1;
    const total = formatMoney(item.amount_total);
    return {
      text: `${quantity} × ${name} — ${total}`,
      html: `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(total)}</td></tr>`,
    };
  });
  const customerName = metadata.name || session.customer_details?.name || 'Non renseigné';
  const customerEmail = session.customer_details?.email || session.customer_email || 'Non renseigné';
  const total = formatMoney(session.amount_total);

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: customerEmail !== 'Non renseigné' ? customerEmail : undefined,
      subject: `Commande payée — ${orderReference}`.slice(0, 180),
      text: [
        'Une nouvelle commande MRZ Perfume a été payée.',
        '',
        `Référence Stripe : ${orderReference}`,
        `Client : ${customerName}`,
        `Email : ${customerEmail}`,
        `Téléphone : ${metadata.phone || 'Non renseigné'}`,
        `Adresse : ${metadata.address || 'Non renseignée'}`,
        '',
        'Articles :',
        ...rows.map((row) => row.text),
        '',
        `Total payé : ${total}`,
        `Coupon : ${metadata.coupon || 'Aucun'}`,
        `Note : ${metadata.note || 'Aucune'}`,
        paymentUrl ? `Voir le paiement Stripe : ${paymentUrl}` : '',
      ].filter(Boolean).join('\n'),
      html: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.5"><h1>Commande payée</h1><p>Une nouvelle commande MRZ Perfume a été confirmée.</p><p><strong>Référence Stripe :</strong> ${escapeHtml(orderReference)}<br><strong>Client :</strong> ${escapeHtml(customerName)}<br><strong>Email :</strong> ${escapeHtml(customerEmail)}<br><strong>Téléphone :</strong> ${escapeHtml(metadata.phone || 'Non renseigné')}<br><strong>Adresse :</strong> ${escapeHtml(metadata.address || 'Non renseignée')}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px">Article</th><th style="padding:8px">Qté</th><th style="text-align:right;padding:8px">Total</th></tr></thead><tbody>${rows.map((row) => row.html).join('')}</tbody></table><p><strong>Total payé : ${escapeHtml(total)}</strong><br>Coupon : ${escapeHtml(metadata.coupon || 'Aucun')}<br>Note : ${escapeHtml(metadata.note || 'Aucune')}</p>${paymentUrl ? `<p><a href="${paymentUrl}">Voir le paiement dans Stripe</a></p>` : ''}</body></html>`,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

export async function sendCustomerOrderConfirmation({ session, lineItems }) {
  const reference = requiredOrderNumber(session)
  const { user, transport } = createTransport();
  const metadata = session.metadata || {};
  const to = session.customer_details?.email || session.customer_email;
  if (!to) throw new Error('Email client manquant dans la session Stripe');

  const currency = String(session.currency || 'eur').toUpperCase();
  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format((Number(amount) || 0) / 100);
  const rows = lineItems.map((item) => {
    const name = item.description || 'Article MRZ Perfume';
    const quantity = Number(item.quantity) || 1;
    const total = formatMoney(item.amount_total);
    return {
      text: `${quantity} × ${name} — ${total}`,
      html: `<tr><td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(total)}</td></tr>`,
    };
  });
  const customerName = metadata.name || session.customer_details?.name || 'Bonjour';
  const total = formatMoney(session.amount_total);
  const address = metadata.address || '';
  const phone = metadata.phone || '';

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: user,
      subject: `Confirmation de votre commande MRZ — ${reference}`.slice(0, 180),
      text: [
        `Bonjour ${customerName},`,
        '',
        'Nous vous confirmons que votre paiement a été reçu et que votre commande est enregistrée.',
        `Référence : ${reference}`,
        '',
        'Détail de votre commande :',
        ...rows.map((row) => row.text),
        '',
        `Total payé : ${total}`,
        metadata.coupon ? `Code utilisé : ${metadata.coupon}` : '',
        address ? `Adresse de livraison : ${address}` : '',
        phone ? `Téléphone : ${phone}` : '',
        metadata.note ? `Votre note : ${metadata.note}` : '',
        '',
        'Merci pour votre commande,',
        'MRZ Perfume',
      ].filter(Boolean).join('\n'),
      html: `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6"><main style="max-width:620px;margin:0 auto;padding:32px;background:#fff"><p>Bonjour ${escapeHtml(customerName)},</p><h1 style="font-family:Georgia,serif;font-weight:normal">Merci pour votre commande</h1><p>Votre paiement a été reçu et votre commande est confirmée.</p><p><strong>Référence :</strong> ${escapeHtml(reference)}</p><h2 style="font-size:16px">Détail de votre commande</h2><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px;text-align:left">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Total</th></tr></thead><tbody>${rows.map((row) => row.html).join('')}</tbody></table><p style="text-align:right;font-size:18px"><strong>Total payé : ${escapeHtml(total)}</strong></p>${metadata.coupon ? `<p>Code utilisé : ${escapeHtml(metadata.coupon)}</p>` : ''}${address ? `<p>Adresse de livraison : ${escapeHtml(address)}</p>` : ''}${phone ? `<p>Téléphone : ${escapeHtml(phone)}</p>` : ''}${metadata.note ? `<p>Votre note : ${escapeHtml(metadata.note)}</p>` : ''}<p>Merci pour votre confiance,<br />MRZ Perfume</p></main></body></html>`,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

export async function sendAdminOrderConfirmation({ orderNumber, customer, items, total, note }) {
  const { user, transport } = createTransport();
  const to = String(customer?.email || '').trim();
  
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error('Email client invalide');
  }
  if (!/^MR\d{5}$/.test(orderNumber)) {
    throw new Error('Numéro de commande invalide');
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount) || 0);

  const rows = (items || []).map((item) => {
    const name = item.name || 'Article MRZ Perfume';
    const quantity = Number(item.quantity) || 1;
    const lineTotal = formatMoney(item.lineTotal || item.price * quantity);
    return {
      text: `${quantity} × ${name} ${item.volume ? `(${item.volume})` : ''} — ${lineTotal}`,
      html: `<tr><td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(name)}${item.volume ? ` <span style="color:#888">(${escapeHtml(item.volume)})</span>` : ''}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(lineTotal)}</td></tr>`,
    };
  });

  const customerName = customer?.name || 'Client';
  const totalFormatted = formatMoney(total);
  const address = customer?.address || '';
  const phone = customer?.phone || '';

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: user,
      subject: `Votre commande MRZ est confirmée — ${orderNumber}`.slice(0, 180),
      text: [
        `Bonjour ${customerName},`,
        '',
        'Votre commande a été confirmée par notre équipe et est en cours de préparation.',
        `Numéro de commande : ${orderNumber}`,
        '',
        'Détail de votre commande :',
        ...rows.map((row) => row.text),
        '',
        `Total : ${totalFormatted}`,
        address ? `Adresse de livraison : ${address}` : '',
        phone ? `Téléphone : ${phone}` : '',
        note ? `Votre note : ${note}` : '',
        '',
        'Nous vous informerons dès l\'expédition de votre colis.',
        '',
        'Merci pour votre confiance,',
        'L\'équipe MRZ Perfume',
      ].filter(Boolean).join('\n'),
      html: `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6"><main style="max-width:620px;margin:0 auto;padding:32px;background:#fff"><p>Bonjour ${escapeHtml(customerName)},</p><h1 style="font-family:Georgia,serif;font-weight:normal">Commande confirmée</h1><p>Votre commande a été confirmée par notre équipe et est en cours de préparation.</p><p><strong>Numéro de commande :</strong> ${escapeHtml(orderNumber)}</p><h2 style="font-size:16px">Détail de votre commande</h2><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px;text-align:left">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Total</th></tr></thead><tbody>${rows.map((row) => row.html).join('')}</tbody></table><p style="text-align:right;font-size:18px"><strong>Total : ${escapeHtml(totalFormatted)}</strong></p>${address ? `<p><strong>Adresse de livraison :</strong><br />${escapeHtml(address)}</p>` : ''}${phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>` : ''}${note ? `<p><strong>Votre note :</strong> ${escapeHtml(note)}</p>` : ''}<p>Nous vous informerons dès l'expédition de votre colis.</p><p>Merci pour votre confiance,<br />L'équipe MRZ Perfume</p></main></body></html>`,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

export async function sendOrderNotificationFromDB({ orderNumber, customer, items, total, note }) {
  const { user, transport } = createTransport();
  const to = process.env.MAIL_TO?.trim() || user;

  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount) || 0);

  const rows = (items || []).map((item) => {
    const name = item.name || 'Article MRZ Perfume';
    const quantity = Number(item.quantity) || 1;
    const lineTotal = formatMoney(item.lineTotal || item.unitPrice * quantity || 0);
    return {
      text: `${quantity} × ${name} ${item.volume ? `(${item.volume})` : ''} — ${lineTotal}`,
      html: `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(name)}${item.volume ? ` <span style="color:#888">(${escapeHtml(item.volume)})</span>` : ''}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(lineTotal)}</td></tr>`,
    };
  });

  const customerName = customer?.name || 'Non renseigné';
  const customerEmail = customer?.email || 'Non renseigné';
  const totalFormatted = formatMoney(total);

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: customerEmail !== 'Non renseigné' ? customerEmail : undefined,
      subject: `Nouvelle commande — ${orderNumber}`.slice(0, 180),
      text: [
        'Une nouvelle commande MRZ Perfume a été enregistrée.',
        '',
        `Numéro : ${orderNumber}`,
        `Client : ${customerName}`,
        `Email : ${customerEmail}`,
        `Téléphone : ${customer?.phone || 'Non renseigné'}`,
        `Adresse : ${customer?.address || 'Non renseignée'}`,
        '',
        'Articles :',
        ...rows.map((row) => row.text),
        '',
        `Total : ${totalFormatted}`,
        `Note : ${note || 'Aucune'}`,
      ].filter(Boolean).join('\n'),
      html: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.5"><h1>Nouvelle commande</h1><p>Une nouvelle commande MRZ Perfume a été enregistrée.</p><p><strong>Numéro :</strong> ${escapeHtml(orderNumber)}<br><strong>Client :</strong> ${escapeHtml(customerName)}<br><strong>Email :</strong> ${escapeHtml(customerEmail)}<br><strong>Téléphone :</strong> ${escapeHtml(customer?.phone || 'Non renseigné')}<br><strong>Adresse :</strong> ${escapeHtml(customer?.address || 'Non renseignée')}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px">Article</th><th style="padding:8px">Qté</th><th style="text-align:right;padding:8px">Total</th></tr></thead><tbody>${rows.map((row) => row.html).join('')}</tbody></table><p><strong>Total : ${escapeHtml(totalFormatted)}</strong><br>Note : ${escapeHtml(note || 'Aucune')}</p></body></html>`,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}

export async function sendCustomerOrderConfirmationFromDB({ orderNumber, customer, items, total, note }) {
  const { user, transport } = createTransport();
  const to = String(customer?.email || '').trim();
  
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error('Email client invalide');
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount) || 0);

  const rows = (items || []).map((item) => {
    const name = item.name || 'Article MRZ Perfume';
    const quantity = Number(item.quantity) || 1;
    const lineTotal = formatMoney(item.lineTotal || item.unitPrice * quantity || 0);
    return {
      text: `${quantity} × ${name} ${item.volume ? `(${item.volume})` : ''} — ${lineTotal}`,
      html: `<tr><td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(name)}${item.volume ? ` <span style="color:#888">(${escapeHtml(item.volume)})</span>` : ''}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(lineTotal)}</td></tr>`,
    };
  });

  const customerName = customer?.name || 'Bonjour';
  const totalFormatted = formatMoney(total);
  const address = customer?.address || '';
  const phone = customer?.phone || '';

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      replyTo: user,
      subject: `Confirmation de votre commande MRZ — ${orderNumber}`.slice(0, 180),
      text: [
        `Bonjour ${customerName},`,
        '',
        'Nous vous confirmons que votre commande a été enregistrée avec succès.',
        `Numéro de commande : ${orderNumber}`,
        '',
        'Détail de votre commande :',
        ...rows.map((row) => row.text),
        '',
        `Total : ${totalFormatted}`,
        address ? `Adresse de livraison : ${address}` : '',
        phone ? `Téléphone : ${phone}` : '',
        note ? `Votre note : ${note}` : '',
        '',
        'Nous préparons votre commande et vous tiendrons informé de son expédition.',
        '',
        'Merci pour votre confiance,',
        'MRZ Perfume',
      ].filter(Boolean).join('\n'),
      html: `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6"><main style="max-width:620px;margin:0 auto;padding:32px;background:#fff"><p>Bonjour ${escapeHtml(customerName)},</p><h1 style="font-family:Georgia,serif;font-weight:normal">Merci pour votre commande</h1><p>Nous vous confirmons que votre commande a été enregistrée avec succès.</p><p><strong>Numéro de commande :</strong> ${escapeHtml(orderNumber)}</p><h2 style="font-size:16px">Détail de votre commande</h2><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px;text-align:left">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Total</th></tr></thead><tbody>${rows.map((row) => row.html).join('')}</tbody></table><p style="text-align:right;font-size:18px"><strong>Total : ${escapeHtml(totalFormatted)}</strong></p>${address ? `<p><strong>Adresse de livraison :</strong><br />${escapeHtml(address)}</p>` : ''}${phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>` : ''}${note ? `<p><strong>Votre note :</strong> ${escapeHtml(note)}</p>` : ''}<p>Nous préparons votre commande et vous tiendrons informé de son expédition.</p><p>Merci pour votre confiance,<br />MRZ Perfume</p></main></body></html>`,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}
