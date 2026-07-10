"use client";

export function PrintButton() {
  return <button type="button" onClick={() => window.print()}>印刷 / PDF保存</button>;
}
