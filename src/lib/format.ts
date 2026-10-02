// Date formatting must produce byte-identical output on the server (Next.js
// SSR, whatever locale the Node process happens to run under) and the
// client (the browser's own locale) — otherwise React's hydration diff
// fails, since the server-rendered text won't match what the client would
// have rendered. Passing an explicit locale (rather than relying on the
// ambient default `undefined` locale) is what makes that deterministic:
// both environments honor the same explicit locale identically.
const LOCALE = "en-IN";

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric" })}, ${date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })}`;
}

/** amountMinor is paise (or the smallest unit of `currency`); only INR is used today. */
export function formatMoney(amountMinor: number | undefined | null, currency = "INR"): string {
  if (amountMinor === undefined || amountMinor === null || Number.isNaN(amountMinor)) return "—";
  const major = amountMinor / 100;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${major.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
