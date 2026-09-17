"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, CalendarDays, ChevronDown, LockKeyhole, ShieldCheck, TrendingUp } from "lucide-react";

type RangeKey = "7d" | "30d" | "90d";

type DashboardData = {
  total: number;
  dailyAverage: string;
  flagged: number;
  submitted: number;
  weekly: number[];
  reasons: { label: string; count: number; percentage: number }[];
  cohorts: { label: string; percentage: number }[];
};

const DATA: Record<RangeKey, DashboardData> = {
  "7d": {
    total: 119,
    dailyAverage: "17.0",
    flagged: 2,
    submitted: 15,
    weekly: [31, 38, 42, 35, 50, 47, 53, 61],
    reasons: [
      { label: "Found a better alternative", count: 32, percentage: 27 },
      { label: "Not using it enough", count: 28, percentage: 24 },
      { label: "Too expensive", count: 20, percentage: 17 },
      { label: "Had a bad delivery experience", count: 15, percentage: 13 },
      { label: "Privacy or trust concerns", count: 10, percentage: 8 },
      { label: "Other", count: 14, percentage: 11 },
    ],
    cohorts: [{ label: "< 30 days", percentage: 36 }, { label: "1–6 months", percentage: 28 }, { label: "6–12 months", percentage: 20 }, { label: "1 year+", percentage: 16 }],
  },
  "30d": {
    total: 508,
    dailyAverage: "16.9",
    flagged: 7,
    submitted: 56,
    weekly: [38, 42, 35, 50, 47, 53, 61, 58],
    reasons: [
      { label: "Found a better alternative", count: 142, percentage: 28 },
      { label: "Not using it enough", count: 118, percentage: 23 },
      { label: "Too expensive", count: 87, percentage: 17 },
      { label: "Had a bad delivery experience", count: 64, percentage: 13 },
      { label: "Privacy or trust concerns", count: 41, percentage: 8 },
      { label: "Other", count: 56, percentage: 11 },
    ],
    cohorts: [{ label: "< 30 days", percentage: 34 }, { label: "1–6 months", percentage: 29 }, { label: "6–12 months", percentage: 19 }, { label: "1 year+", percentage: 18 }],
  },
  "90d": {
    total: 1468,
    dailyAverage: "16.3",
    flagged: 18,
    submitted: 164,
    weekly: [45, 49, 51, 47, 59, 62, 67, 61],
    reasons: [
      { label: "Found a better alternative", count: 426, percentage: 29 },
      { label: "Not using it enough", count: 331, percentage: 23 },
      { label: "Too expensive", count: 250, percentage: 17 },
      { label: "Had a bad delivery experience", count: 191, percentage: 13 },
      { label: "Privacy or trust concerns", count: 118, percentage: 8 },
      { label: "Other", count: 152, percentage: 10 },
    ],
    cohorts: [{ label: "< 30 days", percentage: 35 }, { label: "1–6 months", percentage: 27 }, { label: "6–12 months", percentage: 20 }, { label: "1 year+", percentage: 18 }],
  },
};

const formatNumber = (value: number) => value.toLocaleString("en-IN");

