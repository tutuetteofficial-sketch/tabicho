import type { CSSProperties, ReactNode } from "react";
import QRCode from "qrcode";
import { getTripSnapshot } from "@/lib/data";
import type { Expense, ItineraryItem, Photo, TripMember, TripSnapshot } from "@/lib/types";
import { PrintButton } from "./print-button";

export default async function ArchivePrintPage({ params }: { params: { tripId: string } }) {
  const snapshot = await getTripSnapshot(params.tripId);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://tabicho.vercel.app").replace(/\/$/, "");
  const shareUrl = `${appUrl}/trips/${snapshot.trip.id}?invite=${encodeURIComponent(snapshot.trip.invite_code)}`;
  const qrSvg = await QRCode.toString(shareUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: { dark: "#173235", light: "#ffffff" }
  });
  const pages = buildBookletPages(snapshot, shareUrl, qrSvg);
  const spreads = buildPreviewSpreads(pages);
  const isSupabaseSource = snapshot.source === "supabase";

  return (
    <main className="booklet-root">
      <section className={"storage-status " + (isSupabaseSource ? "online" : "demo")}>
        <div>
          <strong>{isSupabaseSource ? "Supabase saved" : "Demo data mode"}</strong>
          <span>{snapshot.sourceMessage || (isSupabaseSource ? "Loaded from Supabase." : "Using local demo data.")}</span>
        </div>
        <a href={`/trips/${snapshot.trip.id}`}>{"\u65c5\u30da\u30fc\u30b8\u3078\u623b\u308b"}</a>
      </section>

      <div className="print-toolbar">
        <div>
          <strong>{"\u65c5\u306e\u3057\u304a\u308a\u30a2\u30fc\u30ab\u30a4\u30d6"}</strong>
          <span>{"\u30dc\u30bf\u30f3\u3092\u62bc\u3057\u3001\u5370\u5237\u753b\u9762\u306e\u9001\u4fe1\u5148\u3067\u300cPDF\u306b\u4fdd\u5b58\u300d\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002"}</span>
        </div>
        <PrintButton />
      </div>

      <div className="booklet-preview-stack">
        {spreads.map((spread, index) => (
          <section className="booklet-spread-preview" key={index}>
            <div className="spread-label">{"\u898b\u958b\u304d"} {index + 1}</div>
            <div className="booklet-spread">
              {spread.map((page) => <BookletPage key={page.number} page={page} />)}
            </div>
          </section>
        ))}
      </div>

      <div className="booklet-print-stack" aria-hidden="true">
        {spreads.map((spread, index) => (
          <section className="booklet-sheet" key={index}>
            {spread.map((page) => <BookletPage key={page.number} page={page} />)}
          </section>
        ))}
      </div>
    </main>
  );
}

type BookletPageData = {
  number: number;
  title: string;
  kicker: string;
  body: ReactNode;
  className?: string;
};

function BookletPage({ page }: { page: BookletPageData }) {
  return (
    <article className={"booklet-panel booklet-page " + (page.className || "")}>
      <div className="booklet-page-inner">
        <p className="booklet-kicker">{page.kicker}</p>
        <h1>{page.title}</h1>
        <div className="booklet-page-body">{page.body}</div>
        <footer className="booklet-page-number">{page.number}</footer>
      </div>
    </article>
  );
}

