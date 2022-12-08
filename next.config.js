/**
 * @type {import('next').NextConfig}
 * */
module.exports = {
  poweredByHeader: false,
  compiler: {
    relay: {
      src: "./src",
      artifactDirectory: "./src/__generated__",
      language: "typescript",
    },
  },
  reactStrictMode: true,
};
