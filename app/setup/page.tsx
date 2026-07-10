const checks = [
  {
    title: "旅ページ",
    body: "旅行中に使うメイン画面を開きます。",
    href: "/trips/trip-kanazawa-2026"
  },
  {
    title: "冊子プレビュー",
    body: "PDF作成で確認する、見開きの冊子プレビューを開きます。",
    href: "/archive/trip-kanazawa-2026/print"
  },
  {
    title: "Supabase 読み込み確認",
    body: "公開環境の設定と、主要データの読み込みを確認します。",
    href: "/api/db-check"
  },
  {
    title: "Supabase 書き込み確認",
    body: "テスト用の持ち物を追加して、すぐ削除できるか確認します。",
    href: "/api/db-write-check"
  },
  {
    title: "起動確認",
    body: "Next.js が動いているかだけを確認します。",
    href: "/health"
  }
];

export default function SetupPage() {
  return (
    <main className="diagnostic-page">
      <h1>旅帖 セットアップ</h1>
      <p>
        ローカル確認と Supabase 接続確認の入口です。Supabase のキーを入れる前は、
        接続確認で「demo data」と表示されれば正常です。
      </p>

      <div className="setup-link-list">
        {checks.map((check) => (
          <a className="setup-link-card" href={check.href} key={check.href}>
            <strong>{check.title}</strong>
            <span>{check.body}</span>
          </a>
        ))}
      </div>

      <pre>{`1. CREATE_ENV_LOCAL.cmd を開く
2. .env.local に Supabase の3つの値を貼る
3. START_PREVIEW.cmd を開き直す
4. CHECK_SUPABASE_STATUS.cmd を開く
5. CHECK_SUPABASE_WRITE.cmd を開く`}</pre>
    </main>
  );
}
