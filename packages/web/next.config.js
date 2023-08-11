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

/**
 * Transpile modules from node_modules using the Next.js Babel configuration.
 * Makes it easy to have local libraries and keep a slick, manageable dev experience.
 *
 * Benefits:
 *  - Supports transpilation of all extensions supported by Next.js: .js, .jsx, .ts, .tsx, .mjs, .css, .scss and .sass
 *  - Enable hot-reloading on local packages
 *
 * @see https://www.npmjs.com/package/next-transpile-modules
 *
 * Note: Make sure that the package has a index.ts file in the root directory so that it can be imported.
 */
const withTM = require("next-transpile-modules")([
  "@osmosis-labs/math",
  "@osmosis-labs/pools",
  "@osmosis-labs/stores",
  "@osmosis-labs/proto-codecs",
]);

// Transpile modules should always be the last plugin
module.exports = withTM(module.exports);
