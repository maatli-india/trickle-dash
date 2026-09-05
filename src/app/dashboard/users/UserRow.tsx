"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";
import { banUserAction, unbanUserAction } from "@/lib/actions/users";
import type { AdminUser } from "@/lib/types";

const STATUS_TONE = { active: "success", blocked: "danger", deleted: "neutral", inactive: "neutral" } as const;

export function UserRow({ user }: { user: AdminUser }) {
  const [banning, setBanning] = useState(false);
  const [state, formAction] = useActionState(banUserAction, undefined);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <Link href={`/dashboard/users/${user.id}`} className="font-body text-sm font-medium text-ink hover:underline">
          {user.name || "—"}
        </Link>
        <div className="font-body text-xs text-muted">{user.phone || user.email}</div>
      </td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
      </td>
      <td className="px-4 py-3 font-body text-sm text-muted">{user.verified ? "Verified" : "Not verified"}</td>
      <td className="px-4 py-3 font-body text-sm text-muted">{user.completedTrips}</td>
      <td className="px-4 py-3 text-right">
        {user.status === "blocked" ? (
          <form action={unbanUserAction.bind(null, user.id)}>
            <button type="submit" className="font-body text-xs font-medium text-success hover:underline">
              Unban
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setBanning((v) => !v)} className="font-body text-xs font-medium text-danger hover:underline">
            {banning ? "Cancel" : "Ban"}
          </button>
        )}
        {banning ? (
          <form action={formAction} className="mt-2 flex flex-col items-end gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <input
              name="reason"
              placeholder="Reason (required)"
              required
              className="w-56 rounded-lg border border-border bg-surface px-2.5 py-1.5 font-body text-xs text-ink outline-none focus:border-danger"
            />
            {state?.error ? <p className="font-body text-xs text-danger">{state.error}</p> : null}
            <SubmitButton variant="danger" className="!px-3 !py-1.5 !text-xs">
              Confirm ban
            </SubmitButton>
          </form>
        ) : null}
      </td>
    </tr>
  );
}
