"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="diagnostic-page">
      <h1>旅OSでエラーが発生しました</h1>
      <p>白い画面になる代わりに、ここへ原因を表示します。</p>
      <pre>{error.message}</pre>
      <button className="primary" onClick={reset}>再読み込み</button>
    </main>
  );
}
