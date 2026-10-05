import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function Topbar({ username, onMenuPress }: { username: string; onMenuPress?: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuPress && (
          <button
            type="button"
            onClick={onMenuPress}
            aria-label="Open navigation"
            className="-ml-1 flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink md:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="font-label text-xs uppercase tracking-wide text-muted">Admin console</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden font-body text-sm text-ink sm:inline">{username}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-body text-xs text-muted transition-colors hover:border-danger-border hover:text-danger"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
