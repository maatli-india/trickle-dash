import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "danger";
}) {
  const iconTone = tone === "accent" ? "bg-accent-surface text-warning" : tone === "danger" ? "bg-danger-surface text-danger" : "bg-surface-muted text-muted";
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="font-label text-xs uppercase tracking-wide text-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold text-ink">{value}</div>
    </div>
  );
}
