import { jsonOk, readJson } from "@/lib/api-utils";
import { getDemoTripSnapshot } from "@/lib/data";
import { deleteRow, saveRow, selectRows } from "@/lib/server-crud";

export async function GET() {
  const fallback = getDemoTripSnapshot().todos;
  return jsonOk(await selectRows("todos", fallback, { tripId: getDemoTripSnapshot().trip.id, order: "due_date" }));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const fallback = {
    id: body.id ?? "todo-" + Date.now(),
    trip_id: body.trip_id ?? getDemoTripSnapshot().trip.id,
    title: body.title ?? "新しいTodo",
    due_date: body.due_date ?? null,
    assigned_user_id: body.assigned_user_id ?? null,
    completed: Boolean(body.completed),
    emphasized: Boolean(body.emphasized),
    action: body.action
  };
  if (body.action === "delete") return jsonOk(await deleteRow("todos", fallback, fallback));
  return jsonOk(await saveRow("todos", fallback, fallback));
}
