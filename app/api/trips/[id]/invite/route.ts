import { jsonOk, readJson } from "@/lib/api-utils";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await readJson(request);
  return jsonOk({
    trip_id: params.id,
    invite_code: body.invite_code ?? "INV-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    invite_url: (body.base_url ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/invite/" + params.id
  });
}
