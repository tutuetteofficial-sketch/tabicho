insert into users (id, name, icon, email, created_at) values
  ('user-haru', 'Haru', 'H', null, '2026-01-01T00:00:00.000Z'),
  ('user-umi', 'Umi', 'U', null, '2026-01-01T00:00:00.000Z'),
  ('user-ao', 'Ao', 'A', null, '2026-01-01T00:00:00.000Z'),
  ('user-rin', 'Rin', 'R', null, '2026-01-01T00:00:00.000Z'),
  ('user-yu', 'Yu', 'Y', null, '2026-01-01T00:00:00.000Z')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon;

insert into trips (id, title, destination, start_date, end_date, owner_id, status, invite_code, created_at) values
  ('trip-kanazawa-2026', 'Kanazawa 2 nights', 'Kanazawa', '2026-06-30', '2026-07-02', 'user-haru', 'active', 'KANAZAWA-1842', '2026-06-30T00:00:00.000Z')
on conflict (id) do update set
  title = excluded.title,
  destination = excluded.destination,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  owner_id = excluded.owner_id,
  status = excluded.status,
  invite_code = excluded.invite_code;

insert into trip_members (id, trip_id, user_id, role, trip_nickname, trip_avatar_url) values
  ('member-1', 'trip-kanazawa-2026', 'user-haru', 'owner', 'Haru', 'linear-gradient(135deg,#2f6f73,#f2c45f)'),
  ('member-2', 'trip-kanazawa-2026', 'user-umi', 'editor', 'Umi', 'linear-gradient(135deg,#3c6d96,#b9d4df)'),
  ('member-3', 'trip-kanazawa-2026', 'user-ao', 'editor', 'Ao', 'linear-gradient(135deg,#4d8060,#f8f4e4)'),
  ('member-4', 'trip-kanazawa-2026', 'user-rin', 'viewer', 'Rin', 'linear-gradient(135deg,#d86b55,#f0d695)'),
  ('member-5', 'trip-kanazawa-2026', 'user-yu', 'viewer', 'Yu', 'linear-gradient(135deg,#925849,#253d5b)')
on conflict (trip_id, user_id) do update set
  role = excluded.role,
  trip_nickname = excluded.trip_nickname,
  trip_avatar_url = excluded.trip_avatar_url;

insert into itinerary_days (id, trip_id, date) values
  ('day-1', 'trip-kanazawa-2026', '2026-06-30'),
  ('day-2', 'trip-kanazawa-2026', '2026-07-01'),
  ('day-3', 'trip-kanazawa-2026', '2026-07-02')
on conflict (trip_id, date) do nothing;

insert into itinerary_items (id, day_id, title, start_time, end_time, location_name, address, map_url, link_url, link_label, reservation_info, note, transit_duration, transit_memo, transit_photo_note, branch_a_title, branch_a_members, branch_b_title, branch_b_members, rejoin_time, type) values
  ('item-1', 'day-1', 'Meet at Kanazawa Station', '09:20', '09:40', 'Kanazawa Station', 'Kanazawa', 'https://www.google.com/maps/search/?api=1&query=Kanazawa+Station', null, null, null, 'Alarm set', null, null, null, null, null, null, null, null, 'normal'),
  ('item-2', 'day-1', 'Breakfast-lunch at Omicho Market', '10:40', '11:50', 'Omicho Market', null, 'https://www.google.com/maps/search/?api=1&query=Omicho+Market', 'https://tabelog.com/ishikawa/', 'Tabelog', null, 'Seafood bowl candidates', null, null, null, null, null, null, null, null, 'normal'),
  ('item-3', 'day-1', 'Move to 21st Century Museum', '12:05', '12:25', null, null, null, null, null, null, 'Walk from market to museum', '18 min walk', 'Good street photos on the way', 'Transit memory slot', null, null, null, null, null, 'transit'),
  ('item-4', 'day-1', 'Split time: museum / cafe / shopping', '13:00', '15:10', null, null, null, null, null, null, 'Meet again at 15:20', null, null, null, '21st Century Museum', 'Haru, Umi', 'Cafe and shopping', 'Ao, Rin, Yu', '15:20 Korinbo', 'split'),
  ('item-5', 'day-1', 'Dinner in Katamachi', '18:30', '20:20', 'Katamachi', null, 'https://www.google.com/maps/search/?api=1&query=Kanazawa+Katamachi', 'https://tabelog.com/ishikawa/', 'Tabelog', 'KZ-1842', null, null, null, null, null, null, null, null, null, 'normal')
