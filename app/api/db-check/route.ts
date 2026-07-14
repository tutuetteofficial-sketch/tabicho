import { jsonError, jsonOk } from "@/lib/api-utils";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const tableNames = [
  "trips",
  "trip_members",
  "itinerary_days",
  "itinerary_items",
  "wishlist_items",
  "packing_items",
  "todos",
  "expenses",
  "photos",
  "trip_reflections"
];

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return jsonError("Not found.", 404);
  }

  if (!hasSupabaseConfig()) {
    return jsonOk({
      connected: false,
      message: "Supabase environment variables are not set. The app is using demo data.",
      required: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
      ]
    });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return jsonOk({
      connected: false,
      message: "Supabase client could not be created. Check environment variables."
    });
  }

  const checks = await Promise.all(tableNames.map(async (table) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    return {
      table,
      ok: !error,
      count: count ?? 0,
      error: error?.message ?? null
    };
  }));

  const tripCheck = await supabase
    .from("trips")
    .select("id,title,invite_code")
    .eq("id", "trip-kanazawa-2026")
    .maybeSingle();

  return jsonOk({
    connected: checks.every((check) => check.ok),
    message: checks.every((check) => check.ok)
      ? "Supabase is reachable."
      : "Supabase is configured, but some tables could not be read.",
    checks,
    demoTrip: {
      ok: !tripCheck.error && Boolean(tripCheck.data),
      data: tripCheck.data ?? null,
      error: tripCheck.error?.message ?? null
    }
  });
}
