import { apiGet } from "@/lib/api";
import type { Paged, KnowledgeBaseEntry } from "@/lib/types";
import { KnowledgeBaseForm } from "./KnowledgeBaseForm";
import { KnowledgeBaseRow } from "./KnowledgeBaseRow";

export const metadata = { title: "Knowledge base — Trickle Dash" };

export default async function KnowledgeBasePage() {
  const paged = await apiGet<Paged<KnowledgeBaseEntry>>("/v1/admin/knowledge-base?limit=50");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Knowledge base</h1>
        <p className="mt-1 font-body text-sm text-muted">
          FAQ and resolved-conversation answers the support bot replies with when a user&apos;s message matches their
          keywords or question. Only <span className="font-medium text-ink">active</span> entries are used.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">New entry</h2>
        <KnowledgeBaseForm />
      </section>

      <div className="space-y-4">
        {paged.items.length === 0 ? (
          <p className="font-body text-sm text-muted">No knowledge base entries yet.</p>
        ) : (
          paged.items.map((entry) => <KnowledgeBaseRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
