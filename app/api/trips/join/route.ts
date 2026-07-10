import { jsonError, jsonOk, readJson } from "@/lib/api-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

function avatarFromName(name: string) {
  const first = name.trim().slice(0, 1).toUpperCase();
  return first || "M";
}

function nameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonError("Supabase is not configured.", 500);

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return jsonError("Login is required.", 401);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return jsonError("Login could not be verified.", 401);

  const body = await readJson(request);
  const tripId = typeof body.trip_id === "string" ? body.trip_id : "";
  const inviteCode = typeof body.invite_code === "string" ? body.invite_code : "";
  if (!tripId || !inviteCode) return jsonError("Trip and invite code are required.", 400);

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, invite_code")
    .eq("id", tripId)
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (tripError || !trip) return jsonError("Invite link is invalid.", 403);

  const email = authData.user.email || "";
  const displayName =
    (authData.user.user_metadata?.full_name as string | undefined) ||
    (authData.user.user_metadata?.name as string | undefined) ||
    nameFromEmail(email);
  const userId = authData.user.id;

  const { error: userError } = await supabase.from("users").upsert({
    id: userId,
    name: displayName,
    icon: avatarFromName(displayName),
    email: email || null
  });

  if (userError) return jsonError(userError.message, 500);

  const memberId = `member-${tripId}-${userId}`;
  const { data: member, error: memberError } = await supabase
    .from("trip_members")
    .upsert(
      {
        id: memberId,
        trip_id: tripId,
        user_id: userId,
        role: "editor",
        trip_nickname: displayName,
        trip_avatar_url: ""
      },
      { onConflict: "trip_id,user_id" }
    )
    .select("*, user:users(*)")
    .maybeSingle();

  if (memberError || !member) return jsonError(memberError?.message || "Member could not be created.", 500);

  return jsonOk(member);
}
