"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="ja">
      <body>
        <main className="diagnostic-page">
          <h1>旅OSの起動に失敗しました</h1>
          <p>Next.js の初期化中にエラーが起きています。</p>
          <pre>{error.message}</pre>
        </main>
      </body>
    </html>
  );
}
