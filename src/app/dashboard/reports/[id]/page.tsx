import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Report } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { ReportActionForm } from "./ReportActionForm";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Report detail — Trickle Dash" };

type FileStatus = { fileId: string; status: string; downloadUrl?: string };

async function resolvePhotoURLs(photoIds: string[] | undefined): Promise<string[]> {
  if (!photoIds?.length) return [];
  const results = await Promise.allSettled(
    photoIds.map((fileId) => apiGet<FileStatus>(`/v1/files/${encodeURIComponent(fileId)}/status`))
  );
  return results
    .filter((result): result is PromiseFulfilledResult<FileStatus> => result.status === "fulfilled")
    .map((result) => result.value.downloadUrl)
    .filter((url): url is string => Boolean(url));
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await apiGet<Report>(`/v1/reports/${encodeURIComponent(id)}`);
  const photoURLs = await resolvePhotoURLs(report.photos);

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/reports" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to reports
      </Link>

      {report.urgent ? (
        <div className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger">
          Urgent report. If this is category <strong>suspected_illegal_contents</strong> against a request, that shipment is already on hold — see
          the linked request under Requests.
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{report.category.replace(/_/g, " ")}</h1>
            <p className="mt-1 font-body text-xs text-muted">
              Against {report.reportedType}
              {report.reportedId ? ` · ${report.reportedId}` : ""}
            </p>
          </div>
          <Badge tone={report.urgent ? "danger" : "neutral"}>{report.status.replace(/_/g, " ")}</Badge>
        </div>
        <p className="mt-4 whitespace-pre-wrap font-body text-sm text-ink">{report.description}</p>
        <p className="mt-3 font-body text-xs text-muted">
          Filed {formatDateTime(report.createdAt)} · SLA due {formatDateTime(report.slaDueAt)}
        </p>
        {report.photos?.length ? (
          <div className="mt-4">
            <p className="mb-2 font-label text-xs font-semibold uppercase tracking-wide text-muted">
              Attached photos ({report.photos.length})
            </p>
            {photoURLs.length ? (
              <div className="flex flex-wrap gap-3">
                {photoURLs.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-24 w-24 overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs, not a Next.js-optimizable source */}
                    <img src={url} alt="Report attachment" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-muted">
                {report.photos.length} photo{report.photos.length > 1 ? "s" : ""} attached, still processing or unavailable.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {report.statusHistory?.length ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-ink">History</h2>
          <ul className="mt-3 space-y-2">
            {report.statusHistory.map((event, i) => (
              <li key={i} className="font-body text-sm text-muted">
                <span className="text-ink">{event.status.replace(/_/g, " ")}</span> — {formatDateTime(event.createdAt)}
                {event.message ? `: ${event.message}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Review this report</h2>
        <ReportActionForm report={report} />
      </div>
    </div>
  );
}
