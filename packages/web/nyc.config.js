"use strict";

module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  all: true,
  "check-coverage": true,
  exclude: [
    "__mocks__",
    "e2e",
    "sentry*",
    ".next",
    "__tests__",
    "coverage",
    "*.config.*",
    ".lintstagedrc.js",
    "**/__tests__",
  ],
  branches: 1,
  functions: 1,
  lines: 1,
  statements: 1,
  reporter: ["html", "text", "lcov"],
};
