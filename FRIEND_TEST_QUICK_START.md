# Friend Test Quick Start

友達に試してもらうための最短ルートです。

## まず公開する

`localhost` は自分のPCだけで使えるURLです。友達に送るには Vercel の公開URLが必要です。

1. Supabaseでプロジェクトを作る
2. Supabase SQL Editorで `supabase/setup.sql` を実行する
3. VercelでこのNext.jsプロジェクトを公開する
4. Vercelの環境変数に `.env.production.example` の4つを入れる
5. 公開URLで `/launch` を開く

## 友達に送るURL

最初はこの形で送ります。

```text
https://YOUR_VERCEL_PROJECT.vercel.app/trips/trip-kanazawa-2026?invite=KANAZAWA-1842
```

`tabicho.com` をつないだ後はこの形です。

```text
https://tabicho.com/trips/trip-kanazawa-2026?invite=KANAZAWA-1842
```

## 友達に頼む確認

- スマホでURLが開ける
- 「持ち物」を1つ追加できる
- 「やること」を1つ追加できる
- 「お金」を1つ入力できる
- 「写真」タブで投稿ボタンが押せる
- 冊子プレビューが開ける

## 送る文章の例

```text
旅行アプリの試作を作ったので、スマホで少し触ってほしいです。
まだ試作なので、変な表示や押せないところがあったらスクショで教えてください。

URL:
https://YOUR_VERCEL_PROJECT.vercel.app/trips/trip-kanazawa-2026?invite=KANAZAWA-1842

見てほしいところ:
1. 持ち物を追加できるか
2. やることを追加できるか
3. お金を入力できるか
4. 写真投稿の入口が分かるか
5. 冊子プレビューが見られるか
```

## まだ未完成として伝えること

- Googleログインはこれから
- 実写真アップロードはこれから
- デザイン文言はまだ調整中
- PDFの本番出力はこれから
