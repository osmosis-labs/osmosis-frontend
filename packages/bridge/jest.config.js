const { swcTransform } = require("../../jest.swc");

module.exports = {
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  setupFilesAfterEnv: ["./src/__tests__/setup-tests.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: swcTransform,
  transformIgnorePatterns: [
    "node_modules/(?!(superjson|msw|@mswjs|@open-draft|rettime|until-async)/)",
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
