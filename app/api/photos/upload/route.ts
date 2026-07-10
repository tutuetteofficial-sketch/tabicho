import { jsonOk, readJson } from "@/lib/api-utils";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

const PHOTO_BUCKET = "trip-photos";

export async function POST(request: Request) {
  const body = await readJson(request);
  const dataUrl = typeof body.data_url === "string" ? body.data_url : "";
  const tripId = typeof body.trip_id === "string" ? body.trip_id : "trip";
  const uploaderId = typeof body.uploader_id === "string" ? body.uploader_id : "user";
  const parsed = parseImageDataUrl(dataUrl);

  if (!parsed) {
    return jsonOk({ image_url: dataUrl, storage_path: null, stored: false });
  }

  const supabase = hasSupabaseConfig() ? createServerSupabaseClient() : null;
  if (!supabase) {
    return jsonOk({ image_url: dataUrl, storage_path: null, stored: false });
  }

  const extension = extensionForMime(parsed.mime);
  const safeTripId = tripId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const safeUserId = uploaderId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const storagePath = `${safeTripId}/${safeUserId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, parsed.buffer, {
      contentType: parsed.mime,
      upsert: false
    });

  if (error) {
    return jsonOk({ image_url: dataUrl, storage_path: null, stored: false, message: error.message });
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
  return jsonOk({ image_url: data.publicUrl, storage_path: storagePath, stored: true });
}

function parseImageDataUrl(value: string) {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
