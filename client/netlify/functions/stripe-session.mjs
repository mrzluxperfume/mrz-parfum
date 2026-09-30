import fs from "fs";
import path from "path";
import Stripe from "stripe";

const logoCandidates = [
  path.join(process.cwd(), "client/netlify/functions/mrz-nav-logo.png"),
  path.join(process.cwd(), "netlify/functions/mrz-nav-logo.png"),
  path.join(process.cwd(), "client/public/mrz-nav-logo.png"),
  path.join(process.cwd(), "public/mrz-nav-logo.png"),
];

let logoFileId = null;

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    const error = new Error("STRIPE_SECRET_KEY manquante");
    error.status = 500;
    throw error;
  }
  return new Stripe(key);
}

export function clientUrl() {
  const raw = (process.env.CLIENT_URL || "https://www.mrz-perfume.fr")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  return raw.includes("localhost") ? "https://www.mrz-perfume.fr" : raw;
}

export async function mrzLogoFile(stripe) {
  if (logoFileId) return logoFileId;
  const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
  if (!logoPath) return null;
  const uploaded = await stripe.files.create({
    purpose: "business_logo",
    file: {
      data: fs.readFileSync(logoPath),
      name: "mrz-nav-logo.png",
      type: "image/png",
    },
  });
  logoFileId = uploaded.id;
  return logoFileId;
}
