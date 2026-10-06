import type { CityCount } from "@/lib/types";

export function TopCitiesCard({ title, cities }: { title: string; cities: CityCount[] }) {
  const max = Math.max(...cities.map((city) => city.count), 1);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-3 space-y-2">
        {cities.length === 0 ? (
          <p className="font-body text-sm text-muted">Not enough data yet.</p>
        ) : (
          cities.map((city) => (
            <div key={city.city} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate font-body text-sm text-ink">{city.city}</span>
              <div className="h-2 flex-1 rounded-full bg-surface-muted">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${(city.count / max) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right font-body text-xs text-muted">{city.count}</span>
            </div>
          ))
        )}
      </div>
      <p className="mt-3 font-body text-xs text-faint">
        Best-effort, parsed from free-text pickup/delivery addresses — not a verified place name.
      </p>
    </div>
  );
}
