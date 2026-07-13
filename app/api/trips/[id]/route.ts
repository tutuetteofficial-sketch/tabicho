import { requireTripMember } from "@/lib/api-auth";
import { jsonOk } from "@/lib/api-utils";
import { getTripSnapshot } from "@/lib/data";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireTripMember(request, params.id);
  if (authError) return authError;
  return jsonOk(await getTripSnapshot(params.id));
}
