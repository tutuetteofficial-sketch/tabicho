"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}>
      {"PDF\u3068\u3057\u3066\u4fdd\u5b58"}
    </button>
  );
}
