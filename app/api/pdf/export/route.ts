import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";

export async function POST(request: Request) {
  const body = await readJson(request);
  const tripId = body.trip_id ?? getDemoTripSnapshot().trip.id;
  const baseUrl = body.base_url ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return jsonOk({
    trip_id: tripId,
    print_url: baseUrl + "/archive/" + tripId + "/print",
    pdf_url: null,
    queued: false,
    mode: "print-page"
  });
}
