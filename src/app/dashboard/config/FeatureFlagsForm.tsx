"use client";

import { useActionState } from "react";
import { updateFeatureFlagsAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";

export function FeatureFlagsForm({
  userKYCAadhaar,
  userPhotoVerification,
}: {
  userKYCAadhaar: boolean;
  userPhotoVerification: boolean;
}) {
  const [state, formAction] = useActionState(updateFeatureFlagsAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Require DigiLocker identity verification</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Blocks sending a parcel or posting a trip until the account is verified. Off by default — see docs/parcel-safety-and-liability.md:
            verification today is a self-declared stub, not real eKYC, until DigiLocker is wired up.
          </span>
        </span>
        <input type="checkbox" name="userKYCAadhaar" defaultChecked={userKYCAadhaar} className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Require photo verification</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Reserved for gating the app&apos;s Photo Verified badge flow. Off by default — that flow is currently a client-side-only stub
            (no server-side face match yet), so this flag has no enforcement effect until that&apos;s built.
          </span>
        </span>
        <input
          type="checkbox"
          name="userPhotoVerification"
          defaultChecked={userPhotoVerification}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save feature flags</SubmitButton>
    </form>
  );
}
