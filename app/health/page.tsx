export default function HealthPage() {
  return (
    <main className="diagnostic-page">
      <h1>Tabicho Health Check</h1>
      <p>このページが見えていれば、Next.js サーバーは起動しています。</p>
      <p>
        <a href="/trips/trip-kanazawa-2026">旅ページを開く</a>
      </p>
      <p>
        <a href="/setup">セットアップ確認ページを開く</a>
      </p>
      <p>
        <a href="/api/db-check">Supabase 読み込み確認を開く</a>
      </p>
    </main>
  );
}
