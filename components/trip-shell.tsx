"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { postJson } from "@/lib/api-client";
import type { Expense, ItineraryItem, MemberReflection, PackingItem, Photo, Todo, TripListItem, TripMember, TripSnapshot } from "@/lib/types";

type PageId = "dashboard" | "prep" | "itinerary" | "money" | "album" | "pdf" | "settings";
type PlanFormState = {
  title: string;
  start_time: string;
  link_url: string;
  note: string;
  isNow: boolean;
};
type TodoFormState = {
  title: string;
  assigned_user_id: string;
  due_date: string;
  emphasized: boolean;
};
type ExpenseFormState = {
  title: string;
  amount: string;
  payer_id: string;
  category: string;
};
type PackingFormState = {
  name: string;
  assigned_user_id: string;
  category: string;
};
type PhotoTarget = {
  itinerary_item_id?: string | null;
  transit_segment_id?: string | null;
  category?: Photo["category"];
  label?: string;
};
type PhotoFormState = {
  target?: PhotoTarget;
  existingId?: string;
  caption: string;
  image_url: string;
  isBestshot: boolean;
};

const pages: { id: PageId; label: string; short: string; lead: string }[] = [
  { id: "dashboard", label: "今回の旅", short: "今回", lead: "旅行中の予定、やること、写真、メモへすぐ動ける画面です。" },
  { id: "prep", label: "準備", short: "準備", lead: "持ち物と旅行中にやることをまとめて管理します。" },
  { id: "itinerary", label: "スケジュール", short: "日程", lead: "実際の行程として、地図や食べログなどのリンクも保存できます。" },
  { id: "money", label: "お金", short: "お金", lead: "支払い、立て替え、最終精算をまとめます。" },
  { id: "album", label: "写真", short: "写真", lead: "スケジュール投稿写真と、独立したベストショットを残します。" },
  { id: "pdf", label: "PDF作成", short: "PDF", lead: "旅のしおり風アーカイブを目次順に確認します。" },
  { id: "settings", label: "設定", short: "設定", lead: "権限、招待リンク、旅行終了を管理します。" }
];

const tripChoices = [
  { id: "trip-kanazawa-2026", title: "初夏の金沢2泊3日", destination: "金沢", startDate: "2026-06-30", status: "active" },
  { id: "trip-osaka-live-2026", title: "大阪ライブ遠征", destination: "大阪", startDate: "2026-08-22", status: "planning" },
  { id: "trip-hakone-family-2026", title: "箱根家族旅行", destination: "箱根", startDate: "2026-09-14", status: "planning" }
] as const;

const packingCategories = ["貴重品", "衣類", "洗面用具", "薬・衛生用品", "生活用品", "その他"];
const templateItems = [
  "パスポート（コピーも）",
  "財布（クレカ、現金）",
  "宿予約証",
  "スマホ",
  "充電器（変換プラグ）",
  "モバイルバッテリー",
  "私服",
  "上着",
  "下着",
  "靴下",
  "部屋着",
  "タオル",
  "シャンプー",
  "洗顔フォーム",
  "歯みがきセット",
  "日焼け止め",
  "胃薬",
  "目薬",
  "絆創膏",
  "ウェットティッシュ",
  "折り畳み傘",
  "エコバッグ",
  "イヤホン",
  "ビニール袋",
  "ジップロック",
  "レジャーシート"
];

