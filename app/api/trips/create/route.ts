import { jsonError, jsonOk, readJson } from "@/lib/api-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

const MAX_TRIP_DAYS = 60;

function displayName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
}

function avatarFromName(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "M";
}

function itineraryDates(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;

  const dates: string[] = [];
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getTime() + 86_400_000)) {
    dates.push(cursor.toISOString().slice(0, 10));
    if (dates.length > MAX_TRIP_DAYS) return null;
  }
  return dates;
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return jsonError("Login is required.", 401);

  const supabase = createServerSupabaseClient();
  if (!supabase) return jsonError("Supabase is not configured.", 500);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return jsonError("Login could not be verified.", 401);

  const body = await readJson(request);
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const destination = typeof body.destination === "string" ? body.destination.trim().slice(0, 80) : "";
  const startDate = typeof body.start_date === "string" ? body.start_date : "";
  const endDate = typeof body.end_date === "string" ? body.end_date : "";
  const dates = itineraryDates(startDate, endDate);

  if (!title || !destination) return jsonError("Trip name and destination are required.", 400);
  if (!dates) return jsonError(`Choose a valid trip period of ${MAX_TRIP_DAYS} days or less.`, 400);

  const user = authData.user;
  const name = displayName(user);
  const { error: userError } = await supabase.from("users").upsert({
    id: user.id,
    name,
    icon: avatarFromName(name),
    email: user.email || null
  }, { onConflict: "id" });
  if (userError) return jsonError(userError.message, 500);

  const tripId = `trip-${crypto.randomUUID()}`;
  const inviteCode = `TABICHO-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  const trip = {
    id: tripId,
    title,
    destination,
    start_date: startDate,
    end_date: endDate,
    owner_id: user.id,
    status: "planning",
    invite_code: inviteCode
  };

  const { data: savedTrip, error: tripError } = await supabase.from("trips").insert(trip).select("*").maybeSingle();
  if (tripError || !savedTrip) return jsonError(tripError?.message || "Trip could not be created.", 500);

  const cleanup = async () => {
    await supabase.from("trips").delete().eq("id", tripId);
  };

  const { error: memberError } = await supabase.from("trip_members").insert({
    id: `member-${crypto.randomUUID()}`,
    trip_id: tripId,
    user_id: user.id,
    role: "owner",
    trip_nickname: name,
    trip_avatar_url: ""
  });
  if (memberError) {
    await cleanup();
    return jsonError(memberError.message, 500);
  }

  const { error: daysError } = await supabase.from("itinerary_days").insert(
    dates.map((date) => ({ id: `day-${crypto.randomUUID()}`, trip_id: tripId, date }))
  );
  if (daysError) {
    await cleanup();
    return jsonError(daysError.message, 500);
  }

  return jsonOk({ trip: savedTrip, trip_url: `/trips/${tripId}` });
}