export function DeletionReasonsDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [queueMessage, setQueueMessage] = useState("");
  const data = DATA[range];
  const maxWeekly = Math.max(...data.weekly);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="font-label text-[10px] font-semibold uppercase tracking-[0.16em] text-warning">Product intelligence · Retention</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Account deletion reasons</h1>
          <p className="mt-1 font-body text-sm text-muted">Aggregate churn data only — never linked to individual user identity.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 font-label text-[11px] font-semibold text-muted"><LockKeyhole size={12} /> Product &amp; Growth only</span>
          <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-body text-xs font-medium text-ink"><CalendarDays size={14} /><span className="sr-only">Date range</span><select value={range} onChange={(event) => setRange(event.target.value as RangeKey)} className="appearance-none bg-transparent outline-none"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select><ChevronDown size={13} /></label>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Deletions in period" value={formatNumber(data.total)} detail={<><TrendingUp size={11} /> 6.4% <span>vs prior period</span></>} negative />
        <Kpi label="Daily average" value={data.dailyAverage} detail={<>− <span>vs prior period</span></>} />
        <Kpi label="Top reason" value="Found a better alternative" detail="28% of deletions" compact />
        <Kpi label="Free-text flagged for review" value={String(data.flagged)} detail={`${data.flagged} of ${data.submitted} submitted`} negative />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <CardHeading eyebrow="What changed" title="Reason breakdown" meta={`${formatNumber(data.total)} responses`} />
          <div className="mt-6 space-y-4">
            {data.reasons.map((reason) => <div key={reason.label}><div className="mb-1.5 flex items-center justify-between gap-3 font-body text-xs text-ink"><span>{reason.label}</span><strong className="font-mono text-[11px] text-muted">{reason.count} <i className="text-faint">·</i> {reason.percentage}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full min-w-[3%] rounded-full bg-gradient-to-r from-accent to-[#ffc864]" style={{ width: `${reason.percentage * 2.6}%` }} /></div></div>)}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><CardHeading eyebrow="Trend" title="Deletions per week" meta="8 weeks" /><div className="mt-5 flex h-24 items-end gap-2" aria-label="Weekly deletion trend">{data.weekly.map((value, index) => <div className="flex h-full flex-1 items-end" key={`${value}-${index}`}><div className={`w-full rounded-t-md ${index === data.weekly.length - 1 ? "bg-accent" : "bg-[#d8deea]"}`} style={{ height: `${(value / maxWeekly) * 82}px` }} /></div>)}</div><div className="mt-2 flex justify-between font-body text-[10px] text-faint"><span>8 weeks ago</span><span>This week</span></div></section>
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><CardHeading eyebrow="Lifecycle signal" title="By account age" /><div className="mt-5 space-y-3">{data.cohorts.map((cohort) => <div className="flex items-center gap-2.5 font-body text-xs text-muted" key={cohort.label}><span className="w-[78px] shrink-0">{cohort.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-success" style={{ width: `${cohort.percentage}%` }} /></div><strong className="w-8 text-right font-mono text-[11px] text-ink">{cohort.percentage}%</strong></div>)}</div></section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <aside className="flex items-start gap-3 rounded-2xl border border-accent-border bg-accent-surface p-4 text-warning"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><div><h2 className="font-display text-sm font-semibold">34% of deletions happen within the first 30 days</h2><p className="mt-1 font-body text-xs leading-relaxed">Worth reviewing early onboarding and the first-week experience — this is where most churn is concentrated.</p></div></aside>
        <aside className="flex items-start gap-3 rounded-2xl border border-danger-border bg-danger-surface p-4 text-danger"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><div className="flex-1"><h2 className="font-display text-sm font-semibold">{data.flagged} free-text submissions flagged</h2><p className="mt-1 font-body text-xs leading-relaxed">Routed to the Trust &amp; Safety queue for review. Raw text is never shown on this dashboard.</p></div><button type="button" onClick={() => setQueueMessage("Trust & Safety role required to open the report queue.")} className="inline-flex shrink-0 items-center gap-1 self-center rounded-lg bg-ink px-3 py-2 font-body text-[11px] font-semibold text-white hover:bg-[#2c3547]">Open queue <ArrowUpRight size={13} /></button></aside>
      </div>
      {queueMessage && <p role="status" className="text-right font-body text-xs text-danger">{queueMessage}</p>}
      <p className="font-body text-xs text-faint"><span className="font-semibold text-warning">Mock data</span> · Ready to be replaced by aggregate <code>deletion_reasons</code> data. No live user table joins are used.</p>
    </div>
  );
}

function CardHeading({ eyebrow, title, meta }: { eyebrow: string; title: string; meta?: string }) {
  return <div className="flex items-start justify-between gap-3"><div><p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-warning">{eyebrow}</p><h2 className="mt-1 font-display text-base font-semibold text-ink">{title}</h2></div>{meta && <span className="font-body text-[10px] font-medium text-faint">{meta}</span>}</div>;
}

function Kpi({ label, value, detail, negative = false, compact = false }: { label: string; value: string; detail: React.ReactNode; negative?: boolean; compact?: boolean }) {
  return <article className={`min-h-[128px] rounded-2xl border bg-surface p-5 shadow-sm ${negative ? "border-danger-border bg-[#fffaf8]" : "border-border"}`}><span className="font-label text-[11px] font-semibold text-muted">{label}</span><strong className={`mt-2 block font-display font-semibold tracking-tight ${compact ? "max-w-[180px] text-lg leading-tight" : "text-3xl"} ${negative ? "text-danger" : "text-ink"}`}>{value}</strong><small className={`mt-2 flex items-center gap-1 font-body text-[11px] font-medium ${negative ? "text-danger" : "text-muted"}`}>{detail}</small></article>;
}