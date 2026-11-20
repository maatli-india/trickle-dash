import type { RevenueSummary } from "@/lib/types";

function formatINR(amountMinor: number): string {
  return `₹${Math.round(amountMinor / 100).toLocaleString("en-IN")}`;
}

const empty: RevenueSummary = {
  deliveries: 0,
  grossMinor: 0,
  commissionMinor: 0,
  travelerPayoutsMinor: 0,
  gstMinor: 0,
  avgOrderMinor: 0,
};

// Money from deliveries completed in a calendar month (UTC), from the
// pricing stored on each completed parcel match.
export function RevenueCard({ title, summary, compare }: { title: string; summary?: RevenueSummary; compare?: RevenueSummary }) {
  const s = summary ?? empty;
  const rows: Array<[string, string, string?]> = [
    ["Deliveries completed", s.deliveries.toLocaleString("en-IN"), compare ? compare.deliveries.toLocaleString("en-IN") : undefined],
    ["GMV (sender paid, incl. GST)", formatINR(s.grossMinor), compare ? formatINR(compare.grossMinor) : undefined],
    ["Trickle commission", formatINR(s.commissionMinor), compare ? formatINR(compare.commissionMinor) : undefined],
    ["Traveller payouts", formatINR(s.travelerPayoutsMinor), compare ? formatINR(compare.travelerPayoutsMinor) : undefined],
    ["GST collected", formatINR(s.gstMinor), compare ? formatINR(compare.gstMinor) : undefined],
    ["Average order", formatINR(s.avgOrderMinor), compare ? formatINR(compare.avgOrderMinor) : undefined],
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">{title}</h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value, prev]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="font-body text-sm text-muted">{label}</dt>
            <dd className="text-right font-body text-sm font-semibold text-ink">
              {value}
              {prev !== undefined && <span className="ml-2 font-normal text-xs text-faint">last month {prev}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
