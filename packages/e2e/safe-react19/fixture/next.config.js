const path = require("node:path");
const web = path.resolve(__dirname, "../../../web");
module.exports = {
  reactStrictMode: true,
  experimental: { externalDir: true },
  distDir: "../../../../.yarn/react19-browser/fixture-next",
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /(?:~\/hooks$|web\/hooks\/index\.ts$)/,
        path.resolve(__dirname, "hooks.ts")
      )
    );
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /(?:~\/components\/(?:assets|ui\/button|buttons\/icon-button|loaders\/skeleton-loader)$|web\/components\/(?:assets\/index\.ts|ui\/button\.tsx|buttons\/icon-button\.tsx|loaders\/skeleton-loader\.tsx)$)/,
        path.resolve(__dirname, "visuals.tsx")
      )
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      "~/hooks$": path.resolve(__dirname, "hooks.ts"),
      "~/components/assets$": path.resolve(__dirname, "visuals.tsx"),
      "~/components/ui/button$": path.resolve(__dirname, "visuals.tsx"),
      "~/components/buttons/icon-button$": path.resolve(
        __dirname,
        "visuals.tsx"
      ),
      "~/components/loaders/skeleton-loader$": path.resolve(
        __dirname,
        "visuals.tsx"
      ),
      "~": web,
    };
    return config;
  },
};
