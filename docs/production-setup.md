# Production Setup

This is the shortest route from the local prototype to a real shared web app.

## Goal

- The app opens from a Vercel URL.
- Trip data can be saved in Supabase.
- Invite URLs can be shared.
- `tabicho.com` can be connected later.

## 1. Supabase

Create a Supabase project and keep these values:

- Project URL
- anon public key
- service_role key

Important:

- The anon key is public.
- The service_role key is private. Do not paste it into public pages or screenshots.

## 2. Database

Open Supabase SQL Editor and run this single setup file:

```text
supabase/setup.sql
```

The current schema uses text IDs such as `trip-kanazawa-2026` and `user-haru` so the live database matches the current prototype.

This creates the database tables and the first trip, members, schedule, packing items, todos, expenses, photos, and reflections. Without this setup, the database exists but the first shared trip has no real rows yet.

## 3. Vercel

Create a Vercel project for this Next.js app.

Settings:

- Framework: Next.js
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`

These are also written in `vercel.json`.

## 4. Environment Variables

Copy the names from `.env.production.example` into Vercel Project Settings.
For a field-by-field checklist, use:

```text
docs/vercel-env-checklist.md
```

```env
NEXT_PUBLIC_APP_URL=https://tabicho.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Before the custom domain is connected, use the Vercel URL for `NEXT_PUBLIC_APP_URL`.

## 5. Deploy Check

After deploy, check:

```text
/trips/trip-kanazawa-2026
/archive/trip-kanazawa-2026/print
```

Minimum checks:

- Trip page opens.
- Packing item can be added.
- Todo can be added.
- Expense can be added.
- Photo post modal opens.
- PDF creation tab opens.
- Print preview opens.

## 6. Domain

After buying `tabicho.com`, add it in Vercel Project Settings > Domains.

Then update:

- `NEXT_PUBLIC_APP_URL=https://tabicho.com`
- Supabase Auth Site URL: `https://tabicho.com`
- Supabase Auth Redirect URLs:

```text
https://tabicho.com/**
https://YOUR_VERCEL_PROJECT.vercel.app/**
```

## 7. Next Real Features

1. Supabase Auth with Google login.
2. Invite URL creates or updates TripMember.
3. Supabase Storage photo upload.
4. Production Row Level Security policies.
5. Server-side PDF generation.
