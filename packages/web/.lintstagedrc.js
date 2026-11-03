// lint-staged runs from the repo root (see the root `pre-commit` script) and
// executes these commands from packages/web with absolute file paths appended.
module.exports = {
  "**/*.{js,ts,jsx,tsx}": ["prettier --check", "eslint --max-warnings=0"],
};
