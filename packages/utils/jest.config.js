module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "jest-environment-jsdom",
  testTimeout: 100000,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
