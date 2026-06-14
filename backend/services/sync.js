// Polls ElevenLabs for new conversations and saves them to Supabase automatically.
// Runs every 60 seconds — no webhooks or tool calls needed.

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const API_KEY  = process.env.ELEVENLABS_API_KEY;
const SUPA_URL = () => `${process.env.SUPABASE_URL}/rest/v1`;
const SUPA_HDR = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

async function getRecentConversations() {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}&page_size=10`,
    { headers: { "xi-api-key": API_KEY } }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.status}`);
  const data = await res.json();
  return data.conversations ?? [];
}

async function getConversationDetail(id) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${id}`,
    { headers: { "xi-api-key": API_KEY } }
  );
  if (!res.ok) return null;
  return res.json();
}

async function alreadySaved(conversationId) {
  const res = await fetch(
    `${SUPA_URL()}/orders?conversation_id=eq.${conversationId}&select=id`,
    { headers: SUPA_HDR() }
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

async function saveConversation(conv, detail) {
  const transcript = detail?.transcript
    ?.map(t => `${t.role}: ${t.message}`)
    .join("\n") ?? "No transcript";

  const caller = detail?.metadata?.phone_number ?? "unknown";

  await fetch(`${SUPA_URL()}/orders`, {
    method: "POST",
    headers: SUPA_HDR(),
    body: JSON.stringify({
      caller,
      message: transcript,
      conversation_id: conv.conversation_id,
      status: "received",
    }),
  });

  console.log(`[Sync] Saved conversation ${conv.conversation_id}`);
}

export async function syncConversations() {
  try {
    const conversations = await getRecentConversations();
    for (const conv of conversations) {
      if (conv.status !== "done") continue;
      if (await alreadySaved(conv.conversation_id)) continue;

      const detail = await getConversationDetail(conv.conversation_id);
      if (detail) await saveConversation(conv, detail);
    }
  } catch (e) {
    console.error("[Sync] Error:", e.message);
  }
}
