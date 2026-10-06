import Link from "next/link";
import type { GoogleSearchActorCount } from "@/lib/types";

export function GoogleSearchTopSearchersCard({ title, searchers }: { title: string; searchers: GoogleSearchActorCount[] }) {
  const top = searchers.slice(0, 5);
  const max = Math.max(...top.map((s) => s.count), 1);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-3 space-y-2">
        {top.length === 0 ? (
          <p className="font-body text-sm text-muted">No searches yet.</p>
        ) : (
          top.map((searcher) => {
            const key = searcher.userId ?? searcher.deviceId ?? "unknown";
            const label = searcher.userId ? `User ${searcher.userId.slice(0, 8)}…` : `Device ${searcher.deviceId?.slice(0, 8)}…`;
            const row = (
              <div className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate font-body text-sm text-ink">{label}</span>
                <div className="h-2 flex-1 rounded-full bg-surface-muted">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(searcher.count / max) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-body text-xs text-muted">{searcher.count}</span>
              </div>
            );
            return searcher.userId ? (
              <Link key={key} href={`/dashboard/users/${searcher.userId}`} className="block hover:opacity-70">
                {row}
              </Link>
            ) : (
              <div key={key}>{row}</div>
            );
          })
        )}
      </div>
      <p className="mt-3 font-body text-xs text-faint">Devices are logged-out searches with no account to attribute to.</p>
    </div>
  );
}
