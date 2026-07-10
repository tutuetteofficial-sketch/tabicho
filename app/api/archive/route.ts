import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { saveRow } from "@/lib/server-crud";

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const fallback = {
    id: body.id ?? "archive-" + Date.now(),
    trip_id: body.trip_id ?? snapshot.trip.id,
    pdf_url: body.pdf_url ?? null,
    summary_json: body.summary_json ?? { members: snapshot.members.length, wishlist: snapshot.wishlist.length },
    thumbnail_urls: Array.isArray(body.thumbnail_urls) ? body.thumbnail_urls : []
  };
  return jsonOk(await saveRow("archives", fallback, fallback));
}
