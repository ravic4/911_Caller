import { Router } from "express";
import { loadContacts, buildAgentContext } from "../services/csv.js";
import { getConversationToken } from "../services/elevenlabs.js";

const router = Router();

// GET /api/agent/token
// Returns a short-lived WebRTC token for the mobile app to connect directly
// to ElevenLabs without exposing the API key client-side.
// Optionally accepts a userProfile body to inject into the agent context.
router.post("/token", async (req, res) => {
  try {
    const contacts = loadContacts();
    const context = buildAgentContext(contacts, req.body?.userProfile ?? {});
    const token = await getConversationToken(context);
    res.json({ token, agentId: process.env.ELEVENLABS_AGENT_ID });
  } catch (err) {
    console.error("Agent token error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agent/contacts — return parsed contacts for the app UI
router.get("/contacts", (_req, res) => {
  try {
    res.json(loadContacts());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
