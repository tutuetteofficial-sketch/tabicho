import { hasSupabaseConfig } from "@/lib/supabase";
import { redirect } from "next/navigation";

const launchLinks = [
  {
    title: "1. Trip app",
    body: "Open the real trip workspace.",
    href: "/trips/trip-kanazawa-2026"
  },
  {
    title: "2. Setup",
    body: "Open local and Supabase setup checks.",
    href: "/setup"
  },
  {
    title: "3. DB read check",
    body: "Check Supabase environment values and table reads.",
    href: "/api/db-check"
  },
  {
    title: "4. DB write check",
    body: "Insert and delete one test item.",
    href: "/api/db-write-check"
  },
  {
    title: "5. Booklet preview",
    body: "Open the archive booklet preview.",
    href: "/archive/trip-kanazawa-2026/print"
  },
  {
    title: "6. Server health",
    body: "Confirm that the Next.js server is running.",
    href: "/health"
  }
];

export default function LaunchPage() {
  if (process.env.NODE_ENV === "production") redirect("/");

  const supabaseConfigured = hasSupabaseConfig();

  return (
    <main className="diagnostic-page">
      <h1>Tabicho Launch Check</h1>
      <p>
        Start here after local launch or Vercel deploy. This page gathers the
        links needed to confirm the app is usable.
      </p>

      <div className="launch-status">
        <div>
          <strong>App</strong>
          <span>Ready to open</span>
        </div>
        <div className={supabaseConfigured ? "ok" : "demo"}>
          <strong>Supabase</strong>
          <span>{supabaseConfigured ? "Configured" : "Demo data mode"}</span>
        </div>
      </div>

      <div className="setup-link-list">
        {launchLinks.map((link) => (
          <a className="setup-link-card" href={link.href} key={link.href}>
            <strong>{link.title}</strong>
            <span>{link.body}</span>
          </a>
        ))}
      </div>

      <pre>{`Recommended order
1. Open Trip app
2. Run DB read check
3. Run DB write check
4. Open Booklet preview`}</pre>
    </main>
  );
}
