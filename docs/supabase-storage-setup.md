# Supabase Storage setup

Photo upload uses a Supabase Storage bucket named `trip-photos`.

## Required bucket

Create this bucket in Supabase:

- Name: `trip-photos`
- Public bucket: on
- Suggested file size limit: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

The app uploads resized photos through `/api/photos/upload` and stores the public URL in the `photos.image_url` column.

If the bucket is not available, the app falls back to storing the resized image data directly so photo posting still works during setup.
