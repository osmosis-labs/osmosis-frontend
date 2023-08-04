const nextJest = require("next/jest");
// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/setup-tests.js"],
  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl],
  // Resolve absolute imports
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  testEnvironment: "jest-environment-jsdom",
};

module.exports = createJestConfig(config);
