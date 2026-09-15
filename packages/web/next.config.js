// @ts-check
const path = require("path");

const noop = path.resolve(__dirname, "etc", "noop", "index.js");

/**
 * Libsodium is only pulled in by cosmJS for argon2i/ed25519 wallet-extension
 * paths we never hit, and is ~190kb gzipped (bundled twice). Launchpad is a
 * dead CosmJS barrel that pins axios 0.21.4; amino is the maintained successor.
 *
 * Turbopack treats absolute paths as project-relative (`./Users/...`), so it
 * gets package names / paths relative to this config. Webpack still wants
 * absolute filesystem paths.
 */
const turbopackResolveAliases = {
  libsodium: "./etc/noop/index.js",
  "libsodium-wrappers": "./etc/noop/index.js",
  "libsodium-sumo": "./etc/noop/index.js",
  "libsodium-wrappers-sumo": "./etc/noop/index.js",
  bip39: "bip39-light",
  "@cosmjs/launchpad": "@cosmjs/amino",
};

const webpackResolveAliases = {
  libsodium: noop,
  "libsodium-wrappers": noop,
  "libsodium-sumo": noop,
  "libsodium-wrappers-sumo": noop,
  bip39: path.resolve(__dirname, "../../node_modules/bip39-light"),
  "@cosmjs/launchpad": path.resolve(
    __dirname,
    "../../node_modules/@cosmjs/amino"
  ),
};

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  images: {
    // Next 16 defaults qualities to [75]; twitter embeds pass quality={100}.
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.osmosis.zone",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=864000", // Cache for 10 days
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: turbopackResolveAliases,
    rules: {
      // Hashed URL for <use href>, not next-image (sprite syntax fails that loader).
      "**/sprite.svg": {
        type: "asset",
      },
    },
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
    const fileLoaderRule = config.module.rules.find((rule) => {
      if (rule.test && Array.isArray(rule.test)) {
        return rule.test.some((exp) => exp.test(".svg"));
      }

      return rule.test && rule.test.test(".svg");
    });

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /sprite\.svg$/;
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        ...webpackResolveAliases,
      },
    };

    return config;
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
