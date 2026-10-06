import { Users, Package, Plane, ShieldAlert, UserPlus, CheckCircle2, Wallet, RotateCcw, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { OverviewStats, GoogleSearchStats } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { TrendCard } from "@/components/TrendCard";
import { TopCitiesCard } from "@/components/TopCitiesCard";
import { GoogleSearchTopSearchersCard } from "@/components/GoogleSearchTopSearchersCard";

export const metadata = { title: "Overview — Trickle Dash" };

function formatINR(amountMinor: number): string {
  return `₹${Math.round(amountMinor / 100).toLocaleString("en-IN")}`;
}

export default async function OverviewPage() {
  const [stats, googleSearchStats] = await Promise.all([
    apiGet<OverviewStats>("/v1/admin/overview"),
    apiGet<GoogleSearchStats>("/v1/admin/google-search-stats"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
        <p className="mt-1 font-body text-sm text-muted">A snapshot of what&apos;s happening across Trickle right now.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Parcel requests" value={stats.totalParcelRequests} icon={Package} />
        <StatCard label="Trips posted" value={stats.totalTripsPosted} icon={Plane} />
        <StatCard
          label="Reports awaiting review"
          value={stats.reportsAwaitingReview}
          icon={ShieldAlert}
          tone={stats.reportsAwaitingReview > 0 ? "danger" : "neutral"}
        />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">This week</h2>
        <p className="mt-1 font-body text-sm text-muted">Each card compares this week to last week, with the last 12 weeks charted below it.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TrendCard label="Users onboarded" icon={UserPlus} metric={stats.signups} />
          <TrendCard label="Deliveries completed" icon={CheckCircle2} metric={stats.deliveriesCompleted} />
          <TrendCard label="Plans created" icon={Plane} metric={stats.plansCreated} />
          <TrendCard label="Payments collected" icon={Wallet} metric={stats.paymentsCollectedMinor} format={formatINR} />
          <TrendCard label="Refunds" icon={RotateCcw} metric={stats.refundsMinor} format={formatINR} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopCitiesCard title="Top pickup areas" cities={stats.topOriginCities} />
        <TopCitiesCard title="Top delivery areas" cities={stats.topDestinationCities} />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Google location search fallback</h2>
        <p className="mt-1 font-body text-sm text-muted">
          How often &quot;Don&apos;t see your location above? Search for more results&quot; gets tapped — i.e. our own search had nothing, so we paid for a
          Google Places call.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TrendCard label="From Select Location" icon={Search} metric={googleSearchStats.selectLocation.metric} />
          <TrendCard label="From Create Trip" icon={Search} metric={googleSearchStats.createTrip.metric} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GoogleSearchTopSearchersCard title="Top searchers — Select Location" searchers={googleSearchStats.selectLocation.topSearchers} />
          <GoogleSearchTopSearchersCard title="Top searchers — Create Trip" searchers={googleSearchStats.createTrip.topSearchers} />
        </div>
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
