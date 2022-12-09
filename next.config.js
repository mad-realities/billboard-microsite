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
  media-src 'self';
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
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
