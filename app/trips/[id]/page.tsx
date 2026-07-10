import { TripShell } from "@/components/trip-shell";
import { getTripSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TripPage({ params, searchParams }: { params: { id: string }; searchParams?: { invite?: string } }) {
  const snapshot = await getTripSnapshot(params.id);
  return <TripShell initialSnapshot={snapshot} inviteCode={searchParams?.invite || null} />;
}
