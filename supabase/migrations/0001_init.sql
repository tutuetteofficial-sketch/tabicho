create extension if not exists pgcrypto;

create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  icon text not null,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  owner_id text not null references users(id) on delete cascade,
  status text not null default 'planning' check (status in ('planning', 'active', 'archived')),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists trip_members (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  trip_nickname text,
  trip_avatar_url text,
  unique (trip_id, user_id)
);

create table if not exists wishlist_items (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  creator_id text not null references users(id) on delete cascade,
  title text not null,
  memo text,
  is_priority boolean not null default false,
  scope text not null default 'trip' check (scope in ('today', 'trip')),
  requester_ids text[] not null default '{}',
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists itinerary_days (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  date date not null,
  unique (trip_id, date)
);

create table if not exists branch_groups (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  start_time time not null,
  end_time time not null,
  label text not null
);

create table if not exists itinerary_items (
  id text primary key default gen_random_uuid()::text,
  day_id text not null references itinerary_days(id) on delete cascade,
  parent_branch_id text references branch_groups(id) on delete set null,
  title text not null,
  start_time text not null,
  end_time text,
  location_name text,
  address text,
  map_url text,
  link_url text,
  link_label text,
  reservation_info text,
  note text,
  transit_duration text,
  transit_memo text,
  transit_photo_note text,
  branch_a_title text,
  branch_a_members text,
  branch_b_title text,
  branch_b_members text,
  rejoin_time text,
  type text not null default 'normal' check (type in ('normal', 'transit', 'split'))
);

create table if not exists expenses (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  title text not null,
  amount integer not null,
  payer_id text not null references users(id) on delete cascade,
  participant_ids text[] not null default '{}',
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists packing_templates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null
);

create table if not exists packing_items (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  name text not null,
  assigned_user_id text references users(id) on delete set null,
  category text,
  checked boolean not null default false,
  locked boolean not null default false
);

create table if not exists todos (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  assigned_user_id text references users(id) on delete set null,
  completed boolean not null default false,
  emphasized boolean not null default false
);

create table if not exists trip_comments (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  category text not null check (category in ('packing', 'todo', 'memo_shared', 'memo_private')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists emergency_info (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade unique,
  hotel_name text,
  hotel_address text,
  flight_number text,
  insurance_info text,
  emergency_contact text
);

create table if not exists food_logs (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  itinerary_item_id text references itinerary_items(id) on delete set null,
  shop_name text not null,
  menu_name text not null,
  price integer,
  rating integer,
  note text,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  uploader_id text not null references users(id) on delete cascade,
  itinerary_item_id text references itinerary_items(id) on delete set null,
  transit_segment_id text,
  category text not null check (category in ('general', 'bestshot', 'food')),
  image_url text not null,
  caption text,
  like_count integer not null default 0,
  cover_candidate boolean not null default false,
  pdf_selected boolean not null default false,
  pdf_caption text,
  created_at timestamptz not null default now()
);

create table if not exists trip_reflections (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  best_food text,
  favorite_view text,
  best_photo_id text,
  comment text,
  next_place text,
  updated_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create table if not exists archives (
  id text primary key default gen_random_uuid()::text,
  trip_id text not null references trips(id) on delete cascade unique,
  pdf_url text,
  summary_json jsonb not null default '{}'::jsonb,
  thumbnail_urls text[] not null default '{}'
);

alter table users enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table wishlist_items enable row level security;
alter table itinerary_days enable row level security;
alter table branch_groups enable row level security;
alter table itinerary_items enable row level security;
alter table expenses enable row level security;
alter table packing_templates enable row level security;
alter table packing_items enable row level security;
alter table todos enable row level security;
alter table trip_comments enable row level security;
alter table emergency_info enable row level security;
alter table food_logs enable row level security;
alter table photos enable row level security;
alter table trip_reflections enable row level security;
alter table archives enable row level security;

