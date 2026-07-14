"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Trip, TripMember } from "@/lib/types";

type TripListEntry = {
  role: "owner" | "editor" | "viewer";
  trip: Trip;
};

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function TripHome() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [trips, setTrips] = useState<TripListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("ログインすると、参加している旅が表示されます。");
  const [form, setForm] = useState({
    title: "",
    destination: "",
    start_date: isoDate(30),
    end_date: isoDate(32)
  });

  const loadTrips = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    setEmail(data.session?.user.email || "");
    if (!token) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/trips", {
        headers: { authorization: `Bearer ${token}` }
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "旅一覧を読み込めませんでした。");
      setTrips(payload.data as TripListEntry[]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "旅一覧を読み込めませんでした。");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (userId) void loadTrips();
    else {
      setTrips([]);
      setEmail("");
    }
  }, [loadTrips, userId]);

  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || creating) return;
    setCreating(true);
    setMessage("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("旅を作るにはログインしてください。");

      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "旅を作成できませんでした。");
      window.location.assign(`/trips/${encodeURIComponent(payload.data.trip.id)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "旅を作成できませんでした。");
      setCreating(false);
    }
  }

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="trip-home">
      <section className="trip-home-hero">
        <span className="protected-trip-mark">旅帖</span>
        <div>
          <h1>旅の一覧</h1>
          <p>新しい予定を作るか、みんなと育てている旅を開きます。</p>
        </div>
        <div className="trip-home-auth">
          <AuthPanel
            onToast={setMessage}
            tripId=""
            onMemberJoined={(_member: TripMember) => undefined}
            onAuthUserChanged={setUserId}
            autoJoin={false}
          />
        </div>
      </section>

      {userId ? (
        <div className="trip-home-grid">
          <section className="section trip-create-card">
            <div className="section-head">
              <div>
                <h2>新しい旅を作る</h2>
                <small className="panel-note">作成した人がオーナーになります。</small>
              </div>
            </div>
            <form className="trip-create-form" onSubmit={createTrip}>
              <label>旅の名前<input required maxLength={80} value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="例：秋の京都2泊3日" /></label>
              <label>行き先<input required maxLength={80} value={form.destination} onChange={(event) => updateForm("destination", event.target.value)} placeholder="例：京都" /></label>
              <div className="trip-date-fields">
                <label>出発日<input required type="date" value={form.start_date} onChange={(event) => updateForm("start_date", event.target.value)} /></label>
                <label>帰着日<input required type="date" min={form.start_date} value={form.end_date} onChange={(event) => updateForm("end_date", event.target.value)} /></label>
              </div>
              <button className="primary" type="submit" disabled={creating}>{creating ? "作成中…" : "この旅を作る"}</button>
            </form>
          </section>

          <section className="section trip-list-card">
            <div className="section-head">
              <div>
                <h2>参加している旅</h2>
                <small className="panel-note">{email}{loading ? " / 読み込み中…" : ` / ${trips.length}件`}</small>
              </div>
            </div>
            <div className="trip-home-list">
              {!loading && trips.length === 0 ? <p className="empty-inline">まだ旅がありません。左のフォームから最初の旅を作れます。</p> : null}
              {trips.map(({ trip, role }) => (
                <a className="trip-home-item" href={`/trips/${encodeURIComponent(trip.id)}`} key={trip.id}>
                  <span className={`tag ${trip.status === "active" ? "active" : ""}`}>{trip.status === "archived" ? "終了" : trip.status === "active" ? "旅行中" : "計画中"}</span>
                  <div><strong>{trip.title}</strong><p>{trip.destination} / {trip.start_date}〜{trip.end_date}</p></div>
                  <small>{role === "owner" ? "オーナー" : role === "editor" ? "編集メンバー" : "閲覧のみ"} →</small>
                </a>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {message ? <p className="trip-home-message">{message}</p> : null}
    </main>
  );
}
