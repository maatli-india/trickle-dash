import { Activity, CalendarDays, CalendarRange, UserPlus, MousePointerClick } from "lucide-react";
import type { ReactNode } from "react";
import type { AppUsage } from "@/lib/types";
import { StatCard } from "@/components/StatCard";

// Friendly labels for the app's custom Firebase Analytics events, in the
// journey order the backend returns them.
const EVENT_LABELS: Record<string, string> = {
  login_otp_verified: "Logged in (OTP verified)",
  sign_up: "Signed up",
  parcel_request_submitted: "Parcel request submitted",
  match_confirmed: "Match confirmed",
  payment_started: "Payment started",
  payment_verified: "Payment verified",
  handoff_confirmed: "Handoff confirmed",
  rating_submitted: "Rating submitted",
  trip_posted: "Trip posted (traveller)",
};

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function formatDay(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function filterNote(filter: string): string {
  return filter ? `Only builds talking to the ${filter} backend` : "All builds (no backend filter, includes test builds)";
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-label text-xs uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </div>
  );
}

// Horizontal bars, same look as ParcelFunnelCard: each bar is a share of
// the largest value in the list.
function BarList({ rows, empty }: { rows: Array<{ label: string; value: number; title?: string }>; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0 || rows.every((r) => r.value === 0)) {
    return <p className="mt-3 font-body text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="mt-3 space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-44 shrink-0 truncate font-body text-sm text-ink" title={r.title ?? r.label}>
            {r.label}
          </span>
          <div className="h-2 flex-1 rounded-full bg-surface-muted">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="w-14 shrink-0 text-right font-body text-xs text-muted">{formatCount(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Daily active users as a thin 2px line. Each day has a full-height hover
// strip with a native tooltip (works in this server component, no JS); the
// first/last day and the peak are labelled below, the rest via hover.
function DailyActiveChart({ points }: { points: { date: string; activeUsers: number }[] }) {
  const width = 300;
  const height = 64;
  const pad = 3; // keeps the 2px stroke from clipping at the top/bottom edge
  const max = Math.max(1, ...points.map((p) => p.activeUsers));
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const x = (i: number) => i * step;
  const y = (v: number) => pad + (height - 2 * pad) * (1 - v / max);
  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.activeUsers).toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-16 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Daily active users, ${formatDay(points[0].date)} to ${formatDay(points[points.length - 1].date)}, peak ${max}`}
    >
      <line x1={0} y1={height - pad} x2={width} y2={height - pad} stroke="var(--color-border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <rect key={p.date} x={x(i) - step / 2} y={0} width={Math.max(step, 1)} height={height} fill="transparent">
          <title>{`${formatDay(p.date)}: ${formatCount(p.activeUsers)} active users`}</title>
        </rect>
      ))}
    </svg>
  );
}

// Platform colours follow the platform, not its rank, so they don't swap
// when iOS overtakes Android. The repo has no categorical palette: Android
// takes the accent, iOS the ink colour (well separated, including under
// colour-blindness), anything else faint. Names and shares are always
// printed beside a swatch, so identity never depends on colour alone.
function platformColor(name: string): string {
  const n = name.toLowerCase();
  if (n === "android") return "bg-accent";
  if (n === "ios") return "bg-ink";
  return "bg-faint";
}

function Notice({ tone, children }: { tone: "neutral" | "danger"; children: ReactNode }) {
  const cls = tone === "danger" ? "border-danger-border bg-danger-surface text-danger" : "border-border bg-surface text-muted";
  return <div className={`mt-3 rounded-2xl border p-5 font-body text-sm ${cls}`}>{children}</div>;
}

function SetupSteps() {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-ink">See setup steps</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Google Analytics → Admin → Property details: copy the numeric property ID.</li>
        <li>Admin → Property access management: add the Firebase service account&apos;s client_email as a Viewer.</li>
        <li>Google Cloud console (the project behind Firebase): enable &quot;Google Analytics Data API&quot;.</li>
        <li>Admin → Custom definitions: create a user-scoped custom dimension for the user property &quot;backend&quot;.</li>
        <li>Add ga4PropertyId (and optionally ga4BackendFilter) to the backend config and redeploy.</li>
      </ol>
    </details>
  );
}

// The Overview page's "App usage" section, fed by GET /v1/admin/app-usage
// (Google Analytics 4). usage is null when that call itself failed.
export function AppUsageSection({ usage }: { usage: AppUsage | null }) {
  const updated = usage?.generatedAt ? new Date(usage.generatedAt) : null;
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink">App usage</h2>
      <p className="mt-1 font-body text-sm text-muted">
        From Google Analytics (Firebase), last 30 days.
        {usage?.configured && <> {filterNote(usage.filter)}.</>}
        {updated && !Number.isNaN(updated.getTime()) && (
          <> Updated {updated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST.</>
        )}
      </p>
      <AppUsageBody usage={usage} />
    </div>
  );
}

function AppUsageBody({ usage }: { usage: AppUsage | null }) {
  if (!usage) {
    return <Notice tone="neutral">App usage is unavailable right now. The rest of the dashboard is unaffected; try reloading in a minute.</Notice>;
  }
  if (!usage.configured) {
    return (
      <Notice tone="neutral">
        Connect Google Analytics: add ga4PropertyId to config.
        <SetupSteps />
      </Notice>
    );
  }
  if (usage.error) {
    return (
      <Notice tone="danger">
        <strong className="font-semibold">Couldn&apos;t load Google Analytics.</strong> {usage.error}
      </Notice>
    );
  }

  const daily = usage.dailyActiveUsers ?? [];
  const peak = daily.reduce((m, p) => Math.max(m, p.activeUsers), 0);
  const platforms = usage.platforms ?? [];
  const platformTotal = platforms.reduce((sum, p) => sum + p.activeUsers, 0);
  const versions = usage.appVersions ?? [];

  return (
    <div className="mt-3 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active today" value={formatCount(usage.activeUsers.last1Day)} icon={Activity} />
        <StatCard label="Active · 7 days" value={formatCount(usage.activeUsers.last7Days)} icon={CalendarDays} />
        <StatCard label="Active · 30 days" value={formatCount(usage.activeUsers.last30Days)} icon={CalendarRange} />
        <StatCard label="New users · 30 days" value={formatCount(usage.last30Days.newUsers)} icon={UserPlus} />
        <StatCard label="Sessions · 30 days" value={formatCount(usage.last30Days.sessions)} icon={MousePointerClick} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Daily active users · last 30 days">
          {daily.length === 0 || peak === 0 ? (
            <p className="mt-3 font-body text-sm text-muted">No app activity recorded in the last 30 days.</p>
          ) : (
            <>
              <div className="mt-3">
                <DailyActiveChart points={daily} />
              </div>
              <div className="mt-1 flex justify-between font-body text-xs text-faint">
                <span>{formatDay(daily[0].date)}</span>
                <span>peak {formatCount(peak)}</span>
                <span>{formatDay(daily[daily.length - 1].date)}</span>
              </div>
            </>
          )}
          <p className="mt-3 font-body text-xs text-faint">
            Average engagement time per active user: {formatDuration(usage.last30Days.avgEngagementSeconds)}.
          </p>
        </Card>

        <Card title="Platform split · active users">
          {platformTotal === 0 ? (
            <p className="mt-3 font-body text-sm text-muted">No platform data yet.</p>
          ) : (
            <>
              <div className="mt-3 flex h-2 gap-0.5">
                {platforms
                  .filter((p) => p.activeUsers > 0)
                  .map((p) => (
                    <div
                      key={p.name}
                      className={`rounded-full ${platformColor(p.name)}`}
                      style={{ width: `${(p.activeUsers / platformTotal) * 100}%` }}
                      title={`${p.name}: ${formatCount(p.activeUsers)}`}
                    />
                  ))}
              </div>
              <dl className="mt-3 space-y-2">
                {platforms.map((p) => (
                  <div key={p.name} className="flex items-baseline justify-between gap-3">
                    <dt className="flex items-center gap-2 font-body text-sm text-muted">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${platformColor(p.name)}`}
                        aria-hidden="true"
                      />
                      {p.name}
                    </dt>
                    <dd className="font-body text-sm font-semibold text-ink">
                      {formatCount(p.activeUsers)}
                      <span className="ml-2 font-normal text-xs text-faint">{Math.round((p.activeUsers / platformTotal) * 100)}%</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {versions.length > 0 && (
            <p className="mt-3 font-body text-xs text-faint">
              Top app versions: {versions.map((v) => `${v.name} (${formatCount(v.activeUsers)})`).join(" · ")}
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Top screens · views">
          <BarList rows={(usage.topScreens ?? []).map((s) => ({ label: s.screen, value: s.views }))} empty="No screen views recorded yet." />
        </Card>
        <Card title="App events · journey order">
          <BarList
            rows={(usage.funnelEvents ?? []).map((e) => ({ label: EVENT_LABELS[e.event] ?? e.event, value: e.count, title: e.event }))}
            empty="None of the tracked events have fired in the last 30 days."
          />
          <p className="mt-3 font-body text-xs text-faint">Event counts, not unique users. A user who retries a payment counts twice.</p>
        </Card>
      </div>
    </div>
  );
}
