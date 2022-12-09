/**
 * @type {import('next').NextConfig}
 * */

const contentSecurityPolicy = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'"],
  "frame-src": ["'self'"],
  "child-src": ["'self'"],
  "img-src": ["'self'", "image.mux.com"],
  "media-src": ["'self'", "blob:", "image.mux.com"],
  "worker-src": ["blob:"],
  "connect-src": ["'self'", "inferred.litix.io", "api-js.mixpanel.com", "*.mux.com"],
};

if (process.env.NODE_ENV === "development") {
  // NextJS needs unsafe-eval for development as it uses source maps to help with debugging.
  contentSecurityPolicy["script-src"].push("'unsafe-eval'");
}

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: Object.entries(contentSecurityPolicy)
      .map(([k, v]) => k + " " + v.join(" "))
      .join("; "),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
