import { jsonOk } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const snapshot = getDemoTripSnapshot();
  return jsonOk({ ...snapshot, trip: { ...snapshot.trip, id: params.id } });
}
