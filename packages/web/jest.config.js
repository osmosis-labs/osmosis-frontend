const nextJest = require("next/jest");
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  setupFilesAfterEnv: ["<rootDir>/setup-tests.js"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  },
};

module.exports = createJestConfig(config);
