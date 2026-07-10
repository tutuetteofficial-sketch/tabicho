import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  const fallback = getDemoTripSnapshot().foodLogs;
  return jsonOk(await selectRows("food_logs", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "food-" + Date.now(),
    trip_id: body.trip_id ?? getDemoTripSnapshot().trip.id,
    itinerary_item_id: body.itinerary_item_id ?? null,
    shop_name: body.shop_name ?? "新しい店",
    menu_name: body.menu_name ?? "新しいメニュー",
    price: body.price ?? null,
    rating: body.rating ?? null,
    note: body.note ?? "",
    image_urls: Array.isArray(body.image_urls) ? body.image_urls : [],
    created_at: body.created_at ?? new Date().toISOString()
  };
  return jsonOk(await saveRow("food_logs", fallback, fallback));
}
