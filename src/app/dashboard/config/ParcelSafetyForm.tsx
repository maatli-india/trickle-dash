"use client";

import { useActionState } from "react";
import { updateParcelSafetyAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";
import type { EffectiveConfig } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function ParcelSafetyForm({ parcelSafety }: { parcelSafety: EffectiveConfig["parcelSafety"] }) {
  const [state, formAction] = useActionState(updateParcelSafetyAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="maxDeclaredValue" className={LABEL}>Max declared value (INR)</label>
          <input id="maxDeclaredValue" name="maxDeclaredValue" type="number" min={0} step="1" defaultValue={parcelSafety.maxDeclaredValue} className={FIELD} />
        </div>
        <div>
          <label htmlFor="maxWeightKg" className={LABEL}>Max weight (kg)</label>
          <input id="maxWeightKg" name="maxWeightKg" type="number" min={0} step="0.1" defaultValue={parcelSafety.maxWeightKg} className={FIELD} />
        </div>
        <div>
          <label htmlFor="cashInstrumentThresholdINR" className={LABEL}>Cash instrument threshold (INR)</label>
          <input id="cashInstrumentThresholdINR" name="cashInstrumentThresholdINR" type="number" min={0} step="1" defaultValue={parcelSafety.cashInstrumentThresholdINR} className={FIELD} />
        </div>
        <div>
          <label htmlFor="urgentReportSLAMinutes" className={LABEL}>Urgent report SLA (minutes)</label>
          <input id="urgentReportSLAMinutes" name="urgentReportSLAMinutes" type="number" min={1} step="1" defaultValue={parcelSafety.urgentReportSLAMinutes} className={FIELD} />
        </div>
      </div>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save thresholds</SubmitButton>
    </form>
  );
}
