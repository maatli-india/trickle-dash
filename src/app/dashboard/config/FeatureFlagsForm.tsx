"use client";

import { useActionState } from "react";
import { updateFeatureFlagsAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";

export function FeatureFlagsForm({
  userKYCAadhaar,
  userPhotoVerification,
  referralProgramEnabled,
  roundTripCreationEnabled,
  multiDayTripCreationEnabled,
  nearbyVisibilityEnabled,
  boardingPassScanEnabled,
  multiLanguageEnabled,
  tripWaypointsEnabled,
  supportBotEnabled,
  walkingModeEnabled,
  forceUpdateEnabled,
  updatePromptEnabled,
  ratingPromptEnabled,
  handoffProofEnabled,
}: {
  userKYCAadhaar: boolean;
  userPhotoVerification: boolean;
  referralProgramEnabled: boolean;
  roundTripCreationEnabled: boolean;
  multiDayTripCreationEnabled: boolean;
  nearbyVisibilityEnabled: boolean;
  boardingPassScanEnabled: boolean;
  multiLanguageEnabled: boolean;
  tripWaypointsEnabled: boolean;
  supportBotEnabled: boolean;
  walkingModeEnabled: boolean;
  forceUpdateEnabled: boolean;
  updatePromptEnabled: boolean;
  ratingPromptEnabled: boolean;
  handoffProofEnabled: boolean;
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
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Refer a friend</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Shows the &quot;Refer a friend&quot; entry in the app&apos;s account settings. On by default — this is a kill switch for an
            already-shipped feature, not a staged rollout.
          </span>
        </span>
        <input
          type="checkbox"
          name="referralProgramEnabled"
          defaultChecked={referralProgramEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Round-trip creation</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Shows &quot;Add a return trip?&quot; on a traveler&apos;s posted trip. Off by default — staged rollout, not yet in the submitted
            app store build&apos;s active UI.
          </span>
        </span>
        <input
          type="checkbox"
          name="roundTripCreationEnabled"
          defaultChecked={roundTripCreationEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Multi-day trip creation</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Lets a traveler post the same trip across several picked dates in one go. Off by default — staged rollout, not yet in the
            submitted app store build&apos;s active UI.
          </span>
        </span>
        <input
          type="checkbox"
          name="multiDayTripCreationEnabled"
          defaultChecked={multiDayTripCreationEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Nearby visibility toggle</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Shows the &quot;Visible to nearby users&quot; setting in the app and enforces it on the undirected &quot;nearby&quot; browse search
            (Home&apos;s nearby cards, TravellerResults&apos; nearby mode). Never affects exact-route search results. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="nearbyVisibilityEnabled"
          defaultChecked={nearbyVisibilityEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Boarding-pass scan</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Shows the &quot;scan a boarding pass&quot; entry point on CreateTrip and enables POST /v1/boarding-pass/parse. Decoding happens
            on-device (ML Kit) — the backend only ever receives the already-decoded barcode string, never an image, and nothing is
            persisted. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="boardingPassScanEnabled"
          defaultChecked={boardingPassScanEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Multi-language</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Single switch for every non-English language (Hindi, Marathi, Tamil): off means the app is English only, full stop, even
            overriding a user&apos;s own previously-saved language choice; on means all three are offered in the Account settings
            language picker, device-locale auto-detection applies to all of them, and the backend sends matching push notifications
            and OTP emails. OTP SMS stays English regardless — the SMS provider only sends pre-approved, DLT-registered templates, a
            separate operational step. Marathi and Tamil&apos;s translated strings are a machine-generated first pass with no
            native-speaker review yet — worth a spot-check (especially safety/payment/legal copy) before turning this on for real
            users. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="multiLanguageEnabled"
          defaultChecked={multiLanguageEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Trip waypoints</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Lets a traveler add optional stops along the route when posting/editing a trip (e.g. &quot;stopping in Jaipur, can meet near
            the highway exit&quot;), shown to senders on trip details for route transparency. Purely informational — never affects
            matching, pricing, or capacity. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="tripWaypointsEnabled"
          defaultChecked={tripWaypointsEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Support bot (L1 FAQ)</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Answers a user&apos;s first message in a support chat from a fixed set of FAQ topics (pricing, cancellation, safety,
            handover, how Trickle works) — fully native, no AI model or third-party API, no network call. Anything it doesn&apos;t
            recognize, or that needs a specific user&apos;s own account/request data, hands straight to a human. Shows up as
            &quot;Trickle Support&quot; — indistinguishable from a human agent to the user. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="supportBotEnabled"
          defaultChecked={supportBotEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Walking Mode (hyperlocal errand posts)</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Lets a user post that they&apos;re walking/biking somewhere so nearby users can ask them to pick something up too.
            Deliberately separate from the Travel Plan/Parcel Match flow — no pricing, escrow, commission or GST; payment happens
            outside the app (cash/UPI). Discovery is a feed screen and a live Home-screen card, no push notifications in v1. Off by
            default.
          </span>
        </span>
        <input
          type="checkbox"
          name="walkingModeEnabled"
          defaultChecked={walkingModeEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Force update (blocking)</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Blocks the app with an &quot;update required&quot; screen when the installed version is below the minimum supported version, or when &quot;Force update for everyone right now&quot; is on under App version. Off means nobody is ever blocked — an app below the minimum gets the optional prompt instead, if that&apos;s on. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="forceUpdateEnabled"
          defaultChecked={forceUpdateEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Update prompt (optional)</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Shows a dismissible &quot;new version available&quot; prompt when the installed version is older than the latest version set under App version. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="updatePromptEnabled"
          defaultChecked={updatePromptEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">App rating prompt</span>
          <span className="mt-1 block font-body text-xs text-muted">
            After a user gives a 4–5 star rating on a completed delivery (from their 2nd one on, at most once every 90 days), shows the App Store / Play Store&apos;s own &quot;Rate Trickle&quot; popup. The store may still decide not to show it. The &quot;Rate Trickle&quot; link in Account works either way. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="ratingPromptEnabled"
          defaultChecked={ratingPromptEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Handover proof (pickup &amp; delivery)</span>
          <span className="mt-1 block font-body text-xs text-muted">
            Lets travelers turn on &quot;Record handover proof&quot; when creating or editing a trip. Senders then see that the traveler records proof, and the traveler is asked for photos/video at pickup and delivery. Turning it off hides the option and stops new proof being recorded; proof already recorded stays viewable. Requests keep the setting they were created with. Off by default.
          </span>
        </span>
        <input
          type="checkbox"
          name="handoffProofEnabled"
          defaultChecked={handoffProofEnabled}
          className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save feature flags</SubmitButton>
    </form>
  );
}
