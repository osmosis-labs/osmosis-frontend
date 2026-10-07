// Chart dependency regressions do not need the app's tRPC/MSW/store setup.
// Run after building @osmosis-labs/unit, without building the entire app.
module.exports = async () => ({
  ...(await require("./jest.config")()),
  rootDir: __dirname,
  setupFiles: [],
  setupFilesAfterEnv: [],
  watchPlugins: [],
  testMatch: ["<rootDir>/components/chart/__tests__/*.spec.tsx"],
});