on conflict (id) do update set
  title = excluded.title,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  note = excluded.note,
  type = excluded.type;

insert into branch_groups (id, trip_id, start_time, end_time, label) values
  ('branch-1', 'trip-kanazawa-2026', '13:00', '15:10', 'Museum / cafe and shopping')
on conflict (id) do nothing;

insert into packing_templates (id, name, category) values
  ('tpl-1', 'Domestic 2 nights', 'standard'),
  ('tpl-2', 'Live event trip', 'event'),
  ('tpl-3', 'Family trip', 'family')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category;

insert into packing_items (id, trip_id, name, assigned_user_id, category, checked, locked) values
  ('pack-1', 'trip-kanazawa-2026', 'Mobile battery', 'user-haru', 'Valuables', true, true),
  ('pack-2', 'trip-kanazawa-2026', 'Folding umbrella', 'user-umi', 'Other', false, false),
  ('pack-3', 'trip-kanazawa-2026', 'Medicine', 'user-ao', 'Health', false, false)
on conflict (id) do update set
  name = excluded.name,
  assigned_user_id = excluded.assigned_user_id,
  category = excluded.category,
  checked = excluded.checked,
  locked = excluded.locked;

insert into todos (id, trip_id, title, due_date, assigned_user_id, completed, emphasized) values
  ('todo-1', 'trip-kanazawa-2026', 'Flight check-in', '2026-06-30T18:00:00.000Z', 'user-haru', false, true),
  ('todo-2', 'trip-kanazawa-2026', 'Hotel reservation check', '2026-06-28T12:00:00.000Z', 'user-umi', true, false),
  ('todo-3', 'trip-kanazawa-2026', 'Museum ticket', '2026-07-01T09:00:00.000Z', 'user-ao', false, false)
on conflict (id) do update set
  title = excluded.title,
  due_date = excluded.due_date,
  assigned_user_id = excluded.assigned_user_id,
  completed = excluded.completed,
  emphasized = excluded.emphasized;

insert into wishlist_items (id, trip_id, creator_id, title, memo, is_priority, scope, requester_ids, completed, created_at) values
  ('list-1', 'trip-kanazawa-2026', 'user-haru', 'Eat gold leaf soft serve', 'If nearby', true, 'today', array['user-haru','user-ao'], false, '2026-06-30T09:00:00.000Z'),
  ('list-2', 'trip-kanazawa-2026', 'user-umi', 'Reserve dinner place', 'Check openings', true, 'today', array['user-umi'], false, '2026-06-30T09:05:00.000Z'),
  ('list-3', 'trip-kanazawa-2026', 'user-ao', 'Find Kutani plate', 'Souvenir idea', false, 'trip', array['user-ao','user-rin'], false, '2026-06-30T09:10:00.000Z')
on conflict (id) do update set
  title = excluded.title,
  memo = excluded.memo,
  is_priority = excluded.is_priority,
  scope = excluded.scope,
  requester_ids = excluded.requester_ids,
  completed = excluded.completed;

insert into expenses (id, trip_id, title, amount, payer_id, participant_ids, category, created_at) values
  ('expense-1', 'trip-kanazawa-2026', 'Omicho Market', 9860, 'user-umi', array['user-haru','user-umi','user-ao','user-rin','user-yu'], 'food', '2026-06-30T11:35:00.000Z'),
  ('expense-2', 'trip-kanazawa-2026', 'Taxi', 2400, 'user-ao', array['user-haru','user-ao','user-yu'], 'transit', '2026-06-30T17:05:00.000Z')
