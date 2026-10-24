"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { resolveDisputeAction } from "@/lib/actions/matches";
import type { ParcelMatch } from "@/lib/types";

// Mirrors the backend's capturedParcelAmount fallback chain
// (internal/orchestrators/parcel_match.go) so the admin sees the same cap
// the server will actually enforce.
function capturedAmount(match: ParcelMatch): number {
  if (match.pricing?.totalPayableAmount && match.pricing.totalPayableAmount > 0) {
    return match.pricing.totalPayableAmount;
  }
  if (match.pricing?.senderPayableAmount && match.pricing.senderPayableAmount > 0) {
    return match.pricing.senderPayableAmount;
  }
  return match.agreedPrice || 0;
}

export function DisputeResolutionForm({ match }: { match: ParcelMatch }) {
  const [state, formAction] = useActionState(resolveDisputeAction, undefined);
  const [refundAmount, setRefundAmount] = useState("");
  const total = capturedAmount(match);
  const refundValue = Number(refundAmount) || 0;
  const retained = Math.max(total - refundValue, 0);
  const overCap = refundValue > total;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="matchId" value={match.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="font-label text-xs uppercase tracking-wide text-muted">Refund to sender (₹)</label>
          <input
            name="refundAmount"
            type="number"
            min={0}
            max={total || undefined}
            step="0.01"
            required
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus:border-accent"
          />
          <p className="mt-1 font-body text-xs text-muted">
            Captured amount: ₹{total.toFixed(2)} · Platform retains: ₹{retained.toFixed(2)}
          </p>
          {overCap ? (
            <p className="mt-1 font-body text-xs text-danger">Refund can&apos;t exceed the captured amount.</p>
          ) : null}
        </div>
        <div>
          <label className="font-label text-xs uppercase tracking-wide text-muted">Reason (required, kept on record)</label>
          <textarea
            name="reason"
            required
            rows={3}
            placeholder="Why this amount — kept as the audit trail for this resolution"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      </div>
      <SubmitButton variant="primary" className="disabled:cursor-not-allowed">
        Resolve dispute
      </SubmitButton>
      {state?.error ? <p className="font-body text-xs text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-xs text-success">Dispute resolved.</p> : null}
    </form>
  );
}
