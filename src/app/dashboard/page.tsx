import { Users, Package, Plane, ShieldAlert } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Paged } from "@/lib/types";
import { StatCard } from "@/components/StatCard";

async function count(path: string): Promise<number> {
  try {
    const paged = await apiGet<Paged<unknown>>(path);
    return paged.total;
  } catch {
    return 0;
  }
}

export const metadata = { title: "Overview — Trickle Dash" };

export default async function OverviewPage() {
  const [users, requests, trips, submitted, underReview] = await Promise.all([
    count("/v1/admin/users?limit=1"),
    count("/v1/admin/parcel-matches?limit=1"),
    count("/v1/admin/travel-plans?limit=1"),
    count("/v1/admin/reports?status=submitted&limit=1"),
    count("/v1/admin/reports?status=under_review&limit=1"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
        <p className="mt-1 font-body text-sm text-muted">A snapshot of what&apos;s happening across Trickle right now.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users} icon={Users} />
        <StatCard label="Parcel requests" value={requests} icon={Package} />
        <StatCard label="Trips posted" value={trips} icon={Plane} />
        <StatCard label="Reports awaiting review" value={submitted + underReview} icon={ShieldAlert} tone={submitted + underReview > 0 ? "danger" : "neutral"} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Where to go next</h2>
        <ul className="mt-3 space-y-2 font-body text-sm text-muted">
          <li>
            <strong className="text-ink">Reports</strong> — anything marked urgent (suspected illegal contents) has already put its shipment on hold; review it there.
          </li>
          <li>
            <strong className="text-ink">Configuration</strong> — feature flags and safety thresholds take effect immediately, no redeploy.
          </li>
          <li>
            <strong className="text-ink">Content</strong> — Privacy Policy, Terms, FAQ, and the parcel-declaration liability text are all editable there.
          </li>
        </ul>
      </div>
    </div>
  );
}
