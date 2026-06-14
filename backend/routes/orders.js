import { Router } from "express";
import { saveOrder, getOrders } from "../services/supabase.js";

const router = Router();

// POST /api/orders — called by ElevenLabs agent tool when order is placed
router.post("/", async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers["phone"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { caller, message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });
    const order = await saveOrder({ caller: caller ?? "unknown", message });
    res.json({ success: true, order });
  } catch (err) {
    console.error("Order save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — polled by the pizza website
router.get("/", async (_req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
