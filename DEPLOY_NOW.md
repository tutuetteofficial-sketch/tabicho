# Deploy Now

友達に試用してもらうための公開手順です。

## 0. 先に知っておくこと

`http://127.0.0.1:3000` と `localhost` は自分のPCだけで開けるURLです。
友達に送るには、Vercel の公開URLが必要です。

## 1. Supabaseを作る

1. Supabaseで新しいProjectを作る
2. SQL Editorを開く
3. このファイルの中身を全部実行する

```text
supabase/setup.sql
```

4. Project Settings > API から次の3つを控える

```text
Project URL
anon public key
service_role key
```

`service_role key` は秘密です。友達に送らない、スクショに入れない。

## 2. Vercelで公開する

1. Vercelで New Project
2. このアプリをImport
3. Framework Preset は Next.js
4. Build and Output Settings は基本そのまま
5. Environment Variables に下の4つを入れる

```env
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_PROJECT.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

6. Deploy

## 3. 公開後に最初に開く

```text
https://YOUR_VERCEL_PROJECT.vercel.app/launch
```

ここで `Supabase` が `Configured` になっているか確認します。

## 4. 友達に送るURL

```text
https://YOUR_VERCEL_PROJECT.vercel.app/trips/trip-kanazawa-2026?invite=KANAZAWA-1842
```

## 5. 友達に送る文章

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

## 6. tabicho.comを使う場合

VercelのProject Settings > Domains に `tabicho.com` を追加します。
接続できたら Vercel の環境変数を変更します。

```env
NEXT_PUBLIC_APP_URL=https://tabicho.com
```

その後、Redeployします。
