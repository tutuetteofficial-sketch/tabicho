import { ProtectedTripPage } from "@/components/protected-trip-page";

export const dynamic = "force-dynamic";

export default function TripPage({ params, searchParams }: { params: { id: string }; searchParams?: { invite?: string } }) {
  return <ProtectedTripPage tripId={params.id} inviteCode={searchParams?.invite || null} />;
}
