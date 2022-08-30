/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  reactStrictMode: true,
  images: {
    domains: ["app.osmosis.zone", "raw.githubusercontent.com"],
  },
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({});
