/**
 * @type {import('next').NextConfig}
 * */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.WEBPACK_ANALYSIS,
});
module.exports = withBundleAnalyzer({
  poweredByHeader: false,
  reactStrictMode: true,
});
