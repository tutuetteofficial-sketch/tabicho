import { getTripActor } from "@/lib/api-auth";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { actor, error: authError } = await getTripActor(request, params.id);
  if (authError) return authError;
  if (!actor || actor.role !== "owner") return jsonError("Only the trip owner can regenerate invite links.", 403);

  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonError("Supabase is not configured.", 500);

  const inviteCode = `TABICHO-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  const { data: trip, error } = await supabase
    .from("trips")
    .update({ invite_code: inviteCode })
    .eq("id", params.id)
    .select("id, invite_code")
    .maybeSingle();
  if (error || !trip) return jsonError(error?.message || "Invite link could not be regenerated.", 500);

  const origin = new URL(request.url).origin;
  return jsonOk({
    trip_id: params.id,
    invite_code: trip.invite_code,
    invite_url: `${origin}/trips/${params.id}?invite=${encodeURIComponent(trip.invite_code)}`
  });
}
