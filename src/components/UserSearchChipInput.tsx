"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { suggestUsersAction } from "@/lib/actions/users";
import type { UserSuggestion } from "@/lib/types";

type Chip = { value: string; label: string };

const SUGGEST_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/**
 * Typeahead for a Campaign's manual segment: type a few characters of an
 * email or phone and a dropdown of matching ACTIVE users appears (prefix
 * match, server-side via GET /v1/admin/users/suggest); click a suggestion,
 * or press Enter while one is highlighted, to add it as a chip. The
 * underlying contract is unchanged from the generic ChipInput it replaces
 * here — a hidden JSON-encoded array of strings (name={name}) that rides
 * through the surrounding <form action={formAction}>, so
 * createSegmentAction's parseManualEntries needs no changes.
 *
 * If the admin presses Enter with no suggestion highlighted (e.g. the
 * typeahead found nothing, or they typed a phone number with no match
 * yet), the raw typed text is added as-is, same as the old free-text
 * behavior — unresolvable entries are still reported back at preview/send
 * time, not blocked here.
 */
export function UserSearchChipInput({
  name,
  defaultValue = [],
  placeholder,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [chips, setChips] = useState<Chip[]>(defaultValue.map((value) => ({ value, label: value })));
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const requestIdRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced, imperatively from the change handler (not a useEffect keyed
  // on `query`) so every state update happens inside an event/callback,
  // never synchronously in an effect body.
  const triggerSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const requestId = ++requestIdRef.current;
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await suggestUsersAction(trimmed);
        if (requestIdRef.current !== requestId) return; // a newer keystroke superseded this request
        setSuggestions(results);
        setHighlighted(0);
      } catch {
        if (requestIdRef.current === requestId) setSuggestions([]);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, SUGGEST_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const identifierFor = (suggestion: UserSuggestion) => suggestion.email || suggestion.phone || "";

  const addChip = (chip: Chip) => {
    if (!chip.value.trim() || chips.some((existing) => existing.value === chip.value)) return;
    setChips((current) => [...current, chip]);
  };

  const removeChip = (value: string) => {
    setChips((current) => current.filter((chip) => chip.value !== value));
  };

  const selectSuggestion = (suggestion: UserSuggestion) => {
    const identifier = identifierFor(suggestion);
    if (!identifier) return;
    const label = suggestion.name ? `${suggestion.name} · ${identifier}` : identifier;
    addChip({ value: identifier, label });
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (open && suggestions.length > 0 && suggestions[highlighted]) {
        selectSuggestion(suggestions[highlighted]);
      } else if (query.trim()) {
        addChip({ value: query.trim(), label: query.trim() });
        setQuery("");
        setSuggestions([]);
        setOpen(false);
      }
    } else if (e.key === "Backspace" && !query && chips.length > 0) {
      removeChip(chips[chips.length - 1].value);
    }
  };

  return (
    <div className="relative">
      <input type="hidden" name={name} value={JSON.stringify(chips.map((chip) => chip.value))} />
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2">
        {chips.map((chip) => (
          <span
            key={chip.value}
            className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 font-body text-xs text-ink"
          >
            {chip.label}
            <button
              type="button"
              onClick={() => removeChip(chip.value)}
              aria-label={`Remove ${chip.label}`}
              className="text-muted hover:text-ink"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            triggerSearch(value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={chips.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 border-none bg-transparent font-body text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>
      <p className="mt-1 font-body text-xs text-muted">
        Type an email or phone number — matching active users appear below. Click one, or press Enter to add it. {chips.length} added.
      </p>
      {open && (loading || suggestions.length > 0) ? (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg">
          {loading ? (
            <li className="px-3 py-2 font-body text-xs text-muted">Searching…</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`block w-full px-3 py-2 text-left font-body text-sm ${
                    index === highlighted ? "bg-surface-muted text-ink" : "text-ink hover:bg-surface-muted"
                  }`}
                >
                  <span className="block font-medium">{suggestion.name || identifierFor(suggestion)}</span>
                  {suggestion.name ? <span className="block text-xs text-muted">{identifierFor(suggestion)}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
