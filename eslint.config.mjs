import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { FlatCompat } from "@eslint/eslintrc";

const require = createRequire(import.meta.url);
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const webRoot = fileURLToPath(new URL("./packages/web/", import.meta.url));

const baseConfig = require("./.eslintrc.base.js");
const sourceFiles = ["**/*.{js,cjs,mjs,jsx,ts,tsx}"];

const webNextConfig = {
  extends: ["next/core-web-vitals", "prettier"],
  settings: { next: { rootDir: webRoot } },
};

const webRules = {
  plugins: ["unicorn", "simple-import-sort", "unused-imports"],
  rules: {
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.spec.ts",
          "**/*.spec.tsx",
          "**/*.spec.js",
          "**/setup-tests.js",
        ],
      },
    ],
    "@next/next/no-img-element": "off",
    "react/display-name": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "unused-imports/no-unused-imports": "error",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks:
          "^use(Async|AsyncFn|AsyncRetry|UpdateEffect|IsomorphicLayoutEffect|DeepCompareEffect|ShallowCompareEffect)$",
      },
    ],
    "import/no-default-export": "error",
  },
};

const protoCodecsConfig = {
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/ban-types": "off",
  },
};

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/build/**",
      "**/dist/**",
      "packages/web/e2e/keplr-extension/**",
      "packages/web/public/tradingview/**",
      "packages/proto-codecs/src/codegen/**",
    ],
  },
  ...compat.config(baseConfig).map((config) => ({
    ...config,
    ignores: ["packages/web/**"],
  })),
  ...compat.config(webNextConfig).map((config) => ({
    ...config,
    files: ["packages/web/**/*.{js,cjs,mjs,jsx,ts,tsx}"],
  })),
  ...compat.config(webRules).map((config) => ({
    ...config,
    files: ["packages/web/**/*.{js,cjs,mjs,jsx,ts,tsx}"],
  })),
  ...compat
    .config({
      rules: { "import/no-default-export": "off" },
    })
    .map((config) => ({
      ...config,
      files: [
        "packages/web/pages/**/*.{js,cjs,mjs,jsx,ts,tsx}",
        "packages/web/playwright.config.ts",
      ],
    })),
  ...compat
    .config({
      rules: { "import/no-default-export": "off" },
    })
    .map((config) => ({
      ...config,
      files: ["packages/web/localizations/dayjs-locale-*.js"],
    })),
  ...compat.config(protoCodecsConfig).map((config) => ({
    ...config,
    files: ["packages/proto-codecs/**/*.{js,cjs,mjs,jsx,ts,tsx}"],
  })),
  {
    files: sourceFiles,
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
];
