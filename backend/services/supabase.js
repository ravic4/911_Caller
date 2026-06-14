import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { enabled: false } }
);

export async function saveOrder({ caller, message }) {
  const { data, error } = await supabase
    .from("orders")
    .insert({ caller, message })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data;
}
