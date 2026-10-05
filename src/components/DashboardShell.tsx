"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

// Sidebar is a fixed column on desktop (md:flex) but was previously just
// `hidden` below that breakpoint — on mobile there was no way to navigate
// between dashboard sections at all. This wrapper holds the one bit of
// state (is the mobile nav drawer open) that Sidebar and Topbar's menu
// button both need, since layout.tsx (a server component, it awaits
// getSession()) can't hold client state itself.
export function DashboardShell({ username, children }: { username: string; children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Prevent the page behind the drawer from scrolling while it's open —
  // otherwise a touch-scroll over the backdrop scrolls the dashboard page
  // underneath, which is disorienting once the drawer closes.
  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar username={username} onMenuPress={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
