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

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * Short relative time ("3h ago"), falling back to the absolute date once
 * it's more than a day stale (so a list rendered once on the server doesn't
 * read as misleadingly fresh if someone leaves the tab open a while).
 */
export function formatRelativeTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60 * 1000) return "just now";
  if (diffMs >= 24 * 60 * 60 * 1000) return formatDateTime(iso);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "always", style: "short" });
  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (diffMs >= unitMs) {
      return rtf.format(-Math.floor(diffMs / unitMs), unit);
    }
  }
  return "just now";
}

/** amountMinor is paise (or the smallest unit of `currency`); only INR is used today. */
export function formatMoney(amountMinor: number | undefined | null, currency = "INR"): string {
  if (amountMinor === undefined || amountMinor === null || Number.isNaN(amountMinor)) return "—";
  const major = amountMinor / 100;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${major.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
