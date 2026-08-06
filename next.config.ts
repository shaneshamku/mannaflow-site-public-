import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // retell-client-js-sdk (voice demo widget) signals over a LiveKit-
      // hosted websocket and can reconnect to a region-specific subdomain,
      // so the whole livekit.cloud family needs to be allowed, not just the
      // one hardcoded host. Supabase is the dashboard's auth + data backend;
      // the browser client talks to it directly (login, session refresh,
      // realtime), so its https + wss origins must be allowed too.
      "connect-src 'self' wss://*.livekit.cloud https://*.livekit.cloud https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
