import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, Report } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Reports — Trickle Dash" };

const STATUS_TONE = { submitted: "danger", under_review: "accent", resolved: "success", closed_no_action: "neutral" } as const;

export default async function ReportsPage({
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

  const paged = await apiGet<Paged<Report>>(`/v1/admin/reports?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Urgent suspected-illegal-contents reports already put their shipment on hold — resolving here doesn&apos;t lift that automatically; see the
          linked request.
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="status" defaultValue={params.status || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="closed_no_action">Closed, no action</option>
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Against</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Urgent</th>
              <th className="px-4 py-3 font-medium">SLA due</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No reports match this filter.
                </td>
              </tr>
            ) : (
              paged.items.map((report) => (
                <tr key={report.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/reports/${report.id}`} className="font-body text-sm font-medium text-ink hover:underline">
                      {report.category.replace(/_/g, " ")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">
                    {report.reportedType}
                    {report.reportedId ? ` · ${report.reportedId.slice(0, 8)}…` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[report.status]}>{report.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">{report.urgent ? <Badge tone="danger">Urgent</Badge> : <span className="font-body text-xs text-muted">—</span>}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{formatDateTime(report.slaDueAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/reports" searchParams={params} />
    </div>
  );
}
