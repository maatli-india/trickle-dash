import type { ComponentType } from "react";
import { ShieldCheck, PackageSearch, Smartphone, IndianRupee } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { EffectiveConfig } from "@/lib/types";
import { FeatureFlagsForm } from "./FeatureFlagsForm";
import { ParcelSafetyForm } from "./ParcelSafetyForm";
import { ProhibitedCategoriesForm } from "./ProhibitedCategoriesForm";
import { AppVersionForm } from "./AppVersionForm";
import { ParcelPricingTiersForm } from "./ParcelPricingTiersForm";

export const metadata = { title: "Configuration — Trickle Dash" };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 mb-5 font-body text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}

// Every configuration section lives under exactly one category here. As more
// dashboard-editable settings get added, give them a home in an existing
// category below or add a new one — never a bare Section floating outside a
// Category, so the page stays scannable instead of turning into a flat list.
function Category({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent-surface text-accent-ink">
          <Icon size={18} className="text-warning" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 font-body text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const CATEGORIES = [
  { id: "trust-verification", label: "Trust & verification" },
  { id: "parcel-safety", label: "Parcel safety & compliance" },
  { id: "pricing", label: "Pricing" },
  { id: "app-delivery", label: "App delivery" },
];

export default async function ConfigPage() {
  const config = await apiGet<EffectiveConfig>("/v1/admin/config");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Configuration</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Live, database-backed — every change here takes effect across the app immediately, no redeploy required.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 font-body text-xs font-medium text-muted transition-colors hover:border-accent hover:text-ink"
            >
              {category.label}
            </a>
          ))}
        </nav>
      </div>

      <Category
        id="trust-verification"
        icon={ShieldCheck}
        title="Trust & verification"
        description="Requirements gating who's allowed to send a parcel or post a trip."
      >
        <Section title="Feature flags" description="Toggle verification requirements on or off.">
          <FeatureFlagsForm userKYCAadhaar={config.featureFlags.userKYCAadhaar} userPhotoVerification={config.featureFlags.userPhotoVerification} />
        </Section>
      </Category>

      <Category
        id="parcel-safety"
        icon={PackageSearch}
        title="Parcel safety & compliance"
        description="Caps, SLAs, and declarations enforced at parcel-match creation and on urgent safety reports."
      >
        <Section title="Parcel safety thresholds" description="Caps and SLAs enforced at parcel-match creation and on urgent safety reports.">
          <ParcelSafetyForm parcelSafety={config.parcelSafety} />
        </Section>

        <Section title="Prohibited categories" description="The itemized list senders must declare against before submitting a parcel request.">
          <ProhibitedCategoriesForm categories={config.prohibitedCategories} />
        </Section>
      </Category>

      <Category
        id="pricing"
        icon={IndianRupee}
        title="Pricing"
        description="What a sender sees on top of the price a traveller sets, by bracket."
      >
        <Section title="Sender markup tiers" description="Each bracket adds a flat rupee amount to any traveller-set price within it — e.g. 0-1000 at +₹200 means both a ₹1 and a ₹1000 offer show the sender ₹200 more.">
          <ParcelPricingTiersForm tiers={config.parcelPricingTiers ?? []} />
        </Section>
      </Category>

      <Category
        id="app-delivery"
        icon={Smartphone}
        title="App delivery"
        description="Client version gating and force-upgrade controls."
      >
        <Section title="App version & force upgrade" description="Gate old app versions and, if needed, force everyone to update right now.">
          <AppVersionForm appVersion={config.appVersion} />
        </Section>
      </Category>
    </div>
  );
}
