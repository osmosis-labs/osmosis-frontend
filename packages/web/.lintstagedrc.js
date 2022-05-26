module.exports = {
  "**/*.{js,ts,jsx,tsx}": (filenames) => {
    const filePaths = filenames.map((file) => {
      // Current working directory
      let cwd = process.cwd();
      if (cwd[cwd.length - 1] !== "/") {
        cwd = cwd + "/";
      }

      return file.split(cwd)[1];
    });

    return [
      `prettier --check ${filePaths.join(" ")}`,
      `next lint --file ${filePaths.join(" --file ")}`,
    ];
  },
};
