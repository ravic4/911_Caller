import { Router } from "express";
import { parseNewOrders } from "../services/parse.js";

const SUPA_URL = () => `${process.env.SUPABASE_URL}/rest/v1`;
const SUPA_HDR = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
});

const router = Router();

// POST /api/parse — trigger parsing of all unprocessed orders
router.post("/", async (_req, res) => {
  try {
    const results = await parseNewOrders();
    res.json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("[Parse Route]", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parse/incidents — return all parsed incidents newest first
router.get("/incidents", async (_req, res) => {
  try {
    const r = await fetch(
      `${SUPA_URL()}/incidents?select=*&order=created_at.desc`,
      { headers: SUPA_HDR() }
    );
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
