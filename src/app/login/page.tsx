import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in — Trickle Dash" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-7 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Trickle Dash</h1>
          <p className="mt-1.5 font-body text-sm text-muted">Sign in to manage the Trickle platform.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
