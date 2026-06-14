import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  return createClient(url, key, { realtime: { enabled: false } });
}

export async function saveOrder({ caller, message }) {
  const { data, error } = await getClient()
    .from("orders")
    .insert({ caller, message })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrders() {
  const { data, error } = await getClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
}
