"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { adminRefundAction } from "@/lib/actions/matches";
import { capturedAmount } from "@/lib/capturedAmount";
import type { ParcelMatch } from "@/lib/types";

// Refunds part or all of the sender's captured payment through PayU (the
// same path a cancellation uses). One refund per request; the delivery's
// status is not changed, and a refunded delivery's traveller payout is held.
export function AdminRefundForm({ match }: { match: ParcelMatch }) {
  const [state, formAction] = useActionState(adminRefundAction, undefined);
  const total = capturedAmount(match);
  const [amount, setAmount] = useState(total ? total.toFixed(2) : "");
  const [confirmed, setConfirmed] = useState(false);
  const value = Number(amount) || 0;
  const overCap = value > total;
  const delivered = ["delivered", "completed"].includes(match.status);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="matchId" value={match.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="font-label text-xs uppercase tracking-wide text-muted">Refund to sender (₹)</label>
          <input
            name="amount"
            type="number"
            min={0.01}
            max={total || undefined}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus:border-accent"
          />
          <p className="mt-1 font-body text-xs text-muted">
            Captured: ₹{total.toFixed(2)} · Platform keeps: ₹{Math.max(total - value, 0).toFixed(2)}
          </p>
          {overCap ? <p className="mt-1 font-body text-xs text-danger">Refund can&apos;t exceed the captured amount.</p> : null}
        </div>
        <div>
          <label className="font-label text-xs uppercase tracking-wide text-muted">Reason (required, kept on record)</label>
          <textarea
            name="reason"
            required
            minLength={3}
            rows={3}
            placeholder="Why this refund — kept as the audit trail"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      </div>
      <ul className="list-disc space-y-0.5 pl-5 font-body text-xs text-muted">
        <li>Only one refund can be made per request — it can&apos;t be topped up later.</li>
        <li>The request&apos;s status doesn&apos;t change. Cancel it separately if the delivery should stop.</li>
        {delivered ? <li>The traveller&apos;s payout for this delivery will be put on hold if it hasn&apos;t been paid yet.</li> : null}
      </ul>
      <label className="flex items-center gap-2 font-body text-sm text-ink">
        <input type="checkbox" name="confirm" value="yes" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        Send ₹{value.toFixed(2)} back to the sender&apos;s original payment method
      </label>
      <SubmitButton variant="primary" className="disabled:cursor-not-allowed" disabled={!confirmed || overCap || value <= 0}>
        Issue refund
      </SubmitButton>
      {state?.error ? <p className="font-body text-xs text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-xs text-success">Refund sent to PayU.</p> : null}
    </form>
  );
}
