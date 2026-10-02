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
            <td style="padding:28px 36px 18px;border-bottom:1px solid #eee8e0;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:28px;letter-spacing:0.22em;color:#1a1a1a;">MRZ</p>
              <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8a8278;">L'essence du luxe</p>
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
            <td style="padding:20px 36px;background:#1a1a1a;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#d9d2c8;">MRZ Perfume</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9a9288;">
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
    discountCode ? `\nCode remise : ${discountCode}` : "",
    discountLabel || "",
    "",
    ctaUrl || process.env.CLIENT_URL || "https://www.mrz-perfume.fr/shop",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: `"MRZ Perfume" <${user}>`,
      to,
      subject: String(subject || title || "MRZ Perfume").slice(0, 180),
      text,
      html,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}
