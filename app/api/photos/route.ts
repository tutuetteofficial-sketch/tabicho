import { jsonOk, readJson } from "@/lib/api-utils";
import { requireTripEditor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { deleteRow, saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().photos;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("photos", fallback, { tripId: getDemoTripSnapshot().trip.id, order: "created_at" }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const tripId = typeof body.trip_id === "string" ? body.trip_id : getDemoTripSnapshot().trip.id;
  const authError = await requireTripEditor(request, tripId);
  if (authError) return authError;
  if (body.action === "delete") {
    return jsonOk(await deleteRow("photos", body, body));
  }
  const fallback = {
    id: body.id ?? "photo-" + Date.now(),
    trip_id: tripId,
    uploader_id: body.uploader_id ?? getDemoTripSnapshot().members[0].user_id,
    itinerary_item_id: body.itinerary_item_id ?? null,
    transit_segment_id: body.transit_segment_id ?? null,
    category: body.category ?? "general",
    image_url: body.image_url ?? "",
    caption: body.caption ?? "",
    like_count: body.like_count ?? 0,
    cover_candidate: body.cover_candidate ?? false,
    pdf_selected: body.pdf_selected ?? false,
    pdf_caption: body.pdf_caption ?? "",
    created_at: body.created_at ?? new Date().toISOString()
  };
  return jsonOk(await saveRow("photos", fallback, fallback));
}
