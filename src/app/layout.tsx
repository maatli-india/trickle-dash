import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trickle Dash",
  description: "Admin dashboard for the Trickle platform.",
};

// Next only stamps the middleware.ts CSP nonce on pages rendered per request; a
// prerendered page (e.g. /login) ships nonce-less scripts that the CSP blocks.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-ink antialiased">{children}</body>
    </html>
  );
}
