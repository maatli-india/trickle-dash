import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, ParcelMatch } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Requests — Trickle Dash" };

const STATUS_TONE: Record<string, "success" | "danger" | "accent" | "neutral" | "info"> = {
  completed: "success",
  delivered: "success",
  cancelled: "neutral",
  rejected: "danger",
  declined: "danger",
  confirmed: "info",
  picked_up: "info",
  in_transit: "info",
  pending: "accent",
};

export default async function RequestsPage({
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

  const paged = await apiGet<Paged<ParcelMatch>>(`/v1/admin/parcel-matches?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Requests</h1>
        <p className="mt-1 font-body text-sm text-muted">Every parcel request across the platform. Shipments on safety hold are flagged in red.</p>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="status" defaultValue={params.status || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any status</option>
          {["pending", "countered", "accepted", "confirmed", "picked_up", "in_transit", "delivered", "completed", "cancelled", "rejected", "declined"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Parcel</th>
              <th className="px-4 py-3 font-medium">Sender → Traveler</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Safety</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No requests match this filter.
                </td>
              </tr>
            ) : (
              paged.items.map((match) => (
                <tr key={match.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/requests/${match.id}`} className="font-body text-sm font-medium text-ink hover:underline">
                      {match.parcelDescription || match.parcelCategory || "Parcel"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">
                    {match.senderName || match.senderUserId} → {match.travelerName || match.travelerUserId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[match.status] || "neutral"}>{match.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">{match.safetyHold ? <Badge tone="danger">On hold</Badge> : <span className="font-body text-xs text-muted">—</span>}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{formatDate(match.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/requests" searchParams={params} />
    </div>
  );
}
