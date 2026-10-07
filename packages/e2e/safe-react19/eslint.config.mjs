import path from "node:path";

import { FlatCompat } from "@eslint/eslintrc";

const rootDir = path.resolve(import.meta.dirname, "../../..");
const compat = new FlatCompat({ baseDirectory: rootDir });
const config = [
  { ignores: ["**/next-env.d.ts"] },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    plugins: ["simple-import-sort"],
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/no-default-export": "error",
    },
  }),
  {
    settings: {
      next: { rootDir: path.join(import.meta.dirname, "fixture") },
      "import/internal-regex": "^~/",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Imports intentionally use these workspaces' installed dependencies.
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          packageDir: [
            path.join(rootDir, "packages/web"),
            path.join(rootDir, "packages/e2e"),
            rootDir,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.cjs", "**/next.config.js", "**/postcss.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: [
      "**/pages/**/*.tsx",
      "**/playwright.config.ts",
      "**/eslint.config.mjs",
    ],
    // Required Next page/config export conventions.
    rules: { "import/no-default-export": "off" },
  },
];
export default config;
