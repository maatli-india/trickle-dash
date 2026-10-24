import type { GoogleSearchLocationCount } from "@/lib/types";

export function GoogleSearchTopLocationsCard({ title, locations }: { title: string; locations: GoogleSearchLocationCount[] }) {
  const top = locations.slice(0, 5);
  const max = Math.max(...top.map((l) => l.count), 1);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-3 space-y-2">
        {top.length === 0 ? (
          <p className="font-body text-sm text-muted">No searches yet.</p>
        ) : (
          top.map((location) => (
            <a
              key={location.placeId}
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="block hover:opacity-70"
            >
              <div className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate font-body text-sm text-ink">{location.address || "Unknown address"}</span>
                <div className="h-2 flex-1 rounded-full bg-surface-muted">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(location.count / max) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-body text-xs text-muted">{location.count}</span>
              </div>
            </a>
          ))
        )}
      </div>
      <p className="mt-3 font-body text-xs text-faint">
        Places people searched via Google that our own location data didn&apos;t already have — worth adding locally if they show up often.
      </p>
    </div>
  );
}
