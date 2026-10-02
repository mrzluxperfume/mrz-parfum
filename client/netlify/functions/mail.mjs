import nodemailer from "nodemailer";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable manquante : ${name}`);
  }
  return value;
}

export async function sendContactEmail({ name, email, message }) {
  const user = requiredEnv("SMTP_USER");
  // Gmail app passwords are often pasted with spaces
  const pass = requiredEnv("SMTP_PASS").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

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
    const code = err?.code || err?.responseCode || "";
    const msg = String(err?.message || err);
    console.error("[mail]", code, msg);
    if (
      code === "EAUTH" ||
      /Invalid login|Username and Password not accepted|BadCredentials/i.test(msg)
    ) {
      throw new Error(
        "Identifiants Gmail invalides. Vérifiez SMTP_USER et SMTP_PASS (mot de passe d’application) sur Netlify.",
      );
    }
    if (code === "EENVELOPE" || /ENOTFOUND|ECONNECTION|ETIMEDOUT/i.test(String(code))) {
      throw new Error("Connexion SMTP impossible. Vérifiez SMTP_HOST / SMTP_PORT.");
    }
    throw new Error(msg);
  }
}
