const OLLAMA_URL   = process.env.OLLAMA_URL   ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

const SUPA_URL = () => `${process.env.SUPABASE_URL}/rest/v1`;
const SUPA_HDR = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

async function getUnparsedOrders() {
  const [ordersRes, incidentsRes] = await Promise.all([
    fetch(`${SUPA_URL()}/orders?select=id,caller,message,conversation_id,created_at`, {
      headers: SUPA_HDR(),
    }),
    fetch(`${SUPA_URL()}/incidents?select=order_id`, { headers: SUPA_HDR() }),
  ]);

  const orders    = await ordersRes.json();
  const incidents = await incidentsRes.json();
  const parsedIds = new Set((incidents || []).map((i) => i.order_id));

  return (orders || []).filter((o) => !parsedIds.has(o.id));
}

async function parseTranscript(transcript) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [{
        role: "user",
        content: `This is a call transcript from an emergency app disguised as a pizza website called "Slice & Co." The caller uses pizza ordering as cover language for a real emergency.

Extract these fields and respond with ONLY valid JSON — no markdown, no explanation:
- request_type: Type of emergency ("Police", "Medical", "Fire", or "Unknown")
- party_size: Number of people at the scene as an integer, or null if not mentioned
- officers_needed: How many police officers/units should be dispatched based on severity, as an integer (estimate — e.g. 2 for minor, 4-6 for serious). null if clearly not a police matter.
- address: Location/delivery address as a string, or null if not mentioned
- caller_name: Name of the caller, or null if not mentioned
- notes: Any other relevant situational details

Transcript:
${transcript}

JSON only:`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  const raw  = data.message.content.trim()
    .replace(/^```json\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(raw);
}

async function saveIncident(order, parsed) {
  await fetch(`${SUPA_URL()}/incidents`, {
    method: "POST",
    headers: SUPA_HDR(),
    body: JSON.stringify({
      order_id:        order.id,
      conversation_id: order.conversation_id ?? null,
      transcript:      order.message,
      request_type:    parsed.request_type    ?? "Unknown",
      party_size:      parsed.party_size      ?? null,
      officers_needed: parsed.officers_needed ?? null,
      address:         parsed.address         ?? null,
      caller_name:     parsed.caller_name     ?? null,
      notes:           parsed.notes           ?? null,
    }),
  });
}

export async function parseNewOrders() {
  const orders  = await getUnparsedOrders();
  const results = [];

  for (const order of orders) {
    try {
      if (!order.message || order.message === "No transcript") continue;
      const parsed = await parseTranscript(order.message);
      await saveIncident(order, parsed);
      results.push({ id: order.id, status: "parsed", parsed });
      console.log(`[Parse] ${order.id} → ${parsed.request_type}, ${parsed.officers_needed} officers`);
    } catch (e) {
      console.error(`[Parse] Failed ${order.id}:`, e.message);
      results.push({ id: order.id, status: "error", error: e.message });
    }
  }

  return results;
}
