"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}>
      {"\u5370\u5237\u30fbPDF\u4fdd\u5b58"}
    </button>
  );
}
