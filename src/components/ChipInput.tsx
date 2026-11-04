"use client";

import { useState } from "react";
import { X } from "lucide-react";

/**
 * A text input that turns each Enter/comma-terminated value into a
 * removable chip. The current chip list rides through the surrounding
 * `<form action={formAction}>` via a hidden JSON-encoded input (named
 * `name`) — no client-side fetch, same server-action convention every
 * other form in this dashboard uses. No phone/email shape validation here:
 * the backend resolves (or rejects) each entry at preview/send time.
 */
export function ChipInput({
  name,
  defaultValue = [],
  placeholder,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [chips, setChips] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  const addChip = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || chips.includes(trimmed)) return;
    setChips((current) => [...current, trimmed]);
  };

  const removeChip = (value: string) => {
    setChips((current) => current.filter((chip) => chip !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      addChip(draft);
      setDraft("");
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(chips)} />
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 font-body text-xs text-ink"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              aria-label={`Remove ${chip}`}
              className="text-muted hover:text-ink"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={chips.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 border-none bg-transparent font-body text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>
      <p className="mt-1 font-body text-xs text-muted">
        Type a phone number or email, then press Enter or comma to add it. {chips.length} added.
      </p>
    </div>
  );
}
