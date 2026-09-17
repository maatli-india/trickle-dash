"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { banUserAction, unbanUserAction } from "@/lib/actions/users";
import type { AdminUser } from "@/lib/types";

export function BanControls({ user }: { user: AdminUser }) {
  const [banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);
  const [banState, banFormAction] = useActionState(banUserAction, undefined);
  const [unbanState, unbanFormAction] = useActionState(unbanUserAction, undefined);

  if (user.status === "blocked") {
    return (
      <div>
        {!unbanning ? (
          <button
            type="button"
            onClick={() => setUnbanning(true)}
            className="rounded-lg border border-border px-4 py-2 font-body text-sm font-medium text-ink hover:bg-surface-muted"
          >
            Unban this account
          </button>
        ) : (
          <form action={unbanFormAction} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <input type="hidden" name="userId" value={user.id} />
            <input
              name="reason"
              placeholder="Reason for lifting the ban (required, kept on record)"
              required
              className="w-72 rounded-lg border border-border bg-surface px-3 py-2 font-body text-xs text-ink outline-none focus:border-accent"
            />
            <SubmitButton variant="ghost">Confirm unban</SubmitButton>
            <button type="button" onClick={() => setUnbanning(false)} className="font-body text-xs text-muted hover:text-ink">
              Cancel
            </button>
          </form>
        )}
        {unbanState?.error ? <p className="mt-2 font-body text-xs text-danger">{unbanState.error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      {!banning ? (
        <button
          type="button"
          onClick={() => setBanning(true)}
          className="rounded-lg border border-danger-border px-4 py-2 font-body text-sm font-medium text-danger hover:bg-danger-surface"
        >
          Ban this account
        </button>
      ) : (
        <form action={banFormAction} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <input type="hidden" name="userId" value={user.id} />
          <input
            name="reason"
            placeholder="Reason for the ban (required, kept on record)"
            required
            className="w-72 rounded-lg border border-border bg-surface px-3 py-2 font-body text-xs text-ink outline-none focus:border-danger"
          />
          <SubmitButton variant="danger">Confirm ban</SubmitButton>
          <button type="button" onClick={() => setBanning(false)} className="font-body text-xs text-muted hover:text-ink">
            Cancel
          </button>
        </form>
      )}
      {banState?.error ? <p className="mt-2 font-body text-xs text-danger">{banState.error}</p> : null}
    </div>
  );
}
