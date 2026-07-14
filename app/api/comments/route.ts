import { jsonError, jsonOk, readJson } from "@/lib/api-utils";
import { getTripActor } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { deleteRow, saveRow, selectRows } from "@/lib/server-crud";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import type { TripComment } from "@/lib/types";

export async function GET(request: Request) {
  const tripId = new URL(request.url).searchParams.get("trip_id") || getDemoTripSnapshot().trip.id;
  const { actor, error } = await getTripActor(request, tripId);
  if (error) return error;
  const fallback = getDemoTripSnapshot().comments.filter((comment) => comment.trip_id === tripId);
  const comments = await selectRows<TripComment[]>("trip_comments", fallback, { tripId, order: "created_at" });
  return jsonOk(comments.filter((comment) => comment.category !== "memo_private" || !actor || comment.user_id === actor.userId));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const tripId = typeof body.trip_id === "string" ? body.trip_id : snapshot.trip.id;
  const { actor, error } = await getTripActor(request, tripId);
  if (error) return error;
  if (actor?.role === "viewer") return jsonError("This trip is read-only for your account.", 403);

  const category = body.category === "memo_private" ? "memo_private" : "memo_shared";
  const userId = actor?.userId || body.user_id || snapshot.members[0].user_id;

  if (actor && typeof body.id === "string" && !body.id.startsWith("local-") && hasSupabaseConfig()) {
    const supabase = createServerSupabaseClient();
    const { data: existing } = supabase
      ? await supabase.from("trip_comments").select("user_id, category").eq("id", body.id).eq("trip_id", tripId).maybeSingle()
      : { data: null };
    if (!existing) return jsonError("Memo was not found in this trip.", 404);
    if (existing?.category === "memo_private" && existing.user_id !== actor.userId) {
      return jsonError("This private memo belongs to another member.", 403);
    }
  }

  const fallback = {
    id: body.id ?? "comment-" + Date.now(),
    trip_id: tripId,
    user_id: userId,
    category,
    body: body.body ?? "",
    created_at: body.created_at ?? new Date().toISOString(),
    action: body.action
  };
  if (!fallback.body.trim() && body.action !== "delete") return jsonError("Memo text is required.", 400);
  if (body.action === "delete") return jsonOk(await deleteRow("trip_comments", fallback, fallback));
  return jsonOk(await saveRow("trip_comments", fallback, fallback));
}
