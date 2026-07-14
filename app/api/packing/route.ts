import { jsonOk, readJson } from "@/lib/api-utils";
import { requireTripEditor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { deleteRow, saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().packing;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("packing_items", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "pack-" + Date.now(),
    trip_id: body.trip_id ?? getDemoTripSnapshot().trip.id,
    name: body.name ?? "新しい持ち物",
    assigned_user_id: body.assigned_user_id ?? null,
    category: body.category ?? null,
    checked: Boolean(body.checked),
    locked: Boolean(body.locked),
    action: body.action
  };
  const authError = await requireTripEditor(request, fallback.trip_id);
  if (authError) return authError;
  if (body.action === "delete") return jsonOk(await deleteRow("packing_items", fallback, fallback));
  return jsonOk(await saveRow("packing_items", fallback, fallback));
}
