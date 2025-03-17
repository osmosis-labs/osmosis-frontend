// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require("../../.eslintrc.base.js");

module.exports = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, "react-hooks", "react"],
  rules: {
    ...baseConfig.rules,
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks:
          "^use(Async|AsyncFn|AsyncRetry|UpdateEffect|IsomorphicLayoutEffect|DeepCompareEffect|ShallowCompareEffect)$",
      },
    ],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": "warn",
  },
  overrides: [
    // Pages router, config files
    {
      files: ["app/**/*"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
