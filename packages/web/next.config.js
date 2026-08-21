// @ts-check
const path = require("path");

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  images: {
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

    fileLoaderRule.exclude = /sprite\.svg$/;

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
        // bip39 is only used in the context of the extension wallet, so we can replace it.
        // replacing it with a no-op breaks build, so we can at least replace it with a lighter weight version for now.
        // ideally this becomes replaced with an API-compatible no-op.
        bip39: path.resolve(__dirname, "../../node_modules/bip39-light"),
        // @cosmjs/launchpad is deprecated and pins axios 0.21.4, which any scanner reports
        // against the client bundle. We never import it at runtime, but @keplr-wallet/cosmos'
        // barrel unconditionally re-exports its adr-36 module, which requires launchpad, so it
        // ships anyway along with launchpad's axios-based LcdClient.
        //
        // @cosmjs/amino is the maintained successor and is already eagerly bundled. It exports
        // every symbol the real call sites use (serializeSignDoc, encodeSecp256k1Pubkey,
        // encodeSecp256k1Signature), so aliasing keeps ADR-36 working rather than stubbing it.
        // yarn resolutions cannot fix this — they do not reach launchpad's nested axios.
        "@cosmjs/launchpad": path.resolve(
          __dirname,
          "../../node_modules/@cosmjs/amino"
        ),
      },
    };

    return config;
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = {
  ...module.exports,
  mode: "production", // Ensure the mode is 'production' for tree shaking to work
  optimization: {
    usedExports: true, // This setting enables tree shaking
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