function buildBookletPages(snapshot: TripSnapshot, shareUrl: string, qrSvg: string): BookletPageData[] {
  const coverPhoto = snapshot.photos.find((photo) => photo.category === "bestshot" && photo.cover_candidate) || snapshot.photos[0];
  const selectedPhotos = snapshot.photos.filter((photo) => photo.pdf_selected).slice(0, 8);
  const bestshots = snapshot.photos.filter((photo) => photo.category === "bestshot").slice(0, 8);
  const settlements = calculateSettlements(snapshot.members, snapshot.expenses);

  return [
    {
      number: 1,
      kicker: "cover",
      title: snapshot.trip.title,
      className: "cover booklet-cover",
      body: (
        <div className="booklet-cover-art">
          <PhotoBlock photo={coverPhoto} />
          <p>{snapshot.trip.destination} / {formatDate(snapshot.trip.start_date)} - {formatDate(snapshot.trip.end_date)}</p>
        </div>
      )
    },
    {
      number: 2,
      kicker: "contents",
      title: "\u76ee\u6b21",
      body: (
        <ol className="booklet-toc">
          <li>{"\u30e1\u30f3\u30d0\u30fc"}</li>
          <li>{"\u6301\u3061\u7269\u30fb\u3084\u308b\u3053\u3068"}</li>
          <li>{"\u5b9f\u969b\u306e\u65c5\u7a0b"}</li>
          <li>{"\u65c5\u7a0b\u5199\u771f"}</li>
          <li>{"\u30d9\u30b9\u30c8\u30a2\u30eb\u30d0\u30e0"}</li>
          <li>{"\u7cbe\u7b97\u30fb\u611f\u60f3\u30fbQR"}</li>
        </ol>
      )
    },
    {
      number: 3,
      kicker: "members",
      title: "\u30e1\u30f3\u30d0\u30fc",
      body: (
        <div className="booklet-members">
          {snapshot.members.map((member, index) => (
            <div key={member.id}>
              <span className="avatar" style={avatarStyle(member, index)}>{avatarText(member)}</span>
              <strong>{displayMemberName(member)}</strong>
              <small>{member.role}</small>
            </div>
          ))}
        </div>
      )
    },
    {
      number: 4,
      kicker: "prep",
      title: "\u6301\u3061\u7269\u30fb\u3084\u308b\u3053\u3068",
      body: (
        <div className="booklet-two-lists">
          <div>
            <h3>{"\u6301\u3061\u7269"}</h3>
            <ul>{snapshot.packing.slice(0, 10).map((item) => <li key={item.id}>{item.checked ? "\u5b8c\u4e86" : "\u672a"} {item.name}</li>)}</ul>
          </div>
          <div>
            <h3>{"\u3084\u308b\u3053\u3068"}</h3>
            <ul>{snapshot.todos.slice(0, 10).map((todo) => <li key={todo.id}>{todo.completed ? "\u5b8c\u4e86" : "\u672a"} {todo.title}</li>)}</ul>
          </div>
        </div>
      )
    },
    {
      number: 5,
      kicker: "itinerary",
      title: "\u5b9f\u969b\u306e\u65c5\u7a0b",
      body: (
        <div className="booklet-itinerary">
          {snapshot.days.map((day, index) => (
            <section key={day.id}>
              <h3>Day {index + 1} {formatDate(day.date)}</h3>
              {snapshot.itinerary.filter((item) => item.day_id === day.id).sort(sortByTime).map((item) => (
                <p key={item.id}><b>{item.start_time}</b> {item.title}</p>
              ))}
            </section>
          ))}
        </div>
      )
    },
    {
      number: 6,
      kicker: "photos",
      title: "\u65c5\u7a0b\u5199\u771f",
      body: (
        <div className="booklet-photo-grid">
          {selectedPhotos.length ? selectedPhotos.map((photo) => (
            <PhotoBlock key={photo.id} photo={photo} caption={photo.pdf_caption || photo.caption || displayUser(snapshot, photo.uploader_id)} />
          )) : <p>{"PDF\u306b\u8f09\u305b\u308b\u5199\u771f\u306f\u3001\u5199\u771f\u30bf\u30d6\u3067\u9078\u3079\u307e\u3059\u3002"}</p>}
        </div>
      )
    },
    {
      number: 7,
      kicker: "best album",
      title: "\u30d9\u30b9\u30c8\u30a2\u30eb\u30d0\u30e0",
      body: (
        <div className="booklet-photo-grid">
          {bestshots.length ? bestshots.map((photo) => (
            <PhotoBlock key={photo.id} photo={photo} caption={photo.caption || displayUser(snapshot, photo.uploader_id)} />
          )) : <p>{"\u30d9\u30b9\u30c8\u30b7\u30e7\u30c3\u30c8\u306f\u3001\u5199\u771f\u30bf\u30d6\u304b\u3089\u8ffd\u52a0\u3067\u304d\u307e\u3059\u3002"}</p>}
        </div>
      )
    },
    {
      number: 8,
      kicker: "money",
      title: "\u7cbe\u7b97",
      body: (
        <div className="booklet-settlements">
          {settlements.length
            ? settlements.map((item) => <p key={item.fromId + item.toId}>{displayUser(snapshot, item.fromId)} -&gt; {displayUser(snapshot, item.toId)} <b>{yen(item.amount)}</b></p>)
            : <p>{"\u7cbe\u7b97\u306f\u3042\u308a\u307e\u305b\u3093\u3002"}</p>}
        </div>
      )
    },
    {
      number: 9,
      kicker: "reflection",
      title: "\u611f\u60f3\u30ab\u30fc\u30c9",
      body: (
        <div className="booklet-reflections">
          {snapshot.members.map((member) => {
            const reflection = snapshot.reflections.find((item) => item.user_id === member.user_id);
            return (
              <article key={member.id}>
                <strong>{displayMemberName(member)}</strong>
                <p>{"\u3044\u3061\u3070\u3093\u7f8e\u5473\u3057\u304b\u3063\u305f\u3082\u306e"}: {reflection?.best_food || "\u672a\u5165\u529b"}</p>
                <p>{"\u597d\u304d\u306a\u666f\u8272"}: {reflection?.favorite_view || "\u672a\u5165\u529b"}</p>
                <p>{reflection?.comment || "\u3072\u3068\u3053\u3068\u30b3\u30e1\u30f3\u30c8\u672a\u5165\u529b"}</p>
              </article>
            );
          })}
        </div>
      )
    },
    {
      number: 10,
      kicker: "qr",
      title: "QR\u30ea\u30f3\u30af",
      body: (
        <div className="booklet-qr">
          <div className="booklet-qr-box" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <a href={shareUrl}>{shareUrl}</a>
          <small>{"\u5370\u5237\u3057\u305f\u518a\u5b50\u304b\u3089\u3001\u5199\u771f\u30fb\u611f\u60f3\u30fb\u65c5\u7a0b\u3092\u898b\u8fd4\u3059\u305f\u3081\u306e\u5165\u53e3\u3067\u3059\u3002"}</small>
        </div>
      )
    }
  ];
}