on conflict (id) do update set
  title = excluded.title,
  amount = excluded.amount,
  payer_id = excluded.payer_id,
  participant_ids = excluded.participant_ids,
  category = excluded.category;

insert into photos (id, trip_id, uploader_id, itinerary_item_id, transit_segment_id, category, image_url, caption, like_count, cover_candidate, pdf_selected, pdf_caption, created_at) values
  ('photo-1', 'trip-kanazawa-2026', 'user-haru', 'item-1', null, 'general', 'linear-gradient(135deg,#7eb2b4,#f0d695 52%,#925849)', 'Meet-up photo', 5, true, true, 'The trip starts at the station.', '2026-06-30T09:30:00.000Z'),
  ('photo-2', 'trip-kanazawa-2026', 'user-umi', 'item-2', null, 'general', 'linear-gradient(135deg,#743a31,#d8a441 52%,#fff2cf)', 'Market lunch', 3, false, true, 'A very good lunch.', '2026-06-30T11:20:00.000Z'),
  ('photo-3', 'trip-kanazawa-2026', 'user-ao', 'item-4', null, 'bestshot', 'linear-gradient(135deg,#375c6b,#f8f4e4 48%,#4d8060)', 'Afternoon best shot', 7, true, true, 'A calm afternoon in Kanazawa.', '2026-06-30T14:10:00.000Z'),
  ('photo-5', 'trip-kanazawa-2026', 'user-ao', null, 'between-item-1-item-2', 'general', 'linear-gradient(135deg,#c7d6d8,#3c6d96 55%,#f0d695)', 'On the way to market', 4, true, true, 'A small memory between plans.', '2026-06-30T10:05:00.000Z')
on conflict (id) do update set
  caption = excluded.caption,
  like_count = excluded.like_count,
  cover_candidate = excluded.cover_candidate,
  pdf_selected = excluded.pdf_selected,
  pdf_caption = excluded.pdf_caption;

insert into trip_comments (id, trip_id, user_id, category, body, created_at) values
  ('comment-1', 'trip-kanazawa-2026', 'user-rin', 'packing', 'Wanted a leisure sheet next time.', '2026-07-02T11:00:00.000Z'),
  ('comment-2', 'trip-kanazawa-2026', 'user-umi', 'todo', 'Checking the hotel reservation early was helpful.', '2026-07-02T11:10:00.000Z')
on conflict (id) do update set
  body = excluded.body,
  category = excluded.category;

insert into trip_reflections (id, trip_id, user_id, best_food, favorite_view, best_photo_id, comment, next_place, updated_at) values
  ('reflection-1', 'trip-kanazawa-2026', 'user-haru', 'Seafood bowl', 'Station gate in the morning', 'photo-1', 'The first day was already fun.', 'Noto', '2026-07-02T10:00:00.000Z'),
  ('reflection-2', 'trip-kanazawa-2026', 'user-umi', 'Dinner fish', 'Street to the market', 'photo-5', 'Even the transit time felt nice.', 'Kaga Onsen', '2026-07-02T10:00:00.000Z'),
  ('reflection-3', 'trip-kanazawa-2026', 'user-ao', 'Gold leaf soft serve', 'Museum garden', 'photo-3', 'Splitting up and meeting again felt like a real trip.', 'Fukui', '2026-07-02T10:00:00.000Z')
on conflict (trip_id, user_id) do update set
  best_food = excluded.best_food,
  favorite_view = excluded.favorite_view,
  best_photo_id = excluded.best_photo_id,
  comment = excluded.comment,
  next_place = excluded.next_place,
  updated_at = excluded.updated_at;

insert into emergency_info (id, trip_id, hotel_name, hotel_address, flight_number, insurance_info, emergency_contact) values
  ('emergency-1', 'trip-kanazawa-2026', 'Sample Hotel Kanazawa', 'Kanazawa', 'JL1842', 'Travel insurance sample', '090-0000-0000')
on conflict (trip_id) do update set
  hotel_name = excluded.hotel_name,
  hotel_address = excluded.hotel_address,
  flight_number = excluded.flight_number,
  insurance_info = excluded.insurance_info,
  emergency_contact = excluded.emergency_contact;
