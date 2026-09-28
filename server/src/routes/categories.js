import { Router } from "express";
import { supabase, isSupabaseConfigured } from "../supabase.js";
import { getLocalCategories } from "../data.js";

const router = Router();

// GET /api/categories
router.get("/", async (req, res, next) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return res.json({ source: "supabase", items: data });
    }
    res.json({ source: "local", items: getLocalCategories() });
  } catch (err) {
    next(err);
  }
});

export default router;