import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { ParcelMatch } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Request detail — Trickle Dash" };

const DECLARATION_LABELS: Record<string, string> = {
  noNarcotics: "Narcotics or other controlled substances",
  noWeapons: "Weapons, ammunition, or explosives",
  noCashInstruments: "Cash or bearer financial instruments",
  noLiveAnimals: "Live animals",
  noHazmat: "Hazardous, flammable, or toxic materials",
  noCounterfeitGoods: "Counterfeit goods",
  noOtherProhibited: "Anything else prohibited by law",
};

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await apiGet<ParcelMatch>(`/v1/admin/parcel-matches/${encodeURIComponent(id)}`);
  const declaration = match.safetyDeclaration;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to requests
      </Link>

      {match.safetyHold ? (
        <div className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger">
          This shipment is on hold pending a safety review. It cannot proceed to handoff or delivery until an admin clears it via the linked report.
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{match.parcelDescription || "Parcel request"}</h1>
            <p className="mt-1 font-body text-sm text-muted">
              {match.senderName || match.senderUserId} → {match.travelerName || match.travelerUserId}
            </p>
          </div>
          <Badge tone={match.safetyHold ? "danger" : "neutral"}>{match.status.replace(/_/g, " ")}</Badge>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 font-body text-sm">
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Category</dt>
            <dd className="mt-0.5 text-ink">{match.parcelCategory || "—"}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Weight</dt>
            <dd className="mt-0.5 text-ink">{match.estimatedWeightKg ? `${match.estimatedWeightKg} kg` : "—"}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Declared value</dt>
            <dd className="mt-0.5 text-ink">{match.declaredValue ? `₹${match.declaredValue}` : "—"}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Inspection acknowledged</dt>
            <dd className="mt-0.5 text-ink">{match.inspectionAcknowledged ? "Yes" : "Not yet"}</dd>
          </div>
        </dl>
      </div>

      {declaration ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Sender&apos;s safety declaration</h2>
          <p className="mt-1 font-body text-xs text-muted">
            Version {declaration.declarationVersion} · declared {formatDateTime(declaration.declaredAt)}
          </p>
          <ul className="mt-4 space-y-2">
            {Object.entries(DECLARATION_LABELS).map(([key, label]) => (
              <li key={key} className="flex items-center gap-2 font-body text-sm text-ink">
                <span className={`inline-block h-2 w-2 rounded-full ${declaration[key as keyof typeof declaration] ? "bg-success" : "bg-danger"}`} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
