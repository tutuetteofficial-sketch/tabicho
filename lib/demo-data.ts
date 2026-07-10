import type { TripSnapshot } from "./types";

export const demoTripSnapshot: TripSnapshot = {
  trip: {
    id: "trip-kanazawa-2026",
    title: "初夏の金沢 2泊3日",
    destination: "石川・金沢",
    start_date: "2026-06-30",
    end_date: "2026-07-02",
    owner_id: "user-haru",
    status: "active",
    invite_code: "KANAZAWA-1842",
    created_at: "2026-06-01T10:00:00.000Z"
  },
  members: [
    { id: "member-1", trip_id: "trip-kanazawa-2026", user_id: "user-haru", role: "owner", trip_nickname: "春", trip_avatar_url: "linear-gradient(135deg,#2f6f73,#f2c45f)", user: { id: "user-haru", name: "春", icon: "春", created_at: "2026-01-01T00:00:00.000Z" } },
    { id: "member-2", trip_id: "trip-kanazawa-2026", user_id: "user-umi", role: "editor", trip_nickname: "海", trip_avatar_url: "linear-gradient(135deg,#3c6d96,#b9d4df)", user: { id: "user-umi", name: "海", icon: "海", created_at: "2026-01-01T00:00:00.000Z" } },
    { id: "member-3", trip_id: "trip-kanazawa-2026", user_id: "user-ao", role: "editor", trip_nickname: "蒼", trip_avatar_url: "linear-gradient(135deg,#4d8060,#f8f4e4)", user: { id: "user-ao", name: "蒼", icon: "蒼", created_at: "2026-01-01T00:00:00.000Z" } },
    { id: "member-4", trip_id: "trip-kanazawa-2026", user_id: "user-rin", role: "viewer", trip_nickname: "凛", trip_avatar_url: "linear-gradient(135deg,#d86b55,#f0d695)", user: { id: "user-rin", name: "凛", icon: "凛", created_at: "2026-01-01T00:00:00.000Z" } },
    { id: "member-5", trip_id: "trip-kanazawa-2026", user_id: "user-yu", role: "viewer", trip_nickname: "悠", trip_avatar_url: "linear-gradient(135deg,#925849,#253d5b)", user: { id: "user-yu", name: "悠", icon: "悠", created_at: "2026-01-01T00:00:00.000Z" } }
  ],
  wishlist: [
    { id: "list-1", trip_id: "trip-kanazawa-2026", creator_id: "user-haru", title: "金箔ソフトを食べる", memo: "近くに行けたら寄る", is_priority: true, scope: "today", requester_ids: ["user-haru", "user-ao"], completed: false, created_at: "2026-06-30T09:00:00.000Z" },
    { id: "list-2", trip_id: "trip-kanazawa-2026", creator_id: "user-umi", title: "夜のお店を予約する", memo: "候補を見て空き確認", is_priority: true, scope: "today", requester_ids: ["user-umi"], completed: false, created_at: "2026-06-30T09:05:00.000Z" },
    { id: "list-3", trip_id: "trip-kanazawa-2026", creator_id: "user-ao", title: "九谷焼の小皿を探す", memo: "おみやげ候補", is_priority: false, scope: "trip", requester_ids: ["user-ao", "user-rin"], completed: false, created_at: "2026-06-30T09:10:00.000Z" },
    { id: "list-4", trip_id: "trip-kanazawa-2026", creator_id: "user-rin", title: "夜の茶屋街を散歩", memo: "写真を撮りたい", is_priority: false, scope: "trip", requester_ids: ["user-rin"], completed: false, created_at: "2026-06-30T09:15:00.000Z" }
  ],
  days: [
    { id: "day-1", trip_id: "trip-kanazawa-2026", date: "2026-06-30" },
    { id: "day-2", trip_id: "trip-kanazawa-2026", date: "2026-07-01" },
    { id: "day-3", trip_id: "trip-kanazawa-2026", date: "2026-07-02" }
  ],
  itinerary: [
    { id: "item-1", day_id: "day-1", title: "金沢駅 鼓門で集合", start_time: "09:20", end_time: "09:40", location_name: "金沢駅", address: "石川県金沢市木ノ新保町", map_url: "https://www.google.com/maps/search/?api=1&query=金沢駅", note: "アラーム済", type: "normal" },
    { id: "item-2", day_id: "day-1", title: "近江町市場で朝昼ごはん", start_time: "10:40", end_time: "11:50", location_name: "近江町市場", map_url: "https://www.google.com/maps/search/?api=1&query=近江町市場", link_url: "https://tabelog.com/ishikawa/", link_label: "食べログ", note: "海鮮丼候補を現地投票", type: "normal" },
    { id: "item-3", day_id: "day-1", title: "移動: 近江町市場 → 21世紀美術館", start_time: "12:05", end_time: "12:25", note: "市場から美術館へ移動", transit_duration: "徒歩18分", transit_memo: "途中で尾山神社方面の写真も撮れそう", transit_photo_note: "移動中の街並み写真を追加予定", type: "transit" },
    { id: "item-4", day_id: "day-1", title: "別行動: 美術館 / カフェ / 買いもの", start_time: "13:00", end_time: "15:10", note: "15:20 香林坊で再集合", branch_a_title: "21世紀美術館", branch_a_members: "春・海", branch_b_title: "カフェと買いもの", branch_b_members: "蒼・凛・悠", rejoin_time: "15:20 香林坊", type: "split" },
    { id: "item-5", day_id: "day-1", title: "片町で夕食", start_time: "18:30", end_time: "20:20", location_name: "片町", map_url: "https://www.google.com/maps/search/?api=1&query=金沢+片町", link_url: "https://tabelog.com/ishikawa/", link_label: "食べログ", reservation_info: "予約番号 KZ-1842", type: "normal" }
  ],
  branches: [
    { id: "branch-1", trip_id: "trip-kanazawa-2026", start_time: "13:00", end_time: "15:10", label: "A: 21世紀美術館 / B: カフェと買いもの" }
  ],
  expenses: [
    { id: "expense-1", trip_id: "trip-kanazawa-2026", title: "近江町市場", amount: 9860, payer_id: "user-umi", participant_ids: ["user-haru", "user-umi", "user-ao", "user-rin", "user-yu"], category: "food", created_at: "2026-06-30T11:35:00.000Z" },
    { id: "expense-2", trip_id: "trip-kanazawa-2026", title: "タクシー", amount: 2400, payer_id: "user-ao", participant_ids: ["user-haru", "user-ao", "user-yu"], category: "transit", created_at: "2026-06-30T17:05:00.000Z" },
    { id: "expense-3", trip_id: "trip-kanazawa-2026", title: "夕食 片町", amount: 18420, payer_id: "user-haru", participant_ids: ["user-haru", "user-umi", "user-ao", "user-rin", "user-yu"], category: "food", created_at: "2026-06-30T20:40:00.000Z" }
  ],
  packingTemplates: [
    { id: "tpl-1", name: "国内 2泊3日", category: "standard" },
    { id: "tpl-2", name: "推し活遠征", category: "event" },
    { id: "tpl-3", name: "家族旅行", category: "family" }
  ],
  packing: [
    { id: "pack-1", trip_id: "trip-kanazawa-2026", name: "モバイルバッテリー", assigned_user_id: "user-haru", checked: true, locked: true },
    { id: "pack-2", trip_id: "trip-kanazawa-2026", name: "折りたたみ傘", assigned_user_id: "user-umi", checked: false, locked: false },
    { id: "pack-3", trip_id: "trip-kanazawa-2026", name: "常備薬", assigned_user_id: "user-ao", checked: false, locked: false }
  ],
  todos: [
    { id: "todo-1", trip_id: "trip-kanazawa-2026", title: "飛行機チェックイン", due_date: "2026-06-30T18:00:00.000Z", assigned_user_id: "user-haru", completed: false, emphasized: true },
    { id: "todo-2", trip_id: "trip-kanazawa-2026", title: "ホテル予約確認", due_date: "2026-06-28T12:00:00.000Z", assigned_user_id: "user-umi", completed: true },
    { id: "todo-3", trip_id: "trip-kanazawa-2026", title: "美術館チケット購入", due_date: "2026-07-01T09:00:00.000Z", assigned_user_id: "user-ao", completed: false }
  ],
  emergency: {
    id: "emergency-1",
    trip_id: "trip-kanazawa-2026",
    hotel_name: "金沢まちなかホテル",
    hotel_address: "石川県金沢市広坂1-1-1",
    flight_number: "NH751",
    insurance_info: "国内旅行保険 受付番号 TR-2026-1842",
    emergency_contact: "090-0000-0000"
  },
  foodLogs: [
    { id: "food-1", trip_id: "trip-kanazawa-2026", itinerary_item_id: "item-2", shop_name: "近江町 海鮮処", menu_name: "海鮮丼", price: 1980, rating: 5, note: "初日の優勝候補", image_urls: [] },
    { id: "food-2", trip_id: "trip-kanazawa-2026", itinerary_item_id: "item-5", shop_name: "片町 小料理", menu_name: "のどぐろ", price: 3200, rating: 4, note: "みんなでシェア", image_urls: [] }
  ],
  photos: [
    { id: "photo-1", trip_id: "trip-kanazawa-2026", uploader_id: "user-haru", itinerary_item_id: "item-1", category: "general", image_url: "linear-gradient(135deg,#7eb2b4,#f0d695 52%,#925849)", caption: "鼓門で集合", like_count: 5, cover_candidate: true, pdf_selected: true, pdf_caption: "旅の始まり、鼓門の下で集合。", created_at: "2026-06-30T09:30:00.000Z" },
    { id: "photo-2", trip_id: "trip-kanazawa-2026", uploader_id: "user-umi", itinerary_item_id: "item-2", category: "food", image_url: "linear-gradient(135deg,#743a31,#d8a441 52%,#fff2cf)", caption: "海鮮丼", like_count: 3, cover_candidate: false, pdf_selected: true, pdf_caption: "朝から海鮮、優勝。", created_at: "2026-06-30T11:20:00.000Z" },
    { id: "photo-3", trip_id: "trip-kanazawa-2026", uploader_id: "user-ao", itinerary_item_id: "item-4", category: "bestshot", like_count: 7, cover_candidate: true, pdf_selected: true, pdf_caption: "それぞれの午後、金沢らしい時間。", image_url: "linear-gradient(135deg,#375c6b,#f8f4e4 48%,#4d8060)", created_at: "2026-06-30T14:10:00.000Z" },
    { id: "photo-4", trip_id: "trip-kanazawa-2026", uploader_id: "user-rin", itinerary_item_id: null, category: "general", image_url: "linear-gradient(135deg,#253d5b,#b9d4df 55%,#d86b55)", caption: "夜の街歩き", like_count: 2, cover_candidate: false, pdf_selected: false, pdf_caption: "", created_at: "2026-06-30T19:40:00.000Z" },
    { id: "photo-5", trip_id: "trip-kanazawa-2026", uploader_id: "user-ao", itinerary_item_id: null, transit_segment_id: "between-item-1-item-2", category: "general", image_url: "linear-gradient(135deg,#c7d6d8,#3c6d96 55%,#f0d695)", caption: "市場へ向かう途中", like_count: 4, cover_candidate: true, pdf_selected: true, pdf_caption: "市場へ向かう途中の、ちょっといい空気。", created_at: "2026-06-30T10:05:00.000Z" }
  ],
  comments: [
    { id: "comment-1", trip_id: "trip-kanazawa-2026", user_id: "user-rin", category: "packing", body: "レジャーシート欲しかったね笑", created_at: "2026-07-02T11:00:00.000Z" },
    { id: "comment-2", trip_id: "trip-kanazawa-2026", user_id: "user-umi", category: "packing", body: "ヘアアイロン貸してくれてありがとう！", created_at: "2026-07-02T11:05:00.000Z" },
    { id: "comment-3", trip_id: "trip-kanazawa-2026", user_id: "user-ao", category: "todo", body: "ホテル予約の確認、前日にやっておいて正解だった。", created_at: "2026-07-02T11:10:00.000Z" }
  ],
  reflections: [
    { id: "reflection-1", trip_id: "trip-kanazawa-2026", user_id: "user-haru", best_food: "近江町市場の海鮮丼", favorite_view: "鼓門を見上げた朝", best_photo_id: "photo-1", comment: "初日からずっと楽しかった。次はもっとゆっくり市場を歩きたい。", next_place: "能登方面", updated_at: "2026-07-02T10:00:00.000Z" },
    { id: "reflection-2", trip_id: "trip-kanazawa-2026", user_id: "user-umi", best_food: "夜ごはんののどぐろ", favorite_view: "市場へ向かう道", best_photo_id: "photo-5", comment: "移動中の何でもない時間まで良かった。", next_place: "加賀温泉", updated_at: "2026-07-02T10:00:00.000Z" },
    { id: "reflection-3", trip_id: "trip-kanazawa-2026", user_id: "user-ao", best_food: "金箔ソフト", favorite_view: "美術館の中庭", best_photo_id: "photo-3", comment: "別行動して戻ってきた感じも旅っぽくて好き。", next_place: "福井", updated_at: "2026-07-02T10:00:00.000Z" }
  ],
  archive: {
    id: "archive-1",
    trip_id: "trip-kanazawa-2026",
    pdf_url: undefined,
    summary_json: { nextCandidates: ["能登方面", "加賀温泉"] },
    thumbnail_urls: []
  }
};
