import { jsonOk, readJson } from "@/lib/api-utils";
import { requireTripEditor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().reflections;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("trip_reflections", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const fallback = {
    id: body.id ?? "reflection-" + Date.now(),
    trip_id: body.trip_id ?? snapshot.trip.id,
    user_id: body.user_id ?? snapshot.members[0].user_id,
    best_food: body.best_food ?? "",
    favorite_view: body.favorite_view ?? "",
    best_photo_id: body.best_photo_id ?? "",
    comment: body.comment ?? "",
    next_place: body.next_place ?? "",
    updated_at: body.updated_at ?? new Date().toISOString()
  };
  const authError = await requireTripEditor(request, fallback.trip_id);
  if (authError) return authError;
  return jsonOk(await saveRow("trip_reflections", fallback, fallback));
}
