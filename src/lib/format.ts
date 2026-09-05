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
