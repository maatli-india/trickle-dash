"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Plane,
  Wallet,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  Megaphone,
  BellRing,
  UserX,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/requests", label: "Requests", icon: Package },
  { href: "/dashboard/trips", label: "Trips", icon: Plane },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/reports", label: "Reports", icon: ShieldAlert },
  { href: "/dashboard/deletions", label: "Deletions", icon: UserX },
  { href: "/dashboard/config", label: "Configuration", icon: SlidersHorizontal },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/notifications", label: "Notifications", icon: BellRing },
];

function SidebarBrand() {
  return (
    <div className="flex h-16 items-center gap-2 px-6">
      <span className="font-display text-xl font-semibold text-ink">Trickle</span>
      <span className="rounded-full bg-accent-surface px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wide text-warning">
        Dash
      </span>
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-5">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors ${
              active ? "bg-accent-surface text-accent-ink font-medium" : "text-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <Icon size={17} strokeWidth={active ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// mobileOpen/onClose are undefined when rendered without the mobile drawer
// context (not currently the case — DashboardShell always passes them —
// but kept optional so Sidebar still renders a sane desktop-only view if
// ever used elsewhere without that wrapper).
export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  // Belt-and-suspenders: if a nav link's own onClick (below) is ever
  // bypassed — e.g. browser back/forward while the drawer is open — closing
  // on every pathname change guarantees the drawer never gets stuck open
  // over the wrong page.
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border">
          <SidebarBrand />
        </div>
        <SidebarNav pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col border-r border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border">
              <SidebarBrand />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className="mr-4 flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
