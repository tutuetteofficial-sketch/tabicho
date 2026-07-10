import { jsonOk } from "@/lib/api-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonOk({ mode: "demo", user: null });
  const { data, error } = await supabase.auth.getUser();
  return jsonOk({ mode: "supabase", user: error ? null : data.user });
}
