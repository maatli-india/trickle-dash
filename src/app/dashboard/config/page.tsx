import { apiGet } from "@/lib/api";
import type { EffectiveConfig } from "@/lib/types";
import { FeatureFlagsForm } from "./FeatureFlagsForm";
import { ParcelSafetyForm } from "./ParcelSafetyForm";
import { ProhibitedCategoriesForm } from "./ProhibitedCategoriesForm";
import { AppVersionForm } from "./AppVersionForm";

export const metadata = { title: "Configuration — Trickle Dash" };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 mb-5 font-body text-sm text-muted">{description}</p>
      {children}
    </section>
  );
}

export default async function ConfigPage() {
  const config = await apiGet<EffectiveConfig>("/v1/admin/config");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Configuration</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Live, database-backed — every change here takes effect across the app immediately, no redeploy required.
        </p>
      </div>

      <Section title="Feature flags" description="Toggle app-wide behavior on or off.">
        <FeatureFlagsForm userKYCAadhaar={config.featureFlags.userKYCAadhaar} />
      </Section>

      <Section title="Parcel safety thresholds" description="Caps and SLAs enforced at parcel-match creation and on urgent safety reports.">
        <ParcelSafetyForm parcelSafety={config.parcelSafety} />
      </Section>

      <Section title="Prohibited categories" description="The itemized list senders must declare against before submitting a parcel request.">
        <ProhibitedCategoriesForm categories={config.prohibitedCategories} />
      </Section>

      <Section title="App version & force upgrade" description="Gate old app versions and, if needed, force everyone to update right now.">
        <AppVersionForm appVersion={config.appVersion} />
      </Section>
    </div>
  );
}
