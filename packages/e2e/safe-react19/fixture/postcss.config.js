const path = require("node:path");
const theme = require("../../../web/tailwind.config.js");
module.exports = {
  plugins: {
    tailwindcss: {
      ...theme,
      content: [
        path.join(__dirname, "**/*.tsx"),
        path.join(
          __dirname,
          "../../../web/components/{drawers,stepper}/**/*.tsx"
        ),
        path.join(__dirname, "../../../web/modals/base.tsx"),
      ],
    },
    autoprefixer: {},
  },
};
