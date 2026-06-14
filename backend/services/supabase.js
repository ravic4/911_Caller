const BASE = () => `${process.env.SUPABASE_URL}/rest/v1`;
const HEADERS = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

export async function saveOrder({ caller, message }) {
  const res = await fetch(`${BASE()}/orders`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify({ caller, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? JSON.stringify(data));
  return Array.isArray(data) ? data[0] : data;
}

export async function getOrders() {
  const res = await fetch(
    `${BASE()}/orders?select=*&order=created_at.desc&limit=50`,
    { headers: HEADERS() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? JSON.stringify(data));
  return data;
}
