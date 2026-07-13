import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const browserGlobal = globalThis as typeof globalThis & {
  __tabichoSupabaseClient?: ReturnType<typeof createClient>;
};

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (typeof window === "undefined") return createClient(supabaseUrl, supabaseAnonKey);

  browserGlobal.__tabichoSupabaseClient ??= createClient(supabaseUrl, supabaseAnonKey);
  return browserGlobal.__tabichoSupabaseClient;
}

export function createServerSupabaseClient() {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false }
  });
}
