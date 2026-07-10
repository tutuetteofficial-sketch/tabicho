import { jsonOk, readJson } from "@/lib/api-utils";
import { demoTripSnapshot } from "@/lib/demo-data";
import { saveRow } from "@/lib/server-crud";

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "trip-" + Date.now(),
    title: body.title ?? demoTripSnapshot.trip.title,
    destination: body.destination ?? demoTripSnapshot.trip.destination,
    start_date: body.start_date ?? demoTripSnapshot.trip.start_date,
    end_date: body.end_date ?? demoTripSnapshot.trip.end_date,
    owner_id: body.owner_id ?? demoTripSnapshot.trip.owner_id,
    status: body.status ?? "planning",
    invite_code: body.invite_code ?? "INV-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    created_at: body.created_at ?? new Date().toISOString()
  };
  return jsonOk(await saveRow("trips", fallback, fallback));
}
