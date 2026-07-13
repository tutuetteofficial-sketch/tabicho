import { createBrowserSupabaseClient } from "./supabase";

export async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const accessToken = data.session?.access_token;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.ok ? (payload.data as T) : null;
  } catch {
    return null;
  }
}
