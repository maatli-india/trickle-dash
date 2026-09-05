import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { TravelPlan } from "@/lib/types";
import { Badge } from "@/components/Badge";

export const metadata = { title: "Trip detail — Trickle Dash" };

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await apiGet<TravelPlan>(`/v1/admin/travel-plans/${encodeURIComponent(id)}`);

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/trips" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to trips
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">
            {plan.from?.address || "?"} → {plan.to?.address || "?"}
          </h1>
          <Badge tone={plan.status === "active" ? "success" : "neutral"}>{plan.status}</Badge>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 font-body text-sm">
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Travel mode</dt>
            <dd className="mt-0.5 text-ink">{plan.travelMode.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Traveler</dt>
            <dd className="mt-0.5 text-ink">{plan.travelerId}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Departure</dt>
            <dd className="mt-0.5 text-ink">{plan.departureDate}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Arrival</dt>
            <dd className="mt-0.5 text-ink">{plan.arrivalDate}</dd>
          </div>
          {plan.maxWeightKg ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Max weight</dt>
              <dd className="mt-0.5 text-ink">{plan.maxWeightKg} kg</dd>
            </div>
          ) : null}
          {plan.pricePerPackage ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Price per package</dt>
              <dd className="mt-0.5 text-ink">₹{plan.pricePerPackage}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
