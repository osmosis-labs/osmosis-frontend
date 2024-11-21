module.exports = {
  ...require("../../.eslintrc.base.js"),
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
