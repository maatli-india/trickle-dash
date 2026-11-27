import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { AdminUser, ParcelMatch, Transaction } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { formatDateTime, formatMoney, isRealDate } from "@/lib/format";

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

const STATUS_LABEL: Record<string, string> = {
  escrowed: "Paid",
  refund_completed: "Refund completed",
  refund_failed: "Refund failed",
  refund_pending: "Refund pending",
  refund_processing: "Refund processing",
  checkout_open: "Checkout open",
  failed: "Failed",
  superseded: "Superseded",
};

const GATEWAY_LABEL: Record<string, string> = { payu: "PayU" };

// "admin_dispute_resolution" → "Admin dispute resolution"
const humanize = (value?: string) => {
  if (!value) return "";
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Each lookup is optional context: a missing user/request/payment must not
// break the transaction page, so failures render as "not found" instead.
const optional = <T,>(promise: Promise<T>) => promise.catch(() => null);

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="font-label text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const txn = await apiGet<Transaction>(`/v1/admin/transactions/${encodeURIComponent(id)}`);
  const isRefund = txn.type === "refund";
  const isParcelMatch = txn.entityType === "parcel-match";

  const [user, match, original] = await Promise.all([
    txn.userId ? optional(apiGet<AdminUser>(`/v1/users/${encodeURIComponent(txn.userId)}`)) : null,
    isParcelMatch && txn.entityId
      ? optional(apiGet<ParcelMatch>(`/v1/admin/parcel-matches/${encodeURIComponent(txn.entityId)}`))
      : null,
    txn.refundOfTransactionId
      ? optional(apiGet<Transaction>(`/v1/admin/transactions/${encodeURIComponent(txn.refundOfTransactionId)}`))
      : null,
  ]);

  const cancellation = match?.cancellation;
  const gateway = GATEWAY_LABEL[txn.gateway] || humanize(txn.gateway);
  const refundedAt = isRealDate(txn.refundedAt) ? txn.refundedAt : null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to payments
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{isRefund ? "Refund" : "Payment"}</h1>
            <p className="mt-1 font-display text-2xl text-ink">{formatMoney(txn.amountMinor, txn.currency)}</p>
            {isRefund && original ? (
              <p className="mt-1 font-body text-sm text-muted">
                of a {formatMoney(original.amountMinor, original.currency)} payment
                {isRealDate(original.paidAt) ? ` made ${formatDateTime(original.paidAt)}` : ""}
              </p>
            ) : null}
          </div>
          <Badge tone={STATUS_TONE[txn.status] || "neutral"}>{STATUS_LABEL[txn.status] || humanize(txn.status)}</Badge>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 font-body text-sm sm:grid-cols-2">
          <Field label={isRefund ? "Refunded to" : "Paid by"}>
            {user ? (
              <Link href={`/dashboard/users/${txn.userId}`} className="hover:underline">
                {user.name || "Unnamed user"}
                {user.phone ? <span className="text-muted"> · {user.phone}</span> : null}
              </Link>
            ) : txn.userId ? (
              <Link href={`/dashboard/users/${txn.userId}`} className="text-muted hover:underline">
                User not found
              </Link>
            ) : (
              "—"
            )}
          </Field>

          <Field label="Request">
            {match ? (
              <Link href={`/dashboard/requests/${txn.entityId}`} className="hover:underline">
                {match.senderName || "Sender"} → {match.travelerName || "Traveller"}
                {match.parcelCategory ? <span className="text-muted"> · {humanize(match.parcelCategory)}</span> : null}
                <span className="block text-xs text-muted">{humanize(match.status)}</span>
              </Link>
            ) : isParcelMatch ? (
              <Link href={`/dashboard/requests/${txn.entityId}`} className="text-muted hover:underline">
                Open request
              </Link>
            ) : (
              humanize(txn.entityType) || "—"
            )}
          </Field>

          {isRefund ? (
            <>
              <Field label="Refunded on">{formatDateTime(refundedAt || txn.updatedAt)}</Field>
              <Field label="Requested on">{formatDateTime(txn.createdAt)}</Field>
              {cancellation ? (
                <Field label="Why" wide>
                  {cancellation.adminRefundReason ? (
                    <>
                      Admin refund — {cancellation.adminRefundReason}
                      {isRealDate(cancellation.adminRefundAt) ? (
                        <span className="text-muted"> ({formatDateTime(cancellation.adminRefundAt)})</span>
                      ) : null}
                    </>
                  ) : (
                    <>
                      Cancelled by {cancellation.cancelledByName || humanize(cancellation.cancelledBy) || "unknown"}
                      {cancellation.policy ? <span className="text-muted"> · {humanize(cancellation.policy)} policy</span> : null}
                      {cancellation.reason || cancellation.reasonCode ? (
                        <span className="block text-muted">“{cancellation.reason || humanize(cancellation.reasonCode)}”</span>
                      ) : null}
                    </>
                  )}
                </Field>
              ) : null}
              {original ? (
                <Field label="Original payment" wide>
                  <Link href={`/dashboard/payments/${original.id}`} className="hover:underline">
                    {formatMoney(original.amountMinor, original.currency)}
                    {original.paymentMethod ? ` by ${original.paymentMethod}` : ""}
                    {isRealDate(original.paidAt) ? ` · ${formatDateTime(original.paidAt)}` : ""}
                  </Link>
                </Field>
              ) : txn.refundOfTransactionId ? (
                <Field label="Original payment" wide>
                  <Link href={`/dashboard/payments/${txn.refundOfTransactionId}`} className="text-muted hover:underline">
                    Open original payment
                  </Link>
                </Field>
              ) : null}
            </>
          ) : (
            <>
              <Field label="Started">{formatDateTime(txn.createdAt)}</Field>
              {isRealDate(txn.paidAt) ? <Field label="Paid on">{formatDateTime(txn.paidAt)}</Field> : null}
              {txn.paymentMethod ? <Field label="Method">{txn.paymentMethod}</Field> : null}
              {isRealDate(txn.failedAt) ? <Field label="Failed on">{formatDateTime(txn.failedAt)}</Field> : null}
              {txn.attemptNo > 1 ? <Field label="Attempt">Attempt {txn.attemptNo}</Field> : null}
            </>
          )}

          {txn.failureReason ? (
            <Field label={isRefund ? "Refund failure" : "Failure reason"} wide>
              {txn.failureReason}
            </Field>
          ) : null}
        </dl>

        {isRefund && txn.refundAttempts && txn.refundAttempts.length > 0 ? (
          <div className="mt-6">
            <h2 className="font-label text-xs uppercase tracking-wide text-muted">Refund attempts</h2>
            <ul className="mt-2 space-y-1.5 font-body text-sm">
              {txn.refundAttempts.map((attempt) => (
                <li key={attempt.attemptNo} className="flex flex-wrap gap-x-2 text-ink">
                  <span>#{attempt.attemptNo}</span>
                  <span className="text-muted">{formatDateTime(attempt.attemptedAt)}</span>
                  <span>{STATUS_LABEL[attempt.status] || humanize(attempt.status)}</span>
                  {attempt.message ? <span className="text-muted">— {attempt.message}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 border-t border-border pt-4">
          <h2 className="font-label text-xs uppercase tracking-wide text-muted">Gateway reference</h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 font-body text-xs text-muted sm:grid-cols-2">
            <div>
              {gateway} {isRefund ? "refund" : "payment"} · txn <span className="break-all text-ink">{txn.id}</span>
            </div>
            {txn.gatewayPaymentId ? (
              <div>
                {gateway} payment ID <span className="break-all text-ink">{txn.gatewayPaymentId}</span>
              </div>
            ) : null}
            {txn.gatewayRefundRequestId ? (
              <div>
                {gateway} refund request ID <span className="break-all text-ink">{txn.gatewayRefundRequestId}</span>
              </div>
            ) : null}
            {txn.client ? <div>Client {txn.client}</div> : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
