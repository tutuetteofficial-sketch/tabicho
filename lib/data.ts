import { demoTripSnapshot } from "./demo-data";
import { createServerSupabaseClient, hasSupabaseConfig } from "./supabase";
import type { TripSnapshot } from "./types";

export async function getTripSnapshot(tripId = demoTripSnapshot.trip.id): Promise<TripSnapshot> {
  if (!hasSupabaseConfig()) {
    return {
      ...demoTripSnapshot,
      source: "demo",
      sourceMessage: "Supabase env is not set. Using demo data."
    };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      ...demoTripSnapshot,
      source: "demo",
      sourceMessage: "Supabase client could not be created. Using demo data."
    };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) {
    return {
      ...demoTripSnapshot,
      source: "demo",
      sourceMessage: error?.message || "Trip was not found in Supabase. Using demo data."
    };
  }

  const [members, wishlist, days, expenses, packing, todos, foodLogs, photos, reflections, comments, emergency] = await Promise.all([
    supabase.from("trip_members").select("*, user:users(*)").eq("trip_id", tripId),
    supabase.from("wishlist_items").select("*").eq("trip_id", tripId).order("is_priority", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("itinerary_days").select("*").eq("trip_id", tripId).order("date"),
    supabase.from("expenses").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
    supabase.from("packing_items").select("*").eq("trip_id", tripId),
    supabase.from("todos").select("*").eq("trip_id", tripId).order("due_date"),
    supabase.from("food_logs").select("*").eq("trip_id", tripId),
    supabase.from("photos").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
    supabase.from("trip_reflections").select("*").eq("trip_id", tripId),
    supabase.from("trip_comments").select("*").eq("trip_id", tripId).order("created_at"),
    supabase.from("emergency_info").select("*").eq("trip_id", tripId).maybeSingle()
  ]);

  const dayIds = (days.data || []).map((day) => day.id);
  const itinerary = dayIds.length
    ? await supabase.from("itinerary_items").select("*").in("day_id", dayIds).order("start_time")
    : { data: [] };

  const branches = await supabase.from("branch_groups").select("*").eq("trip_id", tripId);
  const packingTemplates = await supabase.from("packing_templates").select("*").order("name");
  const archive = await supabase.from("archives").select("*").eq("trip_id", tripId).maybeSingle();

  return {
    source: "supabase",
    sourceMessage: "Loaded from Supabase.",
    trip,
    members: members.data || [],
    wishlist: wishlist.data || [],
    days: days.data || [],
    itinerary: itinerary.data || [],
    branches: branches.data || [],
    expenses: expenses.data || [],
    packingTemplates: packingTemplates.data || demoTripSnapshot.packingTemplates,
    packing: packing.data || [],
    todos: todos.data || [],
    emergency: emergency.data || demoTripSnapshot.emergency,
    foodLogs: foodLogs.data || [],
    photos: photos.data || [],
    reflections: reflections.data || demoTripSnapshot.reflections,
    comments: comments.data || demoTripSnapshot.comments,
    archive: archive.data || undefined
  } as TripSnapshot;
}

export function getDemoTripSnapshot() {
  return demoTripSnapshot;
}
