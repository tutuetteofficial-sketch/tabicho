import { jsonError, jsonOk } from "@/lib/api-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return jsonError("Login is required.", 401);

  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonError("Supabase is not configured.", 500);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return jsonError("Login could not be verified.", 401);

  const { data, error } = await supabase
    .from("trip_members")
    .select("role, trip:trips(*)")
    .eq("user_id", authData.user.id);

  if (error) return jsonError(error.message, 500);

  const trips = (data || [])
    .filter((entry) => entry.trip)
    .sort((a, b) => {
      const aTrip = Array.isArray(a.trip) ? a.trip[0] : a.trip;
      const bTrip = Array.isArray(b.trip) ? b.trip[0] : b.trip;
      return String(bTrip?.start_date || "").localeCompare(String(aTrip?.start_date || ""));
    });

  return jsonOk(trips);
}
