import { TripShell } from "@/components/trip-shell";
import { getTripSnapshot } from "@/lib/data";

export default async function Home() {
  const snapshot = await getTripSnapshot();
  return <TripShell initialSnapshot={snapshot} />;
}
