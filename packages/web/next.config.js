/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["app.osmosis.zone"],
  },
  webpack(config) {
    /**
     * Add sprite.svg to bundle and append hash to revalidate cache when content changes.
     */
    config.module.rules.push({
      test: [/sprite\.svg$/],
      type: "asset/resource",
    });

    /**
     * Avoid using next-image-loader for sprite.svg as it cannot be compiled as successfully given
     * it uses a different svg syntax.
     */
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test(".svg")
    );
    fileLoaderRule.exclude = /sprite\.svg$/;

    return config;
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
