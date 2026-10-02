// @ts-check
const path = require("path");

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  // CI lints (lint-and-check-format.yml) and type-checks (`yarn typecheck`) every push,
  // so skip both here to save ~40s on each Vercel build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
  webpack(config, { webpack }) {
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
    // Our CosmJS (>=0.36) no longer uses libsodium, but the CosmJS 0.31 copies pulled in by
    // @0xsquid/sdk and nomic-bitcoin still do.
    //
    // It should never be getting used. This is copied from what Keplr does:
    // https://github.com/chainapsis/keplr-wallet/blob/master/package.json#L103-L104
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
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
      },
    };

    // CosmJS >=0.36 replaced libsodium with @noble/curves (ed25519), @noble/ciphers
    // (xchacha20poly1305) and hash-wasm (argon2id), all loaded from this one module. Stub it
    // like the libsodium aliases above so they stay out of the client bundle (~90kb gzipped,
    // mostly hash-wasm's inlined WASM). Only this file is replaced: other packages need the
    // real @noble/curves. Ed25519, Argon2id and Xchacha20poly1305Ietf from @cosmjs/crypto are
    // therefore unavailable client-side, exactly as they were with libsodium stubbed.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@cosmjs[\\/]crypto[\\/]build[\\/]libsodium\.js$/,
        path.resolve(__dirname, "etc", "noop", "index.js")
      )
    );

    return config;
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
