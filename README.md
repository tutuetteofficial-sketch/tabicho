# Tabicho / Tabi OS

A Next.js + Supabase prototype for planning, running, recording, and archiving trips.

## Local Preview

On Windows, open:

```text
START_PREVIEW.cmd
```

Then open:

```text
http://127.0.0.1:3000/trips/trip-kanazawa-2026
```

Launch check page:

```text
http://127.0.0.1:3000/launch
```

Setup page:

```text
http://127.0.0.1:3000/setup
```

## Build Check

Before deploying, open:

```text
CHECK_PRODUCTION_BUILD.cmd
```

If it says `OK: Production build passed.`, the app is ready for Vercel build checks.

## Supabase Check

To create the local environment file, open:

```text
CREATE_ENV_LOCAL.cmd
```

Then paste your Supabase values into `.env.local`, restart `START_PREVIEW.cmd`, and open:

```text
CHECK_SUPABASE_STATUS.cmd
```

Or visit:

```text
http://127.0.0.1:3000/api/db-check
```

To confirm that writes are reaching Supabase, open:

```text
CHECK_SUPABASE_WRITE.cmd
```

It inserts and deletes one test packing item.

## Production Setup

The intended first production stack is Vercel + Supabase.

Useful files:

- `docs/production-setup.md`
- `docs/local-supabase-setup.md`
- `docs/vercel-env-checklist.md`
- `.env.local.example`
- `.env.production.example`
- `supabase/setup.sql`
- `supabase/migrations/0001_init.sql`
- `vercel.json`

## Main Pages

- `/trips/trip-kanazawa-2026`
- `/archive/trip-kanazawa-2026/print`
- `/launch`
- `/setup`

## Next Production Tasks

1. Create a Supabase project.
2. Run `supabase/setup.sql`.
3. Create a Vercel project.
4. Add the environment variables from `.env.production.example`.
5. Deploy and test the trip page.
6. Add Google login, invite flow, Supabase Storage, and real PDF generation.
