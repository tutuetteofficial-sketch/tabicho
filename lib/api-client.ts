export async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.ok ? (payload.data as T) : null;
  } catch {
    return null;
  }
}
