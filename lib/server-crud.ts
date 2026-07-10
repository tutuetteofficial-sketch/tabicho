import { createServerSupabaseClient, hasSupabaseConfig } from "./supabase";

export async function selectRows<T>(table: string, fallback: T, options?: { tripId?: string; order?: string }) {
  if (!hasSupabaseConfig()) return fallback;
  const supabase = createServerSupabaseClient();
  if (!supabase) return fallback;

  let query = supabase.from(table).select("*");
  if (options?.tripId) query = query.eq("trip_id", options.tripId);
  if (options?.order) query = query.order(options.order);

  const { data, error } = await query;
  return error || !data ? fallback : (data as T);
}

export async function saveRow<T extends Record<string, unknown>>(table: string, body: T, fallback: T) {
  if (!hasSupabaseConfig()) return fallback;
  const supabase = createServerSupabaseClient();
  if (!supabase) return fallback;

  const cleanBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => key !== "action" && value !== undefined)
  );

  if (typeof cleanBody.id === "string" && !cleanBody.id.startsWith("local-")) {
    const { data, error } = await supabase
      .from(table)
      .update(cleanBody)
      .eq("id", cleanBody.id)
      .select()
      .maybeSingle();
    if (!error && data) return data as T;
  }

  const { id: _id, ...insertBody } = cleanBody;
  const { data, error } = await supabase.from(table).insert(insertBody).select().maybeSingle();
  return error || !data ? fallback : (data as T);
}


export async function deleteRow<T extends Record<string, unknown>>(table: string, body: T, fallback: T) {
  if (!hasSupabaseConfig()) return fallback;
  const supabase = createServerSupabaseClient();
  if (!supabase) return fallback;
  if (typeof body.id !== "string") return fallback;

  const { error } = await supabase.from(table).delete().eq("id", body.id);
  return error ? fallback : body;
}
