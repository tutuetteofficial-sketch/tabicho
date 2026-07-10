import { jsonOk } from "@/lib/api-utils";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!hasSupabaseConfig()) {
    return jsonOk({
      connected: false,
      writable: false,
      message: "Supabase environment variables are not set. The app is using demo data."
    });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return jsonOk({
      connected: false,
      writable: false,
      message: "Supabase client could not be created. Check environment variables."
    });
  }

  const testId = "db-write-check-" + Date.now();
  const testRow = {
    id: testId,
    trip_id: "trip-kanazawa-2026",
    name: "DB write check",
    assigned_user_id: null,
    category: "system",
    checked: false,
    locked: false
  };

  const insert = await supabase
    .from("packing_items")
    .insert(testRow)
    .select("id")
    .maybeSingle();

  if (insert.error) {
    return jsonOk({
      connected: true,
      writable: false,
      step: "insert",
      message: "Supabase is reachable, but a test row could not be inserted.",
      error: insert.error.message
    });
  }

  const remove = await supabase
    .from("packing_items")
    .delete()
    .eq("id", testId);

  if (remove.error) {
    return jsonOk({
      connected: true,
      writable: true,
      cleanup: false,
      step: "delete",
      message: "A test row was inserted, but cleanup failed. Delete this row manually if needed.",
      testId,
      error: remove.error.message
    });
  }

  return jsonOk({
    connected: true,
    writable: true,
    cleanup: true,
    message: "Supabase write check passed. A test row was inserted and deleted."
  });
}
