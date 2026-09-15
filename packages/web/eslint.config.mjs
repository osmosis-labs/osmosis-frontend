import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  ...nextVitals,
  eslintConfigPrettier,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    plugins: {
      unicorn,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
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
      // eslint-plugin-react-hooks 6 (via eslint-config-next 16) ships React
      // Compiler rules. Keep the Next 14 surface until we adopt the compiler.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    files: [
      "pages/**/*",
      "playwright.config.ts",
      "eslint.config.mjs",
      "next.config.js",
      "proxy.ts",
      "localizations/**",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["stores/root.ts"],
    rules: {
      // MobX `Queries.use` / `Account.use` factories, not React hooks.
      "react-hooks/rules-of-hooks": "off",
    },
  },
  globalIgnores([
    "e2e/keplr-extension/**",
    ".next/**",
    "node_modules/**",
    "public/**",
    "config/generated/**",
    "next-env.d.ts",
  ]),
]);
