import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trickle Dash",
  description: "Admin dashboard for the Trickle platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-ink antialiased">{children}</body>
    </html>
  );
}
