import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  const fallback = getDemoTripSnapshot().wishlist;
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
  return jsonOk(await saveRow("wishlist_items", fallback, fallback));
}
