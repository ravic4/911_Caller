import { Router } from "express";
import { saveOrder, getOrders } from "../services/supabase.js";
import { writeFile, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS = join(__dirname, "../uploads");
mkdirSync(UPLOADS, { recursive: true });

async function fetchAndSaveAudio(conversationId) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } }
  );
  if (!res.ok) throw new Error(`ElevenLabs audio fetch failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `call-${conversationId}.mp3`;
  writeFile(join(UPLOADS, filename), buffer, () => {});
  console.log(`[Audio] Saved ${filename}`);
  return filename;
}

const router = Router();

// POST /api/orders — called by ElevenLabs save_order tool
router.post("/", async (req, res) => {
  try {
    const { caller, message, conversation_id } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const order = await saveOrder({ caller: caller ?? "unknown", message });

    // Fire-and-forget audio download
    if (conversation_id) {
      fetchAndSaveAudio(conversation_id).catch((e) =>
        console.error("[Audio] Download failed:", e.message)
      );
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Order save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders
router.get("/", async (_req, res) => {
  try {
    res.json(await getOrders());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
