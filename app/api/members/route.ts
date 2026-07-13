import { jsonError, jsonOk, readJson } from "@/lib/api-utils";
import { getTripActor, requireTripMember } from "@/lib/api-auth";
import { getDemoTripSnapshot } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";
import { saveRow, selectRows } from "@/lib/server-crud";

export async function GET(request: Request) {
  const fallback = getDemoTripSnapshot().members;
  const authError = await requireTripMember(request, getDemoTripSnapshot().trip.id);
  if (authError) return authError;
  return jsonOk(await selectRows("trip_members", fallback, { tripId: getDemoTripSnapshot().trip.id }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const snapshot = getDemoTripSnapshot();
  const tripId = typeof body.trip_id === "string" ? body.trip_id : snapshot.trip.id;
  const { actor, error: authError } = await getTripActor(request, tripId);
  if (authError) return authError;
  if (!actor) return jsonError("Login is required.", 401);

  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonError("Supabase is not configured.", 500);
  const targetId = typeof body.id === "string" ? body.id : "";
  const targetUserId = typeof body.user_id === "string" ? body.user_id : "";

  if (body.action === "update-role" || body.action === "remove") {
    if (actor.role !== "owner") return jsonError("Only the trip owner can manage members.", 403);
    if (!targetId || !targetUserId) return jsonError("Member is required.", 400);
    if (targetUserId === actor.userId) return jsonError("You cannot change your own owner access.", 400);

    const { data: target } = await supabase
      .from("trip_members")
      .select("role")
      .eq("id", targetId)
      .eq("trip_id", tripId)
      .maybeSingle();
    if (!target) return jsonError("Member was not found.", 404);
    if (target.role === "owner") return jsonError("Another owner cannot be changed here.", 400);

    if (body.action === "remove") {
      const { error } = await supabase.from("trip_members").delete().eq("id", targetId).eq("trip_id", tripId);
      if (error) return jsonError(error.message, 500);
      return jsonOk({ id: targetId });
    }

    const role = body.role === "viewer" ? "viewer" : body.role === "editor" ? "editor" : null;
    if (!role) return jsonError("Role must be editor or viewer.", 400);
    const { data: member, error } = await supabase
      .from("trip_members")
      .update({ role })
      .eq("id", targetId)
      .eq("trip_id", tripId)
      .select("*, user:users(*)")
      .maybeSingle();
    if (error || !member) return jsonError(error?.message || "Member could not be updated.", 500);
    return jsonOk(member);
  }

  if (targetUserId !== actor.userId && actor.role !== "owner") {
    return jsonError("You can only edit your own profile.", 403);
  }
  const fallback = {
    id: body.id ?? "member-" + Date.now(),
    trip_id: tripId,
    user_id: body.user_id ?? snapshot.members[0].user_id,
    trip_nickname: body.trip_nickname ?? "",
    trip_avatar_url: body.trip_avatar_url ?? ""
  };
  return jsonOk(await saveRow("trip_members", fallback, fallback));
}
