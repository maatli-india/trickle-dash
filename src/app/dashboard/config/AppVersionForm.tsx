"use client";

import { useActionState } from "react";
import { updateAppVersionAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";
import type { AppVersionConfig } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function AppVersionForm({ appVersion }: { appVersion: AppVersionConfig }) {
  const [state, formAction] = useActionState(updateAppVersionAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <p className="rounded-lg border border-accent-border bg-accent-surface px-3 py-2 font-body text-xs text-warning">
        Live on both iOS and Android — the app calls <code className="rounded bg-surface px-1">GET /v1/app/version-check</code> at
        startup. A saved change here reaches the app within the 30s config cache window: <strong>Force update</strong> blocks the
        entire app (no navigation, nothing dismissible) until the user updates; otherwise, if the app&apos;s version is below
        Latest version, it shows a dismissible &quot;Update available&quot; prompt instead.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="minSupportedVersion" className={LABEL}>Minimum supported version</label>
          <input id="minSupportedVersion" name="minSupportedVersion" placeholder="1.0.0" defaultValue={appVersion.minSupportedVersion} className={FIELD} />
          <p className="mt-1 font-body text-xs text-muted">Below this, the update is mandatory.</p>
        </div>
        <div>
          <label htmlFor="latestVersion" className={LABEL}>Latest version</label>
          <input id="latestVersion" name="latestVersion" placeholder="1.2.0" defaultValue={appVersion.latestVersion} className={FIELD} />
          <p className="mt-1 font-body text-xs text-muted">Below this, an update is available but optional.</p>
        </div>
      </div>
      <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <span>
          <span className="block font-body text-sm font-medium text-ink">Force update for everyone right now</span>
          <span className="mt-1 block font-body text-xs text-muted">A kill switch independent of version — forces the update screen regardless of the app version installed.</span>
        </span>
        <input type="checkbox" name="forceUpdate" defaultChecked={appVersion.forceUpdate} className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
      </label>
      <div>
        <label htmlFor="updateMessage" className={LABEL}>Update message</label>
        <textarea id="updateMessage" name="updateMessage" rows={2} defaultValue={appVersion.updateMessage} className={FIELD} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="iosStoreUrl" className={LABEL}>iOS App Store URL</label>
          <input id="iosStoreUrl" name="iosStoreUrl" defaultValue={appVersion.iosStoreUrl} className={FIELD} />
        </div>
        <div>
          <label htmlFor="androidStoreUrl" className={LABEL}>Android Play Store URL</label>
          <input id="androidStoreUrl" name="androidStoreUrl" defaultValue={appVersion.androidStoreUrl} className={FIELD} />
        </div>
      </div>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved.</p> : null}
      <SubmitButton>Save app-version settings</SubmitButton>
    </form>
  );
}
