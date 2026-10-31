"use client";

import { useActionState } from "react";
import { updatePricingPercentagesAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";
import type { EffectiveConfig } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function PricingPercentagesForm({ pricingPercentages }: { pricingPercentages: EffectiveConfig["pricingPercentages"] }) {
  const [state, formAction] = useActionState(updatePricingPercentagesAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="senderPricePercentage" className={LABEL}>Sender price percentage</label>
          <input id="senderPricePercentage" name="senderPricePercentage" type="number" min={0} max={100} step="0.1" defaultValue={pricingPercentages.senderPricePercentage} className={FIELD} />
        </div>
        <div>
          <label htmlFor="travelerPricePercentage" className={LABEL}>Traveller price percentage</label>
          <input id="travelerPricePercentage" name="travelerPricePercentage" type="number" min={0} max={100} step="0.1" defaultValue={pricingPercentages.travelerPricePercentage} className={FIELD} />
        </div>
      </div>
      <p className="font-body text-xs text-muted">
        Storage only for now — not yet applied to any request&apos;s pricing. Wiring this into checkout/payout is a separate follow-up.
      </p>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save percentages</SubmitButton>
    </form>
  );
}
