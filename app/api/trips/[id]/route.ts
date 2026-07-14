import { getTripActor } from "@/lib/api-auth";
import { jsonOk } from "@/lib/api-utils";
import { getTripSnapshot } from "@/lib/data";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { actor, error } = await getTripActor(request, params.id);
  if (error) return error;
  const snapshot = await getTripSnapshot(params.id);
  snapshot.comments = snapshot.comments.filter((comment) => comment.category !== "memo_private" || !actor || comment.user_id === actor.userId);
  return jsonOk(snapshot);
}
