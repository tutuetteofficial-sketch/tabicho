import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  const fallback = getDemoTripSnapshot().members;
  return jsonOk(await selectRows("trip_members", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const fallback = {
    id: body.id ?? "member-" + Date.now(),
    trip_id: body.trip_id ?? snapshot.trip.id,
    user_id: body.user_id ?? snapshot.members[0].user_id,
    role: body.role ?? "editor",
    trip_nickname: body.trip_nickname ?? "",
    trip_avatar_url: body.trip_avatar_url ?? ""
  };
  return jsonOk(await saveRow("trip_members", fallback, fallback));
}
