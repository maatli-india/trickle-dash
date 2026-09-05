"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      <SubmitButton className="w-full">Log in</SubmitButton>
    </form>
  );
}
