"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { TripShell } from "@/components/trip-shell";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { TripMember, TripSnapshot } from "@/lib/types";

export function ProtectedTripPage({ tripId, inviteCode }: { tripId: string; inviteCode: string | null }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<TripSnapshot | null>(null);
  const [message, setMessage] = useState("ログイン状態を確認しています…");
  const [loading, setLoading] = useState(false);

  const loadTrip = useCallback(async () => {
    if (!supabase) {
      setMessage("Supabaseが設定されていません。");
      return;
    }

    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      setSnapshot(null);
      setMessage("旅行を見るにはログインしてください。");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, {
        headers: { authorization: `Bearer ${accessToken}` }
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setSnapshot(null);
        setMessage(response.status === 403 && inviteCode
          ? "招待旅行への参加を確認しています…"
          : result.error || "この旅行を見る権限がありません。");
        return;
      }
      setSnapshot(result.data as TripSnapshot);
      setMessage("");
    } catch {
      setSnapshot(null);
      setMessage("旅行データへ接続できませんでした。");
    } finally {
      setLoading(false);
    }
  }, [inviteCode, supabase, tripId]);

  useEffect(() => {
    if (userId) void loadTrip();
    else {
      setSnapshot(null);
      setMessage("旅行を見るにはログインしてください。");
    }
  }, [loadTrip, userId]);

  const handleAuthUserChanged = useCallback((nextUserId: string | null) => {
    setUserId(nextUserId);
  }, []);

  const handleMemberJoined = useCallback((_member: TripMember) => {
    void loadTrip();
  }, [loadTrip]);

  const handleToast = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  if (snapshot) {
    return <TripShell initialSnapshot={snapshot} inviteCode={inviteCode} />;
  }

  return (
    <main className="protected-trip-gate">
      <section className="protected-trip-card">
        <span className="protected-trip-mark">旅帖</span>
        <h1>この旅行はメンバー限定です</h1>
        <p>{loading ? "旅行データを読み込んでいます…" : message}</p>
        <AuthPanel
          onToast={handleToast}
          tripId={tripId}
          inviteCode={inviteCode}
          onMemberJoined={handleMemberJoined}
          onAuthUserChanged={handleAuthUserChanged}
        />
      </section>
    </main>
  );
}
