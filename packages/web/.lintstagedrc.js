// lint-staged runs from the repo root (see the root `pre-commit` script) and
// executes these commands from packages/web with absolute file paths appended.
module.exports = {
  "**/*.{js,ts,jsx,tsx}": [
    "prettier --check",
    "oxlint --max-warnings=0 --no-error-on-unmatched-pattern",
  ],
};
