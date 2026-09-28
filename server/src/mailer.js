import nodemailer from "nodemailer";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable manquante : ${name}`);
  }
  return value;
}

export function createTransport() {
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS").replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
}

export async function sendContactEmail({ name, email, message }) {
  const transport = createTransport();
  const to = process.env.MAIL_TO?.trim() || process.env.SMTP_USER.trim();
  const from = process.env.SMTP_USER.trim();

  await transport.sendMail({
    from: `"MRZ Perfume" <${from}>`,
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
}
