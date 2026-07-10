import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  return jsonOk(await selectRows("itinerary_items", getDemoTripSnapshot().itinerary));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "item-" + Date.now(),
    day_id: body.day_id ?? getDemoTripSnapshot().days[0].id,
    parent_branch_id: body.parent_branch_id ?? null,
    title: body.title ?? "新しい予定",
    start_time: body.start_time ?? "12:00",
    end_time: body.end_time ?? null,
    location_name: body.location_name ?? null,
    address: body.address ?? null,
    map_url: body.map_url ?? null,
    link_url: body.link_url ?? null,
    link_label: body.link_label ?? null,
    reservation_info: body.reservation_info ?? null,
    note: body.note ?? null,
    transit_duration: body.transit_duration ?? null,
    transit_memo: body.transit_memo ?? null,
    transit_photo_note: body.transit_photo_note ?? null,
    branch_a_title: body.branch_a_title ?? null,
    branch_a_members: body.branch_a_members ?? null,
    branch_b_title: body.branch_b_title ?? null,
    branch_b_members: body.branch_b_members ?? null,
    rejoin_time: body.rejoin_time ?? null,
    type: body.type ?? "normal"
  };
  return jsonOk(await saveRow("itinerary_items", fallback, fallback));
}
