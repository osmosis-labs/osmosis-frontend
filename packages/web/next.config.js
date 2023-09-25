const path = require("path");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["app.osmosis.zone", "raw.githubusercontent.com"],
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
     * Avoid using next-image-loader for sprite.svg as it cannot be compiled successfully given
     * it uses a different svg syntax.
     */
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test(".svg")
    );
    fileLoaderRule.exclude = /sprite\.svg$/;

    // workaround to get imports to work in web workers
    config.optimization.splitChunks.cacheGroups = {
      commons: { chunks: "initial" },
    };

    // Replace libsodium with a no-op API. It is only imported from within cosmJS to support
    // argon2i and ed25519, both functionalities which in the context of Cosmos would only get used within
    // an extension wallet. Libsodium is ~190kb gzipped, 500kb parsed, so this meaningfully reduces client load.
    // (And it gets bundled twice)
    //
    // It should never be getting used. This is copied from what Keplr does:
    // https://github.com/chainapsis/keplr-wallet/blob/master/package.json#L103-L104
    config.resolve = {
      ...config.resolve, // This spreads existing resolve configuration (if any)
      alias: {
        ...config.resolve.alias, // This spreads any existing alias configurations
        libsodium: path.resolve(__dirname, "etc", "noop", "index.js"),
        "libsodium-wrappers": path.resolve(
          __dirname,
          "etc",
          "noop",
          "index.js"
        ),
        "libsodium-sumo": path.resolve(__dirname, "etc", "noop", "index.js"),
        "libsodium-wrappers-sumo": path.resolve(
          __dirname,
          "etc",
          "noop",
          "index.js"
        ),
        "@keplr-wallet/unit": path.resolve(__dirname, "../unit"),
      },
    };

    return config;
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "osmosis-wu",
    project: "javascript-nextjs",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
