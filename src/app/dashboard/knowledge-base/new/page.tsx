import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm";

export const metadata = { title: "New knowledge base entry — Trickle Dash" };

export default async function NewKnowledgeBaseEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string; answer?: string; sourceThreadId?: string }>;
}) {
  const { question, answer, sourceThreadId } = await searchParams;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/knowledge-base" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to knowledge base
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">New knowledge base entry</h1>
        {sourceThreadId ? (
          <p className="mt-1 font-body text-sm text-muted">
            Prefilled from{" "}
            <Link href={`/dashboard/support-chats/${encodeURIComponent(sourceThreadId)}`} className="text-accent-ink hover:underline">
              support chat {sourceThreadId}
            </Link>
            . Review and edit before saving — it stays inactive until you check &quot;Active&quot;.
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <KnowledgeBaseForm defaultQuestion={question} defaultAnswer={answer} defaultSourceThreadId={sourceThreadId} />
      </section>
    </div>
  );
}
