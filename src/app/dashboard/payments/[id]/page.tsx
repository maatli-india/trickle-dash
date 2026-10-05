import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { formatDateTime, formatMoney } from "@/lib/format";

export const metadata = { title: "Transaction detail — Trickle Dash" };

const STATUS_TONE: Record<string, "success" | "danger" | "accent" | "neutral" | "info"> = {
  escrowed: "success",
  refund_completed: "success",
  failed: "danger",
  refund_failed: "danger",
  checkout_open: "accent",
  refund_pending: "accent",
  refund_processing: "accent",
  superseded: "neutral",
};

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const txn = await apiGet<Transaction>(`/v1/admin/transactions/${encodeURIComponent(id)}`);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to payments
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold capitalize text-ink">{txn.type}</h1>
            <p className="mt-1 font-body text-sm text-muted">{formatMoney(txn.amountMinor, txn.currency)}</p>
          </div>
          <Badge tone={STATUS_TONE[txn.status] || "neutral"}>{txn.status.replace(/_/g, " ")}</Badge>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 font-body text-sm sm:grid-cols-2">
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Transaction ID</dt>
            <dd className="mt-0.5 break-all text-ink">{txn.id}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Gateway</dt>
            <dd className="mt-0.5 text-ink">
              {txn.gateway} · {txn.gatewayRole}
            </dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Request</dt>
            <dd className="mt-0.5 text-ink">
              {txn.entityType === "parcel-match" ? (
                <Link href={`/dashboard/requests/${txn.entityId}`} className="hover:underline">
                  {txn.entityId}
                </Link>
              ) : (
                `${txn.entityType}: ${txn.entityId}`
              )}
            </dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">User</dt>
            <dd className="mt-0.5 text-ink">{txn.userId}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Attempt</dt>
            <dd className="mt-0.5 text-ink">
              #{txn.attemptNo} {txn.client ? `· ${txn.client}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Created</dt>
            <dd className="mt-0.5 text-ink">{formatDateTime(txn.createdAt)}</dd>
          </div>
          {txn.paidAt ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Paid</dt>
              <dd className="mt-0.5 text-ink">{formatDateTime(txn.paidAt)}</dd>
            </div>
          ) : null}
          {txn.refundedAt ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Refunded</dt>
              <dd className="mt-0.5 text-ink">{formatDateTime(txn.refundedAt)}</dd>
            </div>
          ) : null}
          {txn.failedAt ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Failed</dt>
              <dd className="mt-0.5 text-ink">{formatDateTime(txn.failedAt)}</dd>
            </div>
          ) : null}
          {txn.failureReason ? (
            <div className="col-span-2">
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Failure reason</dt>
              <dd className="mt-0.5 text-ink">{txn.failureReason}</dd>
            </div>
          ) : null}
          {txn.gatewayPaymentId ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">PayU payment ID</dt>
              <dd className="mt-0.5 break-all text-ink">{txn.gatewayPaymentId}</dd>
            </div>
          ) : null}
          {txn.gatewayRefundRequestId ? (
            <div>
              <dt className="font-label text-xs uppercase tracking-wide text-muted">PayU refund request ID</dt>
              <dd className="mt-0.5 break-all text-ink">{txn.gatewayRefundRequestId}</dd>
            </div>
          ) : null}
          {txn.refundOfTransactionId ? (
            <div className="col-span-2">
              <dt className="font-label text-xs uppercase tracking-wide text-muted">Refund of</dt>
              <dd className="mt-0.5 text-ink">
                <Link href={`/dashboard/payments/${txn.refundOfTransactionId}`} className="hover:underline">
                  {txn.refundOfTransactionId}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
