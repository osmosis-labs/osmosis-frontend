const { swcTransform } = require("../../jest.swc");

const esmModules = ["bitcoinjs-lib", "uint8array-tools", "varuint-bitcoin"];

module.exports = {
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "../../jsdom-extended.js",
  testTimeout: 100000,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  transformIgnorePatterns: [`node_modules/(?!(${esmModules.join("|")})/)`],
  transform: swcTransform,
};
