import { jsonOk, readJson } from "@/lib/api-utils";
import { requireTripEditor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().expenses;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("expenses", fallback, { tripId: getDemoTripSnapshot().trip.id, order: "created_at" }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "expense-" + Date.now(),
    trip_id: body.trip_id ?? getDemoTripSnapshot().trip.id,
    title: body.title ?? "支払い",
    amount: Number(body.amount ?? 0),
    payer_id: body.payer_id ?? getDemoTripSnapshot().members[0].user_id,
    participant_ids: Array.isArray(body.participant_ids) ? body.participant_ids : [],
    category: body.category ?? "other",
    created_at: body.created_at ?? new Date().toISOString()
  };
  const authError = await requireTripEditor(request, fallback.trip_id);
  if (authError) return authError;
  return jsonOk(await saveRow("expenses", fallback, fallback));
}
