import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { supabase, isSupabaseConfigured } from "./supabase.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import contactRouter from "./routes/contact.js";
import checkoutRouter from "./routes/checkout.js";
import authRouter from "./routes/auth.js";
import { loadLocalProducts } from "./data.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mrz-perfume-api",
    supabase: isSupabaseConfigured ? "connected" : "fallback (local JSON)",
    time: new Date().toISOString(),
  });
});

// Preload local fallback products once
loadLocalProducts();

// API routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/contact", contactRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/auth", authRouter);

// 404
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  const line = "─".repeat(60);
  console.log(`\n${line}\n  MRZ Perfume API → http://localhost:${PORT}\n  Supabase: ${
    isSupabaseConfigured ? "connected" : "fallback (local JSON)"
  }\n${line}\n`);
});
