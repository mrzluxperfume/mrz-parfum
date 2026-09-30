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
  const pass = requiredEnv("SMTP_PASS").replace(/\s+/g, "");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
  const to = process.env.MAIL_TO?.trim() || user;
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
}