export function TripShell({ initialSnapshot, inviteCode = null }: { initialSnapshot: TripSnapshot; inviteCode?: string | null }) {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [selectedTripId, setSelectedTripId] = useState(initialSnapshot.trip.id);
  const [members, setMembers] = useState(initialSnapshot.members);
  const [currentUserId, setCurrentUserId] = useState(initialSnapshot.members[0]?.user_id || "");
  const [wishlist, setWishlist] = useState(initialSnapshot.wishlist);
  const [itinerary, setItinerary] = useState(initialSnapshot.itinerary);
  const [packing, setPacking] = useState(initialSnapshot.packing);
  const [todos, setTodos] = useState(initialSnapshot.todos);
  const [expenses, setExpenses] = useState(initialSnapshot.expenses);
  const [photos, setPhotos] = useState(initialSnapshot.photos);
  const [reflections, setReflections] = useState(initialSnapshot.reflections);
  const [toast, setToast] = useState("");
  const [planForm, setPlanForm] = useState<PlanFormState | null>(null);
  const [todoForm, setTodoForm] = useState<TodoFormState | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState | null>(null);
  const [packingForm, setPackingForm] = useState<PackingFormState | null>(null);
  const [photoForm, setPhotoForm] = useState<PhotoFormState | null>(null);
  const selectedTrip = tripChoices.find((trip) => trip.id === selectedTripId) || tripChoices[0];
  const page = pages.find((item) => item.id === activePage) || pages[0];
  const canEdit = initialSnapshot.trip.status !== "archived";
  const today = initialSnapshot.days[0];
  const upcomingItems = useMemo(() => [...itinerary].sort(sortByTime).slice(0, 5), [itinerary]);
  const nextItem = upcomingItems[0];
  const currentMember = members.find((member) => member.user_id === currentUserId) || members[0];
  const isSupabaseSource = initialSnapshot.source === "supabase";

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function switchPage(pageId: PageId) {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requireEditable() {
    if (canEdit) return true;
    showToast("アーカイブ後は閲覧のみです");
    return false;
  }

  async function copyInviteUrl() {
    const base = window.location.origin || "http://127.0.0.1:3000";
    const url = `${base}/trips/${initialSnapshot.trip.id}?invite=${initialSnapshot.trip.invite_code}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("招待URLをコピーしました");
    } catch {
      showToast(url);
    }
  }

  function openArchivePrint() {
    const base = window.location.origin || "http://127.0.0.1:3000";
    window.open(`${base}/archive/${initialSnapshot.trip.id}/print`, "_blank", "noopener,noreferrer");
  }

  function openPlanForm(now = false) {
    if (!requireEditable()) return;
    setPlanForm({
      title: now ? "いまいる場所をメモ" : "",
      start_time: now ? currentClockTime() : "10:00",
      link_url: "",
      note: now ? "旅行中に追加" : "",
      isNow: now
    });
  }

  function updatePlanForm(patch: Partial<PlanFormState>) {
    setPlanForm((form) => form ? { ...form, ...patch } : form);
  }

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireEditable() || !planForm) return;
    const title = planForm.title.trim();
    if (!title) {
      showToast("予定名を入力してください");
      return;
    }
    const link = planForm.link_url.trim();
    const draft: ItineraryItem = {
      id: "local-" + Date.now(),
      day_id: today.id,
      title,
      start_time: planForm.start_time || currentClockTime(),
      link_url: normalizeUrl(link),
      link_label: guessLinkLabel(link),
      map_url: link.includes("maps") ? normalizeUrl(link) : undefined,
      note: planForm.note.trim() || undefined,
      type: "normal"
    };
    const saved = await postJson<ItineraryItem>("/api/itinerary", draft);
    setItinerary((items) => [saved ?? draft, ...items]);
    setPlanForm(null);
    showToast("スケジュールに追加しました");
  }

  async function deletePlan(item: ItineraryItem) {
    if (!requireEditable()) return;
    if (!window.confirm("この予定を削除しますか？ " + item.title)) return;
    setItinerary((items) => items.filter((candidate) => candidate.id !== item.id));
    await postJson("/api/itinerary", { ...item, action: "delete" });
    showToast("予定を削除しました");
  }

  async function addWish() {
    if (!requireEditable()) return;
    const title = window.prompt("やりたいこと・やること", "夜のお店を予約する");
    if (!title) return;
    const draft: TripListItem = {
      id: "local-list-" + Date.now(),
      trip_id: initialSnapshot.trip.id,
      creator_id: currentUserId || "user-local",
      title,
      memo: window.prompt("メモ（空でもOK）", "") || undefined,
      is_priority: window.confirm("優先するものにしますか？"),
      scope: "trip",
      requester_ids: [currentUserId || "user-local"],
      completed: false,
      created_at: new Date().toISOString()
    };
    const saved = await postJson<TripListItem>("/api/wishlist", draft);
    setWishlist((items) => [saved ?? draft, ...items].sort(sortTripListItems));
    showToast("リストに追加しました");
  }

  async function toggleWish(item: TripListItem) {
    if (!requireEditable()) return;
    const next = { ...item, completed: !item.completed };
    setWishlist((items) => items.map((candidate) => candidate.id === item.id ? next : candidate).sort(sortTripListItems));
    await postJson<TripListItem>("/api/wishlist", { ...next, action: "toggle-complete" });
  }

  async function moveWishToPlan(item: TripListItem) {
    if (!requireEditable()) return;
    const draft: ItineraryItem = { id: "local-" + Date.now(), day_id: today.id, title: item.title, start_time: "今", note: "リストから移動", map_url: buildMapUrl(item.title), type: "normal" };
    const saved = await postJson<ItineraryItem>("/api/itinerary", draft);
    setItinerary((items) => [saved ?? draft, ...items]);
    showToast("スケジュールに移動しました");
  }

  async function deleteWish(item: TripListItem) {
    if (!requireEditable()) return;
    setWishlist((items) => items.filter((candidate) => candidate.id !== item.id));
    await postJson("/api/wishlist", { ...item, action: "delete" });
  }

  function openPackingForm(name = "") {
    if (!requireEditable()) return;
    setPackingForm({
      name,
      assigned_user_id: currentUserId || "",
      category: name ? categoryOfPackingItem(name) : "その他"
    });
  }

  function updatePackingForm(patch: Partial<PackingFormState>) {
    setPackingForm((form) => {
      if (!form) return form;
      const next = { ...form, ...patch };
      if (patch.name !== undefined && form.category === categoryOfPackingItem(form.name)) {
        next.category = categoryOfPackingItem(patch.name);
      }
      return next;
    });
  }

  async function submitPacking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireEditable() || !packingForm) return;
    const itemName = packingForm.name.trim();
    if (!itemName) {
      showToast("持ち物を入力してください");
      return;
    }
    const draft: PackingItem = {
      id: "local-pack-" + Date.now(),
      trip_id: initialSnapshot.trip.id,
      name: itemName,
      assigned_user_id: packingForm.assigned_user_id || undefined,
      category: categoryOfPackingItem(itemName, packingForm.category),
      checked: false,
      locked: false
    };
    const saved = await postJson<PackingItem>("/api/packing", draft);
    setPacking((items) => [saved ?? draft, ...items]);
    setPackingForm(null);
    showToast("持ち物を追加しました");
  }

  async function applyPackingTemplate() {
    if (!requireEditable()) return;
    const existing = new Set(packing.map((item) => item.name));
    const drafts = templateItems.filter((name) => !existing.has(name)).map((name, index): PackingItem => ({
      id: "template-pack-" + Date.now() + "-" + index,
      trip_id: initialSnapshot.trip.id,
      name,
      category: categoryOfPackingItem(name),
      checked: false,
      locked: false
    }));
    const saved = await Promise.all(drafts.map((item) => postJson<PackingItem>("/api/packing", item)));
    setPacking((items) => [...saved.map((item, index) => item ?? drafts[index]), ...items]);
    showToast(drafts.length + "件のテンプレを追加しました");
  }

  async function togglePacking(item: PackingItem) {
    if (!requireEditable()) return;
    const next = { ...item, checked: !item.checked };
    setPacking((items) => items.map((candidate) => candidate.id === item.id ? next : candidate));
    await postJson<PackingItem>("/api/packing", next);
  }

  async function deletePacking(item: PackingItem) {
    if (!requireEditable()) return;
    setPacking((items) => items.filter((candidate) => candidate.id !== item.id));
    await postJson("/api/packing", { ...item, action: "delete" });
  }

  function openTodoForm() {
    if (!requireEditable()) return;
    setTodoForm({
      title: "",
      assigned_user_id: currentUserId || "",
      due_date: "",
      emphasized: false
    });
  }

  function updateTodoForm(patch: Partial<TodoFormState>) {
    setTodoForm((form) => form ? { ...form, ...patch } : form);
  }

  async function submitTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireEditable() || !todoForm) return;
    const title = todoForm.title.trim();
    if (!title) {
      showToast("やることを入力してください");
      return;
    }
    const draft: Todo = {
      id: "local-todo-" + Date.now(),
      trip_id: initialSnapshot.trip.id,
      title,
      assigned_user_id: todoForm.assigned_user_id || undefined,
      due_date: todoForm.due_date || undefined,
      completed: false,
      emphasized: todoForm.emphasized
    };
    const saved = await postJson<Todo>("/api/todos", draft);
    setTodos((items) => [saved ?? draft, ...items].sort(sortTodos));
    setTodoForm(null);
    showToast("やることを追加しました");
  }

  async function toggleTodo(todo: Todo) {
    if (!requireEditable()) return;
    const next = { ...todo, completed: !todo.completed };
    setTodos((items) => items.map((candidate) => candidate.id === todo.id ? next : candidate).sort(sortTodos));
    await postJson<Todo>("/api/todos", next);
  }

  async function deleteTodo(todo: Todo) {
    if (!requireEditable()) return;
    setTodos((items) => items.filter((candidate) => candidate.id !== todo.id));
    await postJson("/api/todos", { ...todo, action: "delete" });
  }

  function openExpenseForm() {
    if (!requireEditable()) return;
    setExpenseForm({
      title: "",
      amount: "",
      payer_id: currentUserId || members[0]?.user_id || "",
      category: "other"
    });
  }

  function updateExpenseForm(patch: Partial<ExpenseFormState>) {
    setExpenseForm((form) => form ? { ...form, ...patch } : form);
  }

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireEditable() || !expenseForm) return;
    const title = expenseForm.title.trim();
    const amount = Number(expenseForm.amount);
    if (!title) {
      showToast("支払い名を入力してください");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("金額を入力してください");
      return;
    }
    const participants = members.map((member) => member.user_id);
    const draft: Expense = {
      id: "local-expense-" + Date.now(),
      trip_id: initialSnapshot.trip.id,
      title,
      amount,
      payer_id: expenseForm.payer_id || members[0]?.user_id || "",
      participant_ids: participants,
      category: expenseForm.category || "other",
      created_at: new Date().toISOString()
    };
    const saved = await postJson<Expense>("/api/expenses", draft);
    setExpenses((items) => [saved ?? draft, ...items]);
    setExpenseForm(null);
    showToast("支払いを追加しました");
  }

  function addPhoto(target?: PhotoTarget) {
    if (!requireEditable()) return;
    const isBestshot = target?.category === "bestshot";
    if (isBestshot && photos.filter((photo) => photo.category === "bestshot").length >= 25) {
      showToast("ベストショットは25枚までです");
      return;
    }
    const existing = !isBestshot && target ? photos.find((photo) => photo.uploader_id === currentUserId && (target.itinerary_item_id ? photo.itinerary_item_id === target.itinerary_item_id : photo.transit_segment_id === target.transit_segment_id)) : undefined;
    setPhotoForm({
      target,
      existingId: existing?.id,
      caption: existing?.caption || target?.label || "",
      image_url: existing?.image_url || "",
      isBestshot
    });
  }

  function updatePhotoForm(patch: Partial<PhotoFormState>) {
    setPhotoForm((form) => form ? { ...form, ...patch } : form);
  }

  async function handlePhotoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("画像ファイルを選んでください");
      return;
    }
    const imageUrl = await resizeImageFile(file);
    updatePhotoForm({ image_url: imageUrl });
    const uploaded = await postJson<{ image_url: string; stored: boolean }>("/api/photos/upload", {
      trip_id: initialSnapshot.trip.id,
      uploader_id: currentUserId || "user-local",
      data_url: imageUrl
    });
    if (uploaded?.image_url) {
      updatePhotoForm({ image_url: uploaded.image_url });
      showToast(uploaded.stored ? "写真をアップロードしました" : "写真を選択しました");
    }
  }

  async function submitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireEditable() || !photoForm) return;
    if (!photoForm.image_url) {
      showToast("写真を選んでください");
      return;
    }
    const target = photoForm.target;
    const existing = photoForm.existingId ? photos.find((photo) => photo.id === photoForm.existingId) : undefined;
    const draft: Photo = {
      id: existing?.id || (photoForm.isBestshot ? "bestshot-photo-" : "local-photo-") + Date.now(),
      trip_id: initialSnapshot.trip.id,
      uploader_id: currentUserId || "user-local",
      itinerary_item_id: target?.itinerary_item_id ?? null,
      transit_segment_id: target?.transit_segment_id ?? null,
      category: target?.category || existing?.category || "general",
      image_url: photoForm.image_url,
      caption: photoForm.caption.trim() || undefined,
      like_count: existing?.like_count || 0,
      cover_candidate: existing?.cover_candidate || false,
      pdf_selected: existing?.pdf_selected || false,
      pdf_caption: existing?.pdf_caption || undefined,
      created_at: existing?.created_at || new Date().toISOString()
    };
    const saved = await postJson<Photo>("/api/photos", draft);
    const result = saved ?? draft;
    setPhotos((items) => existing ? items.map((photo) => photo.id === result.id ? result : photo) : [result, ...items]);
    setPhotoForm(null);
    showToast(existing ? "写真を変更しました" : "写真を投稿しました");
  }

  async function updatePhoto(photo: Photo, patch: Partial<Photo>) {
    if (!requireEditable()) return;
    const next = { ...photo, ...patch };
    setPhotos((items) => items.map((item) => item.id === photo.id ? next : item));
    await postJson<Photo>("/api/photos", next);
  }

  async function updateReflection(patch: Partial<MemberReflection>) {
    if (!requireEditable()) return;
    const existing = reflections.find((item) => item.user_id === currentUserId);
    const draft: MemberReflection = {
      id: existing?.id || "local-reflection-" + Date.now(),
      trip_id: initialSnapshot.trip.id,
      user_id: currentUserId,
      best_food: "",
      favorite_view: "",
      best_photo_id: "",
      comment: "",
      next_place: "",
      updated_at: new Date().toISOString(),
      ...existing,
      ...patch
    };
    setReflections((items) => existing ? items.map((item) => item.user_id === currentUserId ? draft : item) : [draft, ...items]);
    await postJson<MemberReflection>("/api/reflections", draft);
  }

  async function updateMemberProfile(member: TripMember, patch: Partial<TripMember>) {
    const next = { ...member, ...patch };
    setMembers((items) => items.map((item) => item.id === member.id ? next : item));
    await postJson<TripMember>("/api/members", next);
  }

  function handleMemberJoined(member: TripMember) {
    setMembers((items) => items.some((item) => item.user_id === member.user_id) ? items.map((item) => item.user_id === member.user_id ? member : item) : [...items, member]);
    setCurrentUserId(member.user_id);
  }

  const snapshot = { ...initialSnapshot, members, wishlist, itinerary, packing, todos, expenses, photos, reflections };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">旅</div><div><strong>旅帖</strong><span>みんなで育てる旅のしおり</span></div></div>
        <label className="trip-switch"><small>今回の旅</small><select value={selectedTripId} onChange={(event) => { setSelectedTripId(event.target.value); showToast("プロトタイプでは見た目だけ切り替えています"); }}>{tripChoices.map((trip) => <option key={trip.id} value={trip.id}>{trip.status === "active" ? "進行中" : "計画中"} / {trip.title}</option>)}</select><span>{selectedTrip.destination} / {formatDate(selectedTrip.startDate)}</span></label>
        <nav className="nav" aria-label="主な画面">{pages.map((item) => <button key={item.id} className={activePage === item.id ? "active" : ""} onClick={() => switchPage(item.id)}><span className="nav-icon">{item.short}</span>{item.label}</button>)}</nav>
        <AuthPanel onToast={showToast} tripId={initialSnapshot.trip.id} inviteCode={inviteCode} onMemberJoined={handleMemberJoined} />
        <button className="invite-button" onClick={copyInviteUrl}>招待URL <span>コピー</span></button>
        <div className="sidebar-foot">状態: {initialSnapshot.trip.status} / 旅行後はアーカイブ化して閲覧専用にできます。</div>
      </aside>

      <main>
        <header className="topbar">
          <div className="title"><h1>{page.label}</h1><div className="active-trip-title"><span>{selectedTrip.status === "active" ? "進行中" : "計画中"}</span><strong>{selectedTrip.title}</strong></div><p>{page.lead}</p></div>
          <div className="session-tools"><label className="member-switch"><span>操作中</span><select value={currentUserId} onChange={(event) => setCurrentUserId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.user_id}>{displayMemberName(member)} / {member.role}</option>)}</select></label><div className="members">{members.slice(0, 4).map((member, index) => <span className={"avatar " + (member.user_id === currentUserId ? "active" : "")} style={avatarStyle(member, index)} key={member.id}>{avatarText(member)}</span>)}<span className={"pill " + (canEdit ? "" : "readonly")}>{canEdit ? "共同編集中" : "閲覧のみ"}</span></div></div>
        </header>

        <section className={"storage-status " + (isSupabaseSource ? "online" : "demo")}>
          <div>
            <strong>{isSupabaseSource ? "Supabase saved" : "Demo data mode"}</strong>
            <span>{initialSnapshot.sourceMessage || (isSupabaseSource ? "Loaded from Supabase." : "Using local demo data.")}</span>
          </div>
          <a href="/launch">Open launch check</a>
        </section>

        {inviteCode ? <section className="archive-entry-banner"><div><small>招待リンクから開いています</small><strong>{inviteCode === initialSnapshot.trip.invite_code ? "参加リンク確認済み" : "招待コードを確認してください"}</strong><p>冊子QRはあとから見返す入口として使い、旅行中は写真タブから投稿します。</p></div><div className="archive-entry-actions"><button className="primary" onClick={() => switchPage("album")}>写真タブを開く</button><button className="secondary" onClick={openArchivePrint}>冊子プレビュー</button></div></section> : null}

        {activePage === "dashboard" ? <Dashboard snapshot={snapshot} nextItem={nextItem} upcomingItems={upcomingItems} wishlist={wishlist} expenses={expenses} onAddNow={() => openPlanForm(true)} onAddPlan={() => openPlanForm(false)} onAddWish={addWish} onMoveWish={moveWishToPlan} onToggleWish={toggleWish} onDeleteWish={deleteWish} onMoney={() => switchPage("money")} onAlbum={() => switchPage("album")} onMemo={() => showToast("メモ機能は次に本物化します")} onWeather={() => window.open("https://www.google.com/search?q=" + encodeURIComponent((nextItem?.location_name || selectedTrip.destination) + " 天気"), "_blank")} onSettings={() => switchPage("settings")} /> : null}
        {activePage === "prep" ? <PreparationPage snapshot={snapshot} packing={packing} todos={todos} currentUserId={currentUserId} onAddPacking={() => openPackingForm()} onTemplate={applyPackingTemplate} onTogglePacking={togglePacking} onDeletePacking={deletePacking} onAddTodo={openTodoForm} onToggleTodo={toggleTodo} onDeleteTodo={deleteTodo} /> : null}
        {activePage === "itinerary" ? <ItineraryPage snapshot={snapshot} itinerary={itinerary} onAdd={() => openPlanForm(false)} onAddNow={() => openPlanForm(true)} onDelete={deletePlan} /> : null}
        {activePage === "money" ? <MoneyPage snapshot={snapshot} expenses={expenses} currentUserId={currentUserId} onAdd={openExpenseForm} /> : null}
        {activePage === "album" ? <AlbumPage snapshot={snapshot} photos={photos} itinerary={itinerary} currentUserId={currentUserId} onPost={addPhoto} onUpdatePhoto={updatePhoto} /> : null}
        {activePage === "pdf" ? <PdfPage snapshot={snapshot} photos={photos} reflections={reflections} currentUserId={currentUserId} onOpenPrint={openArchivePrint} onOpenAlbum={() => switchPage("album")} onUpdateReflection={updateReflection} onCopyQr={copyInviteUrl} /> : null}
        {activePage === "settings" ? <SettingsPage snapshot={snapshot} currentUserId={currentUserId} onCopyInvite={copyInviteUrl} onOpenPrint={openArchivePrint} onUpdateMemberProfile={updateMemberProfile} /> : null}
      </main>
      <div className={"modal " + (planForm ? "open" : "")} role="dialog" aria-modal="true" aria-label="予定追加" onClick={() => setPlanForm(null)}>
        {planForm ? <form className="modal-box plan-modal" onSubmit={submitPlan} onClick={(event) => event.stopPropagation()}>
          <div className="section-head">
            <div>
              <h2>{planForm.isNow ? "今を追加" : "予定追加"}</h2>
              <p className="modal-lead">予定名、時間、リンク、メモをまとめて保存します。</p>
            </div>
          </div>
          <div className="fields plan-fields">
            <label className="field-group">予定名<input autoFocus value={planForm.title} onChange={(event) => updatePlanForm({ title: event.target.value })} placeholder="例: 近江町市場で昼食" /></label>
            <label>開始時間<input type="time" value={planForm.start_time} onChange={(event) => updatePlanForm({ start_time: event.target.value })} /></label>
            <label>リンク<input value={planForm.link_url} onChange={(event) => updatePlanForm({ link_url: event.target.value })} placeholder="Google Maps / 食べログなど" inputMode="url" /></label>
            <label className="field-group">メモ<textarea value={planForm.note} onChange={(event) => updatePlanForm({ note: event.target.value })} placeholder="予約名、集合場所、気をつけることなど" /></label>
          </div>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={() => setPlanForm(null)}>キャンセル</button>
            <button className="primary" type="submit">保存</button>
          </div>
        </form> : null}
      </div>
      <div className={"modal " + (todoForm ? "open" : "")} role="dialog" aria-modal="true" aria-label="やること追加" onClick={() => setTodoForm(null)}>
        {todoForm ? <form className="modal-box plan-modal" onSubmit={submitTodo} onClick={(event) => event.stopPropagation()}>
          <div className="section-head">
            <div>
              <h2>やること追加</h2>
              <p className="modal-lead">担当、期限、優先度までまとめて保存します。</p>
            </div>
          </div>
          <div className="fields plan-fields">
            <label className="field-group">やること<input autoFocus value={todoForm.title} onChange={(event) => updateTodoForm({ title: event.target.value })} placeholder="例: 夜のお店を予約する" /></label>
            <label>担当<select value={todoForm.assigned_user_id} onChange={(event) => updateTodoForm({ assigned_user_id: event.target.value })}><option value="">担当なし</option>{members.map((member) => <option key={member.id} value={member.user_id}>{displayMemberName(member)}</option>)}</select></label>
            <label>期限<input type="date" value={todoForm.due_date} onChange={(event) => updateTodoForm({ due_date: event.target.value })} /></label>
            <label className="toggle-row todo-priority-toggle"><input type="checkbox" checked={todoForm.emphasized} onChange={(event) => updateTodoForm({ emphasized: event.target.checked })} />優先する</label>
          </div>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={() => setTodoForm(null)}>キャンセル</button>
            <button className="primary" type="submit">保存</button>
          </div>
        </form> : null}
      </div>
      <div className={"modal " + (expenseForm ? "open" : "")} role="dialog" aria-modal="true" aria-label="支払い入力" onClick={() => setExpenseForm(null)}>
        {expenseForm ? <form className="modal-box plan-modal" onSubmit={submitExpense} onClick={(event) => event.stopPropagation()}>
          <div className="section-head">
            <div>
              <h2>支払い入力</h2>
              <p className="modal-lead">支払い名、金額、払った人をまとめて保存します。</p>
            </div>
          </div>
          <div className="fields plan-fields">
            <label className="field-group">支払い名<input autoFocus value={expenseForm.title} onChange={(event) => updateExpenseForm({ title: event.target.value })} placeholder="例: 夕食" /></label>
            <label>金額<input type="number" min="1" inputMode="numeric" value={expenseForm.amount} onChange={(event) => updateExpenseForm({ amount: event.target.value })} placeholder="3000" /></label>
            <label>払った人<select value={expenseForm.payer_id} onChange={(event) => updateExpenseForm({ payer_id: event.target.value })}>{members.map((member) => <option key={member.id} value={member.user_id}>{displayMemberName(member)}</option>)}</select></label>
            <label>カテゴリ<select value={expenseForm.category} onChange={(event) => updateExpenseForm({ category: event.target.value })}><option value="food">食事</option><option value="transport">移動</option><option value="hotel">宿</option><option value="ticket">チケット</option><option value="other">その他</option></select></label>
          </div>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={() => setExpenseForm(null)}>キャンセル</button>
            <button className="primary" type="submit">保存</button>
          </div>
        </form> : null}
      </div>
      <div className={"modal " + (packingForm ? "open" : "")} role="dialog" aria-modal="true" aria-label="持ち物追加" onClick={() => setPackingForm(null)}>
        {packingForm ? <form className="modal-box plan-modal" onSubmit={submitPacking} onClick={(event) => event.stopPropagation()}>
          <div className="section-head">
            <div>
              <h2>持ち物追加</h2>
              <p className="modal-lead">持ち物名、カテゴリ、担当者をまとめて保存します。</p>
            </div>
          </div>
          <div className="fields plan-fields">
            <label className="field-group">持ち物<input autoFocus value={packingForm.name} onChange={(event) => updatePackingForm({ name: event.target.value })} placeholder="例: モバイルバッテリー" /></label>
            <div className="field-group choice-field"><strong>カテゴリ</strong><div className="choice-buttons">{packingCategories.map((category) => <button type="button" key={category} className={packingForm.category === category ? "active" : ""} onClick={() => updatePackingForm({ category })}>{category}</button>)}</div></div>
            <div className="field-group choice-field"><strong>担当</strong><div className="choice-buttons"><button type="button" className={!packingForm.assigned_user_id ? "active" : ""} onClick={() => updatePackingForm({ assigned_user_id: "" })}>共有</button>{members.map((member) => <button type="button" key={member.id} className={packingForm.assigned_user_id === member.user_id ? "active" : ""} onClick={() => updatePackingForm({ assigned_user_id: member.user_id })}>{displayMemberName(member)}</button>)}</div></div>
          </div>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={() => setPackingForm(null)}>キャンセル</button>
            <button className="primary" type="submit">保存</button>
          </div>
        </form> : null}
      </div>
      <div className={"modal " + (photoForm ? "open" : "")} role="dialog" aria-modal="true" aria-label="写真投稿" onClick={() => setPhotoForm(null)}>
        {photoForm ? <form className="modal-box plan-modal photo-post-modal" onSubmit={submitPhoto} onClick={(event) => event.stopPropagation()}>
          <div className="section-head">
            <div>
              <h2>{photoForm.existingId ? "写真を変更" : "写真投稿"}</h2>
              <p className="modal-lead">スマホの写真フォルダから画像を選んで投稿します。</p>
            </div>
          </div>
          <div className="photo-picker">
            <label className="photo-file-button"><input type="file" accept="image/*" onChange={handlePhotoFile} />写真を選ぶ</label>
            <div className={"photo-picker-preview " + (photoForm.image_url ? "filled" : "")} style={photoForm.image_url ? { "--photo": photoBackground(photoForm.image_url) } as CSSProperties : undefined}>{photoForm.image_url ? <span>選択済み</span> : <span>未選択</span>}</div>
          </div>
          <div className="fields plan-fields">
            <label className="field-group">ひとこと<input value={photoForm.caption} onChange={(event) => updatePhotoForm({ caption: event.target.value })} placeholder="例: 近江町市場で昼食" /></label>
          </div>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={() => setPhotoForm(null)}>キャンセル</button>
            <button className="primary" type="submit">保存</button>
          </div>
        </form> : null}
      </div>
      <nav className="mobile-nav" aria-label="モバイル主画面">{pages.map((item) => <button key={item.id} className={activePage === item.id ? "active" : ""} onClick={() => switchPage(item.id)}>{item.short}</button>)}</nav>
      <div className={"toast " + (toast ? "show" : "")}>{toast}</div>
    </div>
  );
}

function Dashboard({ snapshot, nextItem, upcomingItems, wishlist, expenses, onAddNow, onAddPlan, onAddWish, onMoveWish, onToggleWish, onDeleteWish, onMoney, onAlbum, onMemo, onWeather, onSettings }: { snapshot: TripSnapshot; nextItem?: ItineraryItem; upcomingItems: ItineraryItem[]; wishlist: TripListItem[]; expenses: Expense[]; onAddNow: () => void; onAddPlan: () => void; onAddWish: () => void; onMoveWish: (item: TripListItem) => void; onToggleWish: (item: TripListItem) => void; onDeleteWish: (item: TripListItem) => void; onMoney: () => void; onAlbum: () => void; onMemo: () => void; onWeather: () => void; onSettings: () => void }) {
  const sortedList = [...wishlist].sort(sortTripListItems);
  return <section><div className="summary-strip"><div><small>次の予定</small><b>{nextItem?.start_time || "--:--"}</b><br />{nextItem?.title || "予定なし"}</div><button className="summary-button" onClick={onMoney}><small>お金</small><b>お金の記録</b><br />{expenses.length}件の支払い</button><button className="summary-button" onClick={onWeather}><small>天気</small><b>検索</b><br />{nextItem?.location_name || snapshot.trip.destination}</button><div><small>歩数</small><b>8,436</b><br />今日の歩数</div></div><div className="page-grid"><div className="panel"><div className="panel-head"><h2>今後のスケジュール</h2><div className="actions"><button className="secondary" onClick={onAddNow}>今を追加</button><button className="primary" onClick={onAddPlan}>予定追加</button></div></div><Timeline items={upcomingItems} /></div><div className="right-stack"><div className="panel compact"><div className="panel-head"><h2>ミニツール</h2></div><div className="mini-grid"><button onClick={onMoney}>お金の記録</button><button onClick={onAlbum}>写真投稿</button><button onClick={onMemo}>メモを書く</button><button onClick={() => window.alert("次の予定の10分前通知を想定しています")}>アラーム機能</button><button onClick={onSettings}>設定</button><button>緊急情報</button></div></div><div className="panel compact"><div className="panel-head"><div><h2>やること</h2><small className="panel-note">{wishlist.length}件</small></div><button className="primary" onClick={onAddWish}>追加</button></div><WishList items={sortedList.slice(0, 4)} members={snapshot.members} onMove={onMoveWish} onToggle={onToggleWish} onDelete={onDeleteWish} /></div><div className="panel compact memo-panel"><div className="panel-head"><h2>メモ</h2><button className="secondary" onClick={onMemo}>メモを書く</button></div><p className="empty-inline">共有メモと個人メモをここにまとめる予定です。</p></div></div></div></section>;
}

function PreparationPage({ snapshot, packing, todos, currentUserId, onAddPacking, onTemplate, onTogglePacking, onDeletePacking, onAddTodo, onToggleTodo, onDeleteTodo }: { snapshot: TripSnapshot; packing: PackingItem[]; todos: Todo[]; currentUserId: string; onAddPacking: () => void; onTemplate: () => void; onTogglePacking: (item: PackingItem) => void; onDeletePacking: (item: PackingItem) => void; onAddTodo: () => void; onToggleTodo: (todo: Todo) => void; onDeleteTodo: (todo: Todo) => void }) {
  const [view, setView] = useState<"packing" | "todo">("packing");
  const [filter, setFilter] = useState<"all" | "mine" | "unchecked">("all");
  const visiblePacking = packing.filter((item) => filter === "all" ? true : filter === "mine" ? item.assigned_user_id === currentUserId : !item.checked);
  const groups = packingCategories.map((category) => ({ category, items: visiblePacking.filter((item) => categoryOfPackingItem(item.name, item.category) === category) })).filter((group) => group.items.length);
  return <section className="prep-stack"><div className="prep-tabs"><button className={view === "packing" ? "active" : ""} onClick={() => setView("packing")}>持ち物</button><button className={view === "todo" ? "active" : ""} onClick={() => setView("todo")}>やること</button></div>{view === "packing" ? <div className="section"><div className="section-head"><div><h2>持ち物</h2><small className="panel-note">{packing.filter((item) => item.checked).length}/{packing.length} 完了</small></div><div className="actions"><select value={filter} onChange={(event) => setFilter(event.target.value as "all" | "mine" | "unchecked")}><option value="all">全員</option><option value="mine">自分</option><option value="unchecked">未チェック</option></select><button className="secondary" onClick={onTemplate}>テンプレ適用</button><button className="primary" onClick={onAddPacking}>追加</button></div></div>{groups.map((group) => <div className="packing-group" key={group.category}><h3>{group.category}</h3>{group.items.map((item) => <div className={"packing-row " + (item.checked ? "checked" : "")} key={item.id}><button className="check-button" onClick={() => onTogglePacking(item)}>{item.checked ? "✓" : ""}</button><span>{item.name}</span><small>{item.assigned_user_id ? displayUser(snapshot, item.assigned_user_id) : "共有"}</small><button className="tiny" onClick={() => onDeletePacking(item)}>削除</button></div>)}</div>)}</div> : <div className="section"><div className="section-head"><h2>やること</h2><button className="primary" onClick={onAddTodo}>追加</button></div><div className="list">{todos.map((todo) => <article className={"todo-card " + (todo.completed ? "done" : "") + (todo.emphasized ? " priority" : "")} key={todo.id}><button className="check-button" onClick={() => onToggleTodo(todo)}>{todo.completed ? "✓" : ""}</button><div><strong>{todo.title}</strong><p>{todo.assigned_user_id ? displayUser(snapshot, todo.assigned_user_id) : "担当なし"}</p></div><button className="tiny" onClick={() => onDeleteTodo(todo)}>削除</button></article>)}</div></div>}</section>;
}

function ItineraryPage({ snapshot, itinerary, onAdd, onAddNow, onDelete }: { snapshot: TripSnapshot; itinerary: ItineraryItem[]; onAdd: () => void; onAddNow: () => void; onDelete: (item: ItineraryItem) => void }) {
  return <section className="board"><div className="section"><div className="section-head"><h2>日程</h2></div><div className="list">{snapshot.days.map((day, index) => <button className={"day-tab " + (index === 0 ? "active" : "")} key={day.id}><strong>Day {index + 1}</strong><span className="meta">{day.date}</span></button>)}</div></div><div className="section"><div className="section-head"><h2>タイムライン</h2><div className="actions"><button className="secondary" onClick={onAddNow}>今を追加</button><button className="primary" onClick={onAdd}>予定追加</button></div></div><Timeline items={[...itinerary].sort(sortByTime)} onDelete={onDelete} /></div></section>;
}

function MoneyPage({ snapshot, expenses, currentUserId, onAdd }: { snapshot: TripSnapshot; expenses: Expense[]; currentUserId: string; onAdd: () => void }) {
  const settlements = calculateSettlements(snapshot.members, expenses);
  const mine = settlements.filter((item) => item.fromId === currentUserId || item.toId === currentUserId);
  const rest = settlements.filter((item) => item.fromId !== currentUserId && item.toId !== currentUserId);
  return <section className="two-column"><div className="section"><div className="section-head"><h2>支払い</h2><button className="primary" onClick={onAdd}>支払い入力</button></div><div className="list">{expenses.map((expense) => <article className="expense-card" key={expense.id}><strong>{expense.title}</strong><p>{displayUser(snapshot, expense.payer_id)} が支払い</p><b>¥{expense.amount.toLocaleString("ja-JP")}</b></article>)}</div></div><div className="section"><div className="section-head"><h2>最終精算</h2><span className="tag">自分に関わるものを上に表示</span></div><div className="settlement-list">{[...mine, ...rest].map((item, index) => <article className={"settlement-row " + (index < mine.length ? "highlight" : "")} key={item.fromId + item.toId}><span>{displayUser(snapshot, item.fromId)}</span><strong>→ ¥{item.amount.toLocaleString("ja-JP")}</strong><span>{displayUser(snapshot, item.toId)}</span></article>)}</div></div></section>;
}

function AlbumPage({ snapshot, photos, itinerary, currentUserId, onPost, onUpdatePhoto }: { snapshot: TripSnapshot; photos: Photo[]; itinerary: ItineraryItem[]; currentUserId: string; onPost: (target?: PhotoTarget) => void; onUpdatePhoto: (photo: Photo, patch: Partial<Photo>) => void }) {
  const [tab, setTab] = useState<"schedule" | "bestshot">("schedule");
  const [selectMode, setSelectMode] = useState(false);
  const bestshots = photos.filter((photo) => photo.category === "bestshot");
  return <section><div className="section"><div className="section-head"><div><h2>写真</h2><small className="panel-note">スケジュール投稿写真とベストショットは独立です。</small></div><div className="actions"><button className={tab === "schedule" ? "primary" : "secondary"} onClick={() => setTab("schedule")}>スケジュール写真</button><button className={tab === "bestshot" ? "primary" : "secondary"} onClick={() => setTab("bestshot")}>ベストショット</button><button className="secondary" onClick={() => setSelectMode(!selectMode)}>{selectMode ? "選択終了" : "PDF掲載写真を選ぶ"}</button></div></div>{tab === "bestshot" ? <div><div className="section-head"><h2>ベストショット</h2><button className="primary" onClick={() => onPost({ category: "bestshot", label: "ベストショット" })}>投稿</button></div><PhotoGrid photos={bestshots} snapshot={snapshot} selectMode={selectMode} onUpdatePhoto={onUpdatePhoto} /></div> : <div className="album-slots">{itinerary.sort(sortByTime).map((item, index) => <article className="album-slot" key={item.id}><div><strong>{item.start_time} {item.title}</strong><small>各メンバー1枚まで</small></div><PhotoGrid photos={photos.filter((photo) => photo.itinerary_item_id === item.id)} snapshot={snapshot} selectMode={selectMode} onUpdatePhoto={onUpdatePhoto} /><button className={photos.some((photo) => photo.itinerary_item_id === item.id && photo.uploader_id === currentUserId) ? "secondary changed" : "primary post"} onClick={() => onPost({ itinerary_item_id: item.id, category: "general", label: item.title })}>{photos.some((photo) => photo.itinerary_item_id === item.id && photo.uploader_id === currentUserId) ? "変更" : "投稿"}</button>{index < itinerary.length - 1 ? <div className="between-slot"><strong>移動</strong><PhotoGrid photos={photos.filter((photo) => photo.transit_segment_id === "between-" + item.id + "-" + itinerary[index + 1].id)} snapshot={snapshot} selectMode={selectMode} onUpdatePhoto={onUpdatePhoto} /><button className="secondary" onClick={() => onPost({ transit_segment_id: "between-" + item.id + "-" + itinerary[index + 1].id, category: "general", label: "移動中" })}>投稿</button></div> : null}</article>)}</div>}</div></section>;
}

function PdfPage({ snapshot, photos, reflections, currentUserId, onOpenPrint, onOpenAlbum, onUpdateReflection, onCopyQr }: { snapshot: TripSnapshot; photos: Photo[]; reflections: MemberReflection[]; currentUserId: string; onOpenPrint: () => void; onOpenAlbum: () => void; onUpdateReflection: (patch: Partial<MemberReflection>) => void; onCopyQr: () => void }) {
  const selectedPhotos = photos.filter((photo) => photo.pdf_selected);
  const bestshots = photos.filter((photo) => photo.category === "bestshot");
  const coverPhoto = bestshots.find((photo) => photo.cover_candidate);
  const reflection = reflections.find((item) => item.user_id === currentUserId);
  return <section className="two-column pdf-editor-page"><div className="section"><div className="section-head"><div><h2>PDF作成</h2><small className="panel-note">表紙、旅程写真、感想カードを確認します。</small></div><button className="primary" onClick={onOpenPrint}>冊子プレビュー</button></div><div className="pdf-ready-score"><div><strong>{[coverPhoto, selectedPhotos.length, reflection?.comment].filter(Boolean).length}/3</strong><span>冊子準備</span></div><ul><li className={coverPhoto ? "done" : ""}>表紙写真</li><li className={selectedPhotos.length ? "done" : ""}>PDF掲載写真</li><li className={reflection?.comment ? "done" : ""}>感想カード</li></ul></div><div className="pdf-edit-steps"><PdfEditStep title="表紙" status={coverPhoto ? "選択済み" : "未選択"} body="ベストショットから表紙写真を選びます。" actionLabel="写真タブへ" onAction={onOpenAlbum} /><PdfEditStep title="旅程の写真" status={selectedPhotos.length + "枚"} body="スケジュール横に載せる写真を選びます。" actionLabel="写真タブへ" onAction={onOpenAlbum} /><PdfEditStep title="QR" status="自動" body="印刷した冊子から旅ページへ戻る入口です。" actionLabel="リンクコピー" onAction={onCopyQr} /></div></div><div className="section"><div className="section-head"><h2>感想カード</h2><span className="tag">{displayUser(snapshot, currentUserId)}</span></div><div className="fields pdf-reflection-fields"><label>いちばん美味しかったもの<input value={reflection?.best_food || ""} onChange={(event) => onUpdateReflection({ best_food: event.target.value })} placeholder="近江町市場の海鮮丼" /></label><label>好きな景色<input value={reflection?.favorite_view || ""} onChange={(event) => onUpdateReflection({ favorite_view: event.target.value })} placeholder="夕方のひがし茶屋街" /></label><label>ひとことコメント<textarea value={reflection?.comment || ""} onChange={(event) => onUpdateReflection({ comment: event.target.value })} placeholder="何でもない移動時間まで楽しかった。" /></label><label>次回行きたいところ<input value={reflection?.next_place || ""} onChange={(event) => onUpdateReflection({ next_place: event.target.value })} placeholder="加賀温泉" /></label></div></div></section>;
}

function SettingsPage({ snapshot, currentUserId, onCopyInvite, onOpenPrint, onUpdateMemberProfile }: { snapshot: TripSnapshot; currentUserId: string; onCopyInvite: () => void; onOpenPrint: () => void; onUpdateMemberProfile: (member: TripMember, patch: Partial<TripMember>) => void }) {
  return <section className="two-column"><div className="section"><div className="section-head"><h2>旅行設定</h2></div><div className="list"><button className="primary" onClick={onCopyInvite}>招待リンクをコピー</button><button className="secondary" onClick={onOpenPrint}>冊子プレビューを開く</button><p className="empty-inline">公開範囲、旅終了、権限変更は本番ログイン後に接続します。</p></div></div><div className="section"><div className="section-head"><h2>旅行ごとの顔写真</h2></div><div className="list">{snapshot.members.map((member, index) => <article className="member-profile-card" key={member.id}><span className="avatar" style={avatarStyle(member, index)}>{avatarText(member)}</span><div><strong>{displayMemberName(member)}</strong><p>{member.role}</p></div><button className="secondary" onClick={() => onUpdateMemberProfile(member, { trip_nickname: window.prompt("旅行内の表示名", displayMemberName(member)) || displayMemberName(member) })}>{member.user_id === currentUserId ? "自分を編集" : "編集"}</button></article>)}</div></div></section>;
}

function Timeline({ items, onDelete }: { items: ItineraryItem[]; onDelete?: (item: ItineraryItem) => void }) {
  return <div className="timeline">{items.map((item) => <article className={"timeline-card " + item.type} key={item.id}><div className="time">{item.start_time}</div><div className="timeline-body"><strong>{item.title}</strong><p>{[item.location_name, item.note].filter(Boolean).join(" / ")}</p><div className="actions">{item.map_url ? <a className="tiny" href={item.map_url} target="_blank" rel="noreferrer">地図を開く</a> : null}{item.link_url ? <a className="tiny" href={item.link_url} target="_blank" rel="noreferrer">{item.link_label || "リンク"}</a> : null}{onDelete ? <button className="tiny" onClick={() => onDelete(item)}>削除</button> : null}</div></div></article>)}</div>;
}

function WishList({ items, members, onMove, onToggle, onDelete }: { items: TripListItem[]; members: TripMember[]; onMove: (item: TripListItem) => void; onToggle: (item: TripListItem) => void; onDelete: (item: TripListItem) => void }) {
  return <div className="wish-list">{items.map((item) => <article className={"wish-card " + (item.is_priority ? "priority" : "") + (item.completed ? " done" : "")} key={item.id}><button className="check-button" onClick={() => onToggle(item)}>{item.completed ? "✓" : ""}</button><div><strong>{item.title}</strong><p>{item.memo || "メモなし"}</p><div className="mini-avatars">{item.requester_ids?.map((id) => <span className="avatar mini" key={id}>{avatarText(members.find((member) => member.user_id === id))}</span>)}</div></div><div className="actions"><button className="tiny" onClick={() => onMove(item)}>予定へ</button><button className="tiny" onClick={() => onDelete(item)}>削除</button></div></article>)}</div>;
}

function PhotoGrid({ photos, snapshot, selectMode, onUpdatePhoto }: { photos: Photo[]; snapshot: TripSnapshot; selectMode: boolean; onUpdatePhoto: (photo: Photo, patch: Partial<Photo>) => void }) {
  return <div className="photo-grid">{photos.map((photo) => <button className={"photo-card " + (photo.pdf_selected ? "selected" : "")} key={photo.id} onClick={() => selectMode ? onUpdatePhoto(photo, { pdf_selected: !photo.pdf_selected }) : window.alert((photo.caption || "写真") + "\n" + displayUser(snapshot, photo.uploader_id))}><span className="photo-thumb" style={{ "--photo": photoBackground(photo.image_url) } as CSSProperties}><b>{photo.cover_candidate ? "表紙" : photo.pdf_selected ? "PDF" : ""}</b></span><small>{photo.caption || displayUser(snapshot, photo.uploader_id)}</small>{photo.category === "bestshot" ? <span className="tag">ベスト</span> : null}{photo.category === "bestshot" ? <span className="tiny" onClick={(event) => { event.stopPropagation(); onUpdatePhoto(photo, { cover_candidate: true }); }}>表紙にする</span> : null}</button>)}</div>;
}

function PdfEditStep({ title, status, body, actionLabel, onAction }: { title: string; status: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return <article className="pdf-edit-step"><div><strong>{title}</strong><p>{body}</p>{actionLabel && onAction ? <button className="tiny" onClick={onAction}>{actionLabel}</button> : null}</div><span>{status}</span></article>;
}

function calculateSettlements(members: TripMember[], expenses: Expense[]) {
  const balance = new Map(members.map((member) => [member.user_id, 0]));
  expenses.forEach((expense) => {
    const participants = expense.participant_ids.length ? expense.participant_ids : members.map((member) => member.user_id);
    const share = Math.round(expense.amount / Math.max(participants.length, 1));
    balance.set(expense.payer_id, (balance.get(expense.payer_id) || 0) + expense.amount);
    participants.forEach((id) => balance.set(id, (balance.get(id) || 0) - share));
  });
  const debtors = [...balance.entries()].filter(([, amount]) => amount < 0).map(([id, amount]) => ({ id, amount: -amount }));
  const creditors = [...balance.entries()].filter(([, amount]) => amount > 0).map(([id, amount]) => ({ id, amount }));
  const result: { fromId: string; toId: string; amount: number }[] = [];
  debtors.forEach((debtor) => {
    creditors.forEach((creditor) => {
      if (debtor.amount <= 0 || creditor.amount <= 0) return;
      const amount = Math.min(debtor.amount, creditor.amount);
      result.push({ fromId: debtor.id, toId: creditor.id, amount });
      debtor.amount -= amount;
      creditor.amount -= amount;
    });
  });
  return result;
}

function sortByTime(a: ItineraryItem, b: ItineraryItem) {
  return (a.start_time || "").localeCompare(b.start_time || "");
}

function sortTodos(a: Todo, b: Todo) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  if (a.emphasized !== b.emphasized) return a.emphasized ? -1 : 1;
  return (a.due_date || "").localeCompare(b.due_date || "");
}

function sortTripListItems(a: TripListItem, b: TripListItem) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
  return (b.created_at || "").localeCompare(a.created_at || "");
}

function displayUser(snapshot: TripSnapshot, userId: string) {
  return displayMemberName(snapshot.members.find((member) => member.user_id === userId));
}

function displayMemberName(member?: TripMember) {
  return member?.trip_nickname || member?.user?.name || member?.user_id || "未設定";
}

function avatarText(member?: TripMember) {
  return (displayMemberName(member).slice(0, 1) || "?").toUpperCase();
}

function avatarStyle(member?: TripMember, index = 0): CSSProperties {
  const fallback = ["#2f6f73", "#d8a441", "#3c6d96", "#d86b55", "#925849"][index % 5];
  const background = member?.trip_avatar_url?.startsWith("linear-gradient") ? member.trip_avatar_url : fallback;
  return { background };
}

function categoryOfPackingItem(name: string, existing?: string | null) {
  if (existing && packingCategories.includes(existing)) return existing;
  if (["パスポート", "財布", "チケット", "予約証", "スマホ", "充電", "バッテリー"].some((word) => name.includes(word))) return "貴重品";
  if (["服", "下着", "靴", "パジャマ", "上着"].some((word) => name.includes(word))) return "衣類";
  if (["タオル", "シャンプー", "洗顔", "歯", "メイク", "コンタクト"].some((word) => name.includes(word))) return "洗面用具";
  if (["薬", "目薬", "絆創膏", "ウェット", "マスク", "酔い止め"].some((word) => name.includes(word))) return "薬・衛生用品";
  if (["傘", "袋", "イヤホン", "箸", "ラップ", "レジャー"].some((word) => name.includes(word))) return "生活用品";
  return "その他";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(value));
}

function currentClockTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function normalizeUrl(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
}

function guessLinkLabel(url?: string) {
  if (!url) return undefined;
  if (url.includes("tabelog")) return "食べログ";
  if (url.includes("google") || url.includes("maps")) return "地図";
  return "リンク";
}

function buildMapUrl(query: string) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function photoBackground(value?: string) {
  if (!value) return randomPhotoGradient();
  if (value.startsWith("data:") || value.startsWith("http")) return `url("${value}")`;
  return value;
}

function resizeImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("写真を読み込めませんでした"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("写真を読み込めませんでした"));
      image.onload = () => {
        const maxSize = 1000;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("写真を変換できませんでした"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function randomPhotoGradient() {
  const palettes = [
    ["#7eb2b4", "#f0d695", "#925849"],
    ["#743a31", "#d8a441", "#fff2cf"],
    ["#375c6b", "#f8f4e4", "#4d8060"],
    ["#253d5b", "#b9d4df", "#d86b55"]
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  return `linear-gradient(135deg,${palette[0]},${palette[1]} 52%,${palette[2]})`;
}
