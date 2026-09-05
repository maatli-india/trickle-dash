import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, TravelPlan } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";

export const metadata = { title: "Trips — Trickle Dash" };

const STATUS_TONE = { active: "success", completed: "info", cancelled: "neutral" } as const;

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(page));
  query.set("limit", "20");

  const paged = await apiGet<Paged<TravelPlan>>(`/v1/admin/travel-plans?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Trips</h1>
        <p className="mt-1 font-body text-sm text-muted">Every trip posted by a traveler across the platform.</p>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="status" defaultValue={params.status || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Departure</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No trips match this filter.
                </td>
              </tr>
            ) : (
              paged.items.map((plan) => (
                <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trips/${plan.id}`} className="font-body text-sm font-medium text-ink hover:underline">
                      {plan.from?.address || "?"} → {plan.to?.address || "?"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{plan.travelMode.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[plan.status]}>{plan.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{plan.departureDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/trips" searchParams={params} />
    </div>
  );
}
