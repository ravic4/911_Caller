const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

export async function getConversationToken(contextualPrompt) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT_ID}`,
    { headers: { "xi-api-key": API_KEY } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs token error: ${err}`);
  }

  const { token } = await res.json();
  return token;
}

// Patch agent with a contextual system prompt override for this session.
// The caller passes the context built from CSV + user profile.
export async function patchAgentOverride(promptOverride) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: { prompt: promptOverride },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs patch error: ${err}`);
  }
}
