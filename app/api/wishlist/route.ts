import { jsonOk, readJson } from "@/lib/api-utils";
import { requireTripEditor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { deleteRow, saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().wishlist;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("wishlist_items", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "list-" + Date.now(),
    trip_id: body.trip_id ?? getDemoTripSnapshot().trip.id,
    creator_id: body.creator_id ?? getDemoTripSnapshot().members[0].user_id,
    title: body.title ?? "新しいリスト項目",
    memo: body.memo ?? "",
    is_priority: Boolean(body.is_priority ?? false),
    scope: body.scope ?? "trip",
    requester_ids: body.requester_ids ?? [body.creator_id ?? getDemoTripSnapshot().members[0].user_id],
    completed: Boolean(body.completed ?? false),
    created_at: body.created_at ?? new Date().toISOString(),
    action: body.action
  };
  const authError = await requireTripEditor(request, fallback.trip_id);
  if (authError) return authError;
  if (body.action === "delete") return jsonOk(await deleteRow("wishlist_items", fallback, fallback));
  return jsonOk(await saveRow("wishlist_items", fallback, fallback));
}
