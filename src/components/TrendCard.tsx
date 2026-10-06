import type { LucideIcon } from "lucide-react";
import type { TrendMetric } from "@/lib/types";
import { Sparkline } from "./Sparkline";

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null; // null = "new this period", no prior baseline to compare
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function TrendCard({
  label,
  icon: Icon,
  metric,
  format = (value: number) => value.toLocaleString(),
  period = "week",
}: {
  label: string;
  icon: LucideIcon;
  metric: TrendMetric;
  format?: (value: number) => string;
  period?: "week" | "month";
}) {
  const current = period === "week" ? metric.thisWeek : metric.thisMonth;
  const previous = period === "week" ? metric.lastWeek : metric.lastMonth;
  const change = pctChange(current, previous);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="font-label text-xs uppercase tracking-wide text-muted">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-muted">
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold text-ink">{format(current)}</span>
        {change !== null && (
          <span className={`font-body text-xs font-medium ${change >= 0 ? "text-success" : "text-danger"}`}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <p className="mt-1 font-body text-xs text-muted">
        vs {format(previous)} {period === "week" ? "last week" : "last month"}
      </p>
      <div className="mt-3">
        <Sparkline points={metric.weeklyTrend.map((point) => point.value)} />
      </div>
    </div>
  );
}
