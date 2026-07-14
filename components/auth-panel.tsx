"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { TripMember } from "@/lib/types";

type AuthPanelProps = {
  onToast: (message: string) => void;
  tripId: string;
  inviteCode?: string | null;
  onMemberJoined: (member: TripMember) => void;
  onAuthUserChanged: (userId: string | null) => void;
  autoJoin?: boolean;
};

function currentPathWithQuery() {
  if (typeof window === "undefined") return "/trips/trip-kanazawa-2026";
  return `${window.location.pathname}${window.location.search}`;
}

function callbackUrl() {
  if (typeof window === "undefined") return undefined;
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", currentPathWithQuery());
  return url.toString();
}

export function AuthPanel({ onToast, tripId, inviteCode, onMemberJoined, onAuthUserChanged, autoJoin = true }: AuthPanelProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const joinedUserRef = useRef("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      onAuthUserChanged(null);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      onAuthUserChanged(data.user?.id ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      onAuthUserChanged(session?.user.id ?? null);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, [onAuthUserChanged, supabase]);

  useEffect(() => {
    if (!autoJoin || !supabase || !user || !inviteCode || joinedUserRef.current === user.id) return;
    const client = supabase;
    const userId = user.id;

    async function joinTrip() {
      joinedUserRef.current = userId;
      setJoining(true);

      try {
        const { data } = await client.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) {
          onToast("Login session could not be read.");
          return;
        }

        const response = await fetch("/api/trips/join", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ trip_id: tripId, invite_code: inviteCode })
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          onToast(result.error || "Could not join this trip.");
          return;
        }

        onMemberJoined(result.data as TripMember);
        onToast("Joined this trip.");
      } catch {
        onToast("Could not connect to the trip service.");
      } finally {
        setJoining(false);
      }
    }

    joinTrip();
  }, [autoJoin, inviteCode, onMemberJoined, onToast, supabase, tripId, user]);

  async function signInWithEmail() {
    if (!supabase) {
      onToast("Supabase is not configured.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      onToast("Enter an email address.");
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { emailRedirectTo: callbackUrl() }
    });
    setSending(false);

    onToast(error ? error.message : "Login link sent. Open it from your email.");
  }

  async function signInWithGoogle() {
    if (!supabase) {
      onToast("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(),
        queryParams: { prompt: "select_account" }
      }
    });

    if (error) onToast(error.message);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    onToast("Logged out.");
  }

  return (
    <div className="auth-panel">
      <div>
        <strong>{user ? "Account" : "Member login"}</strong>
        <span>{joining ? "Joining trip..." : loading ? "Checking..." : user?.email ?? "Use an email account for testing."}</span>
      </div>

      {user ? (
        <button className="secondary" onClick={signOut}>Logout</button>
      ) : (
        <div className="auth-form">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            inputMode="email"
            autoComplete="email"
          />
          <button className="primary" onClick={signInWithEmail} disabled={sending}>
            {sending ? "Sending" : "Email"}
          </button>
          <button className="secondary" onClick={signInWithGoogle}>
            Google
          </button>
        </div>
      )}
    </div>
  );
}
