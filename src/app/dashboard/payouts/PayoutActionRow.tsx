"use client";

import { useActionState, useState } from "react";
import { markPayoutFailedAction, markPayoutPaidAction } from "@/lib/actions/payouts";
import { SubmitButton } from "@/components/SubmitButton";
import type { ActionState } from "@/lib/actions/config";

const FIELD = "w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 font-body text-xs text-ink outline-none focus:border-accent";

export function PayoutActionRow({ payoutId }: { payoutId: string }) {
  const [mode, setMode] = useState<"paid" | "failed" | null>(null);
  const [paidState, paidAction] = useActionState<ActionState, FormData>(markPayoutPaidAction, undefined);
  const [failedState, failedAction] = useActionState<ActionState, FormData>(markPayoutFailedAction, undefined);

  if (mode === "paid") {
    return (
      <form action={paidAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={payoutId} />
        <input name="utr" placeholder="UTR / reference" required className={FIELD} />
        <SubmitButton className="whitespace-nowrap">Confirm paid</SubmitButton>
        <button type="button" onClick={() => setMode(null)} className="font-body text-xs text-muted hover:underline">
          Cancel
        </button>
        {paidState?.error ? <span className="font-body text-xs text-danger">{paidState.error}</span> : null}
      </form>
    );
  }

  if (mode === "failed") {
    return (
      <form action={failedAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={payoutId} />
        <input name="reason" placeholder="Why it failed" required className={FIELD} />
        <SubmitButton variant="danger" className="whitespace-nowrap">
          Confirm failed
        </SubmitButton>
        <button type="button" onClick={() => setMode(null)} className="font-body text-xs text-muted hover:underline">
          Cancel
        </button>
        {failedState?.error ? <span className="font-body text-xs text-danger">{failedState.error}</span> : null}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setMode("paid")} className="font-body text-xs font-medium text-success hover:underline">
        Mark paid
      </button>
      <button type="button" onClick={() => setMode("failed")} className="font-body text-xs font-medium text-danger hover:underline">
        Mark failed
      </button>
    </div>
  );
}