function buildPreviewSpreads(pages: BookletPageData[]) {
  const spreads: BookletPageData[][] = [];
  for (let index = 0; index < pages.length; index += 2) {
    spreads.push(pages.slice(index, index + 2));
  }
  return spreads;
}

function PhotoBlock({ photo, caption }: { photo?: Photo; caption?: string }) {
  if (!photo) return <div className="booklet-photo empty">{"\u5199\u771f\u672a\u9078\u629e"}</div>;
  return (
    <figure className="booklet-photo">
      <span style={{ "--photo": photo.image_url } as CSSProperties} />
      <figcaption>{caption || photo.caption || "\u601d\u3044\u51fa\u5199\u771f"}</figcaption>
    </figure>
  );
}

function calculateSettlements(members: TripMember[], expenses: Expense[]) {
  const balance = new Map(members.map((member) => [member.user_id, 0]));
  expenses.forEach((expense) => {
    const participants = expense.participant_ids.length ? expense.participant_ids : members.map((member) => member.user_id);
    const share = Math.round(expense.amount / Math.max(participants.length, 1));
    balance.set(expense.payer_id, (balance.get(expense.payer_id) || 0) + expense.amount);
    participants.forEach((id) => balance.set(id, (balance.get(id) || 0) - share));
  });

  const debtors = [...balance.entries()].filter(([, amount]) => amount < 0).map(([id, amount]) => ({ id, amount: -amount }));
  const creditors = [...balance.entries()].filter(([, amount]) => amount > 0).map(([id, amount]) => ({ id, amount }));
  const result: { fromId: string; toId: string; amount: number }[] = [];

  debtors.forEach((debtor) => {
    creditors.forEach((creditor) => {
      if (debtor.amount <= 0 || creditor.amount <= 0) return;
      const amount = Math.min(debtor.amount, creditor.amount);
      result.push({ fromId: debtor.id, toId: creditor.id, amount });
      debtor.amount -= amount;
      creditor.amount -= amount;
    });
  });

  return result;
}

function displayUser(snapshot: TripSnapshot, userId?: string) {
  const member = snapshot.members.find((candidate) => candidate.user_id === userId);
  return member ? displayMemberName(member) : "\u672a\u8a2d\u5b9a";
}

function displayMemberName(member: TripMember) {
  return member.trip_nickname?.trim() || member.user.name;
}

function avatarText(member: TripMember) {
  return (member.trip_nickname || member.user.icon || member.user.name).slice(0, 1);
}

function avatarStyle(member: TripMember, index = 0): CSSProperties {
  const fallback = ["#2f6f73", "#d86b55", "#3c6d96", "#4d8060"][index % 4];
  const background = member.trip_avatar_url?.startsWith("linear-gradient") ? member.trip_avatar_url : fallback;
  return { background };
}

function sortByTime(a: ItineraryItem, b: ItineraryItem) {
  return a.start_time.localeCompare(b.start_time, "ja");
}

function yen(amount: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(date));
}
