module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/setup-tests.ts"],
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "jsdom",
  testTimeout: 100000,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
