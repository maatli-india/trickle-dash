import type { ParcelFunnel } from "@/lib/types";

// Parcel requests created in the last 30 days, by the furthest stage their
// current status shows. Stages are cumulative, so each bar is a share of
// "Requested" and the drop between bars is where requests stall.
export function ParcelFunnelCard({ funnel }: { funnel?: ParcelFunnel }) {
  const f = funnel ?? { requested: 0, accepted: 0, confirmed: 0, delivered: 0, cancelled: 0, open: 0 };
  const base = Math.max(f.requested, 1);
  const stages: Array<[string, number]> = [
    ["Requested", f.requested],
    ["Traveller accepted", f.accepted],
    ["Confirmed / paid", f.confirmed],
    ["Delivered", f.delivered],
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">Parcel funnel · last 30 days</h3>
      {f.requested === 0 ? (
        <p className="mt-3 font-body text-sm text-muted">No parcel requests in the last 30 days.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {stages.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate font-body text-sm text-ink">{label}</span>
              <div className="h-2 flex-1 rounded-full bg-surface-muted">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${(value / base) * 100}%` }} />
              </div>
              <span className="w-20 shrink-0 text-right font-body text-xs text-muted">
                {value} · {Math.round((value / base) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 font-body text-xs text-faint">
        Still open: {f.open} · Cancelled, rejected or expired: {f.cancelled}. Based on each request&apos;s current status, so a
        request cancelled after acceptance counts only as cancelled.
      </p>
    </div>
  );
}
