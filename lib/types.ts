export type TripStatus = "planning" | "active" | "archived";
export type MemberRole = "owner" | "editor" | "viewer";
export type ItineraryItemType = "normal" | "transit" | "split";
export type PhotoCategory = "general" | "bestshot" | "food";

export type User = {
  id: string;
  name: string;
  icon: string;
  email?: string;
  created_at: string;
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  status: TripStatus;
  invite_code: string;
  created_at: string;
};

export type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  trip_nickname?: string;
  trip_avatar_url?: string;
  user: User;
};

export type TripListItem = {
  id: string;
  trip_id: string;
  creator_id: string;
  title: string;
  memo?: string;
  is_priority: boolean;
  scope: "today" | "trip";
  requester_ids: string[];
  completed?: boolean;
  created_at?: string;
};

export type ItineraryDay = {
  id: string;
  trip_id: string;
  date: string;
};

export type ItineraryItem = {
  id: string;
  day_id: string;
  parent_branch_id?: string | null;
  title: string;
  start_time: string;
  end_time?: string;
  location_name?: string;
  address?: string;
  map_url?: string;
  link_url?: string;
  link_label?: string;
  reservation_info?: string;
  note?: string;
  transit_duration?: string;
  transit_memo?: string;
  transit_photo_note?: string;
  branch_a_title?: string;
  branch_a_members?: string;
  branch_b_title?: string;
  branch_b_members?: string;
  rejoin_time?: string;
  type: ItineraryItemType;
};

export type BranchGroup = {
  id: string;
  trip_id: string;
  start_time: string;
  end_time: string;
  label: string;
};

export type Expense = {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  payer_id: string;
  participant_ids: string[];
  category: string;
  created_at: string;
};

export type PackingTemplate = {
  id: string;
  name: string;
  category: string;
};

export type PackingItem = {
  id: string;
  trip_id: string;
  name: string;
  assigned_user_id?: string;
  category?: string;
  checked: boolean;
  locked: boolean;
};

export type Todo = {
  id: string;
  trip_id: string;
  title: string;
  due_date?: string;
  assigned_user_id?: string;
  completed: boolean;
  emphasized?: boolean;
};

export type EmergencyInfo = {
  id: string;
  trip_id: string;
  hotel_name?: string;
  hotel_address?: string;
  flight_number?: string;
  insurance_info?: string;
  emergency_contact?: string;
};

export type FoodLog = {
  id: string;
  trip_id: string;
  itinerary_item_id?: string;
  shop_name: string;
  menu_name: string;
  price?: number;
  rating?: number;
  note?: string;
  image_urls: string[];
};

export type Photo = {
  id: string;
  trip_id: string;
  uploader_id: string;
  itinerary_item_id?: string | null;
  transit_segment_id?: string | null;
  category: PhotoCategory;
  image_url: string;
  caption?: string;
  like_count?: number;
  cover_candidate?: boolean;
  pdf_selected?: boolean;
  pdf_caption?: string;
  created_at: string;
};

export type TripComment = {
  id: string;
  trip_id: string;
  user_id: string;
  category: "packing" | "todo" | "memo_shared" | "memo_private";
  body: string;
  created_at: string;
};

export type MemberReflection = {
  id: string;
  trip_id: string;
  user_id: string;
  best_food?: string;
  favorite_view?: string;
  best_photo_id?: string;
  comment?: string;
  next_place?: string;
  updated_at: string;
};

export type Archive = {
  id: string;
  trip_id: string;
  pdf_url?: string;
  summary_json: Record<string, unknown>;
  thumbnail_urls: string[];
};

export type TripSnapshot = {
  source?: "demo" | "supabase";
  sourceMessage?: string;
  trip: Trip;
  members: TripMember[];
  wishlist: TripListItem[];
  days: ItineraryDay[];
  itinerary: ItineraryItem[];
  branches: BranchGroup[];
  expenses: Expense[];
  packingTemplates: PackingTemplate[];
  packing: PackingItem[];
  todos: Todo[];
  emergency: EmergencyInfo;
  foodLogs: FoodLog[];
  photos: Photo[];
  reflections: MemberReflection[];
  comments: TripComment[];
  archive?: Archive;
};
