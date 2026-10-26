import { fileURLToPath } from "node:url";

import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import unicornPlugin from "eslint-plugin-unicorn";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import globals from "globals";

const webFiles = ["packages/web/**/*.{js,cjs,mjs,jsx,ts,tsx}"];
const webRoot = fileURLToPath(new URL("./packages/web/", import.meta.url));

/**
 * Shared by every package: import hygiene and file naming. The `import`
 * plugin itself comes from importPlugin.flatConfigs.typescript for libraries
 * and is registered explicitly for web.
 */
const sharedPlugins = {
  "simple-import-sort": simpleImportSortPlugin,
  unicorn: unicornPlugin,
  "unused-imports": unusedImportsPlugin,
};

const sharedRules = {
  "unicorn/filename-case": ["error", { case: "kebabCase" }],
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error",
  "unused-imports/no-unused-imports": "error",
  "import/no-default-export": "error",
};

/** Library packages (everything except web). */
const libraryConfig = [
  ...tsPlugin.configs["flat/recommended"],
  importPlugin.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: sharedPlugins,
    rules: {
      ...sharedRules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
  },
].map((config) => ({
  ...config,
  ignores: ["packages/web/**"],
}));

const reactCompilerRules = [
  "config",
  "error-boundaries",
  "gating",
  "globals",
  "immutability",
  "incompatible-library",
  "preserve-manual-memoization",
  "purity",
  "refs",
  "set-state-in-effect",
  "set-state-in-render",
  "static-components",
  "unsupported-syntax",
  "use-memo",
  "void-use-memo",
];

/** Next.js app. Mirrors eslint-config-next's core-web-vitals preset. */
const webConfig = [
  reactPlugin.configs.flat.recommended,
  reactHooksPlugin.configs.flat["recommended-latest"],
  nextPlugin.flatConfig.coreWebVitals,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      ...sharedPlugins,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      next: { rootDir: webRoot },
      react: { version: "detect" },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".mts", ".cts", ".tsx", ".d.ts"],
      },
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        typescript: { alwaysTryTypes: true, project: webRoot },
      },
    },
    rules: {
      // eslint-config-next
      "import/no-anonymous-default-export": "warn",
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "react/jsx-no-target-blank": "off",
    },
  },
  prettierConfig,
  {
    rules: {
      ...sharedRules,
      ...Object.fromEntries(
        reactCompilerRules.map((rule) => [`react-hooks/${rule}`, "error"])
      ),
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.spec.js",
            "**/setup-tests.js",
            "**/web/config/generate-*.ts",
            "**/web/open-next.config.ts",
          ],
        },
      ],
      "@next/next/no-img-element": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks:
            "^use(Async|AsyncFn|AsyncRetry|UpdateEffect|IsomorphicLayoutEffect|DeepCompareEffect|ShallowCompareEffect)$",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "mobx",
                "mobx/**",
                "mobx-react-lite",
                "mobx-react-lite/**",
                "mobx-utils",
                "mobx-utils/**",
              ],
              message:
                "MobX state has been replaced by React hooks and Zustand. Use the existing hooks and stores.",
            },
            {
              group: [
                "@osmosis-labs/stores",
                "@osmosis-labs/stores/**",
                "@osmosis-labs/keplr-hooks",
                "@osmosis-labs/keplr-hooks/**",
                "@osmosis-labs/keplr-stores",
                "@osmosis-labs/keplr-stores/**",
              ],
              message:
                "The legacy store packages have been removed. Use useWallet and the standalone types, utils, or tx packages.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "packages/web/pages/**/*.{js,cjs,mjs,jsx,ts,tsx}",
      "packages/web/playwright.config.ts",
      "packages/web/open-next.config.ts",
      "packages/web/worker.ts",
      "packages/web/router/worker.ts",
      "packages/web/localizations/dayjs-locale-*.js",
    ],
    rules: { "import/no-default-export": "off" },
  },
].map((config) => ({ ...config, files: config.files ?? webFiles }));

// eslint-disable-next-line import/no-default-export -- ESLint loads its flat config through the default export.
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.open-next/**",
      "**/.wrangler/**",
      "**/build/**",
      "**/dist/**",
      "packages/web/e2e/keplr-extension/**",
      "packages/web/public/tradingview/**",
      "packages/proto-codecs/src/codegen/**",
    ],
  },
  ...libraryConfig,
  { ...prettierConfig, ignores: ["packages/web/**"] },
  ...webConfig,
  {
    files: ["packages/proto-codecs/**/*.{js,cjs,mjs,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,tsx}"],
    linterOptions: { reportUnusedDisableDirectives: "warn" },
  },
];
