const { swcTransform } = require("../../jest.swc");

module.exports = {
  roots: ["<rootDir>/src/", "<rootDir>/scripts/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: swcTransform,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
