const config = require("./jest.config");

module.exports = async () => ({
  ...(await config()),
  setupFilesAfterEnv: [],
  testMatch: ["<rootDir>/__tests_wallet_local__/**/*.spec.tsx"],
  testPathIgnorePatterns: [],
  testTimeout: 120_000,
});
