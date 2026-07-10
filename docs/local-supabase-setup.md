# Local Supabase Setup

Use this when you want the local preview to save data into Supabase instead of demo data.

## Needed Values

From Supabase Project Settings > API:

- Project URL
- anon public key
- service_role key

Do not share the service role key.

## Steps

1. Open `CREATE_ENV_LOCAL.cmd`.
2. Open the created `.env.local`.
3. Paste your Supabase values.
4. Stop `START_PREVIEW.cmd` if it is running.
5. Open `START_PREVIEW.cmd` again.
6. Open `CHECK_SUPABASE_STATUS.cmd`.
7. Open `CHECK_SUPABASE_WRITE.cmd`.

## Expected Result

`CHECK_SUPABASE_STATUS.cmd` should show:

```text
"connected":true
```

`CHECK_SUPABASE_WRITE.cmd` should show:

```text
"writable":true
"cleanup":true
```

If it still says demo data, the `.env.local` values are missing or the server was not restarted.
