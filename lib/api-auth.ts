import { jsonError } from "./api-utils";
import { createServerSupabaseClient, hasSupabaseConfig } from "./supabase";

export type TripActor = {
  userId: string;
  role: "owner" | "editor" | "viewer";
};

export async function getTripActor(request: Request, tripId: string): Promise<{ actor: TripActor | null; error: Response | null }> {
  if (!hasSupabaseConfig()) return { actor: null, error: null };
  if (!tripId) return { actor: null, error: jsonError("Trip is required.", 400) };

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { actor: null, error: jsonError("Login is required.", 401) };

  const supabase = createServerSupabaseClient();
  if (!supabase) return { actor: null, error: jsonError("Supabase is not configured.", 500) };

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return { actor: null, error: jsonError("Login could not be verified.", 401) };
  }

  const { data: member, error: memberError } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (memberError || !member) {
    return { actor: null, error: jsonError("You are not a member of this trip.", 403) };
  }

  return {
    actor: { userId: authData.user.id, role: member.role as TripActor["role"] },
    error: null
  };
}

async function requireTripAccess(request: Request, tripId: string, allowViewer: boolean) {
  const { actor, error } = await getTripActor(request, tripId);
  if (error) return error;
  if (!actor) return null;
  if (!allowViewer && actor.role === "viewer") return jsonError("This trip is read-only for your account.", 403);
  return null;
}

export function requireTripMember(request: Request, tripId: string) {
  return requireTripAccess(request, tripId, true);
}

export function requireTripEditor(request: Request, tripId: string) {
  return requireTripAccess(request, tripId, false);
}

export async function tripIdForItineraryDay(dayId: string) {
  if (!dayId || !hasSupabaseConfig()) return "";
  const supabase = createServerSupabaseClient();
  if (!supabase) return "";

  const { data } = await supabase
    .from("itinerary_days")
    .select("trip_id")
    .eq("id", dayId)
    .maybeSingle();

  return typeof data?.trip_id === "string" ? data.trip_id : "";
}
