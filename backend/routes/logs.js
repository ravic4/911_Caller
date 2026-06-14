import { Router } from "express";

const router = Router();

const BASE = () => `${process.env.SUPABASE_URL}/rest/v1`;
const HEADERS = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
});

router.get("/", async (_req, res) => {
  const r = await fetch(
    `${BASE()}/logs?select=*&order=created_at.desc&limit=100`,
    { headers: HEADERS() }
  );
  const data = await r.json();
  res.json(data);
});

export default router;
