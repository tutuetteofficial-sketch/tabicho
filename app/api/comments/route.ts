import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  const fallback = getDemoTripSnapshot().comments;
  return jsonOk(await selectRows("trip_comments", fallback, { tripId: getDemoTripSnapshot().trip.id, order: "created_at" }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const fallback = {
    id: body.id ?? "comment-" + Date.now(),
    trip_id: body.trip_id ?? snapshot.trip.id,
    user_id: body.user_id ?? snapshot.members[0].user_id,
    category: body.category ?? "memo_shared",
    body: body.body ?? "",
    created_at: body.created_at ?? new Date().toISOString()
  };
  return jsonOk(await saveRow("trip_comments", fallback, fallback));
}
