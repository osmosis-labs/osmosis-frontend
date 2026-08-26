const path = require("path");

module.exports = {
  "**/*.{js,ts,jsx,tsx}": (filenames) => {
    // Make paths relative to the package cwd. Uses path.relative so this
    // works on Windows too, where cwd has backslashes and the previous
    // string-split approach produced empty paths (prettier then hung
    // waiting on stdin).
    const filePaths = filenames.map((file) =>
      path.relative(process.cwd(), file).split(path.sep).join("/")
    );

    return [
      `prettier --check ${filePaths.join(" ")}`,
      `next lint --file ${filePaths.join(" --file ")}`,
    ];
  },
};
