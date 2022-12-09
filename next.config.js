/**
 * @type {import('next').NextConfig}
 * */

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  frame-src 'self';
  child-src 'self';
  img-src 'self' image.mux.com;
  media-src 'self' blob: image.mux.com;
  worker-src blob:;
  connect-src: 'self' inferred.litix.io api-js.mixpanel.com mux.com;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
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
