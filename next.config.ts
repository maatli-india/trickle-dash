import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop advertising the framework to drive-by scanners.
  poweredByHeader: false,
  async headers() {
    // Static, non-per-request security headers. The CSP itself (which
    // needs a fresh nonce per request) is set in middleware.ts instead.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
