"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/trips/trip-kanazawa-2026";
  }
  return value;
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [message, setMessage] = useState("Completing login...");

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const code = searchParams.get("code");
      const next = safeNextPath(searchParams.get("next"));

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) setMessage(error.message);
          return;
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (!cancelled) setMessage("No login session was found.");
          return;
        }
      }

      if (!cancelled) window.location.replace(next);
    }

    completeLogin();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  return (
    <main className="diagnostic-page">
      <section className="diagnostic-card">
        <h1>Tabicho login</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main className="diagnostic-page">Completing login...</main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
