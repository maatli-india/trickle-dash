"use client";

import { useActionState } from "react";
import { updateProhibitedCategoriesAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";
import type { ProhibitedCategory } from "@/lib/types";

export function ProhibitedCategoriesForm({ categories }: { categories: ProhibitedCategory[] }) {
  const [state, formAction] = useActionState(updateProhibitedCategoriesAction, undefined);
  const initial = categories.map((c) => `${c.key} | ${c.label}`).join("\n");

  return (
    <form action={formAction} className="space-y-3">
      <p className="font-body text-xs text-muted">One category per line, formatted as <code className="rounded bg-surface-muted px-1 py-0.5">key | label</code>. This replaces the whole list.</p>
      <textarea
        name="categories"
        rows={9}
        defaultValue={initial}
        className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
      />
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save categories</SubmitButton>
    </form>
  );
}
