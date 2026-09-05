const TONES = {
  neutral: "bg-surface-muted text-muted",
  accent: "bg-accent-surface text-warning",
  success: "bg-success-surface text-success",
  danger: "bg-danger-surface text-danger",
  info: "bg-info-surface text-info",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-label text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]}`}>
      {children}
    </span>
  );
}
