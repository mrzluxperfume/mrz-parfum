import { Router } from "express";
import { supabase, isSupabaseConfigured } from "../supabase.js";
import { getLocalProducts } from "../data.js";

const router = Router();

// GET /api/products?category=...&q=...&featured=...
router.get("/", async (req, res, next) => {
  try {
    const { category, q, featured, limit } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase.from("products").select("*").order("id", { ascending: true });
      if (category) query = query.eq("category", category);
      if (featured) query = query.eq("is_new", true);
      if (q) query = query.ilike("name", `%${q}%`);
      if (limit) query = query.limit(Number(limit));
      const { data, error } = await query;
      if (error) throw error;
      return res.json({ source: "supabase", items: data });
    }

    // Fallback
    let items = getLocalProducts();
    if (category) items = items.filter((p) => p.category === category);
    if (featured === "true") items = items.filter((p) => p.is_new);
    if (q) items = items.filter((p) => p.name.toLowerCase().includes(String(q).toLowerCase()));
    if (limit) items = items.slice(0, Number(limit));
    res.json({ source: "local", items });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Product not found" });
      return res.json({ source: "supabase", product: data });
    }
    const product = getLocalProducts().find((p) => p.slug === slug);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ source: "local", product });
  } catch (err) {
    next(err);
  }
});

export default router;
