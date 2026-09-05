"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-medium transition-colors disabled:opacity-60";
  const variants = {
    primary: "bg-accent text-accent-ink hover:brightness-95",
    danger: "bg-danger text-white hover:brightness-95",
    ghost: "border border-border text-ink hover:bg-surface-muted",
  };
  return (
    <button type="submit" disabled={pending} className={`${base} ${variants[variant]} ${className}`}>
      {pending ? "Saving..." : children}
    </button>
  );
}
