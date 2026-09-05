import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function Topbar({ username }: { username: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="font-label text-xs uppercase tracking-wide text-muted">Admin console</div>
      <div className="flex items-center gap-4">
        <span className="font-body text-sm text-ink">{username}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-body text-xs text-muted transition-colors hover:border-danger-border hover:text-danger"
          >
            <LogOut size={14} />
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
