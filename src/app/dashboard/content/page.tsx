import { apiGet } from "@/lib/api";
import type { AppContent } from "@/lib/types";
import { ContentEditor } from "./ContentEditor";

export const metadata = { title: "Content — Trickle Dash" };

export default async function ContentPage() {
  const items = await apiGet<AppContent[]>("/v1/admin/content");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Content</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Privacy Policy, Terms of Service, FAQ, and the parcel-declaration liability copy. Every save bumps the version and is live on the public
          endpoint immediately — no app release required.
        </p>
        <p className="mt-2 rounded-lg border border-accent-border bg-accent-surface px-3 py-2 font-body text-xs text-warning">
          Legal placeholder: the built-in default text for every key is drafted for engineering purposes only and needs review by qualified counsel
          before it ships for real.
        </p>
      </div>
      <div className="space-y-5">
        {items.map((item) => (
          <ContentEditor key={item.key} content={item} />
        ))}
      </div>
    </div>
  );
}
