"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Plane,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  Megaphone,
  BellRing,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/requests", label: "Requests", icon: Package },
  { href: "/dashboard/trips", label: "Trips", icon: Plane },
  { href: "/dashboard/reports", label: "Reports", icon: ShieldAlert },
  { href: "/dashboard/config", label: "Configuration", icon: SlidersHorizontal },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/notifications", label: "Notifications", icon: BellRing },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="font-display text-xl font-semibold text-ink">Trickle</span>
        <span className="rounded-full bg-accent-surface px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wide text-warning">
          Dash
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
