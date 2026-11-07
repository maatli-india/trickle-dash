"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";
import { deleteKnowledgeBaseEntryAction } from "@/lib/actions/knowledgeBase";
import type { KnowledgeBaseEntry } from "@/lib/types";
import { KnowledgeBaseForm } from "./KnowledgeBaseForm";

export function KnowledgeBaseRow({ entry }: { entry: KnowledgeBaseEntry }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {entry.category ? <Badge tone="info">{entry.category}</Badge> : null}
            <Badge tone="neutral">{entry.sourceType === "resolved_thread" ? "From resolved chat" : "FAQ"}</Badge>
            {entry.active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
          </div>
          <p className="mt-2 font-body text-sm font-medium text-ink">{entry.question}</p>
          <p className="mt-1 font-body text-sm text-muted">{entry.answer}</p>
          <p className="mt-1 font-body text-xs text-muted">Updated {formatDateTime(entry.updatedAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)} className="font-body text-xs text-muted hover:text-ink">
            {editing ? "Cancel" : "Edit"}
          </button>
          <form action={deleteKnowledgeBaseEntryAction.bind(null, entry.id)}>
            <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-surface" aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </form>
        </div>
      </div>
      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <KnowledgeBaseForm entry={entry} />
        </div>
      ) : null}
    </div>
  );
}
