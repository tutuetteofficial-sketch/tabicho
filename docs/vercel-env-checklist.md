# Vercel Environment Checklist

Use this when setting up the Vercel project.

## Add These Variables

| Name | Value for first deploy | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, then later `https://tabicho.com` | Vercel project URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Supabase Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key | Supabase Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Supabase Project Settings > API |

## First Deploy

Before `tabicho.com` is connected, set:

```env
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_PROJECT.vercel.app
```

After deploy, check:

```text
https://YOUR_VERCEL_PROJECT.vercel.app/trips/trip-kanazawa-2026
https://YOUR_VERCEL_PROJECT.vercel.app/archive/trip-kanazawa-2026/print
```

## After Domain Setup

After `tabicho.com` is connected in Vercel, change:

```env
NEXT_PUBLIC_APP_URL=https://tabicho.com
```

Then redeploy.

## Keep Private

Do not share or screenshot:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The service role key can bypass database security rules, so it belongs only in Vercel environment variables.

## Later Auth Settings

When Google login is added, also update Supabase Auth:

```text
Site URL: https://tabicho.com
Redirect URLs:
https://tabicho.com/**
https://YOUR_VERCEL_PROJECT.vercel.app/**
```
