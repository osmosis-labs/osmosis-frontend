module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  globalSetup: "./src/__tests__/global-setup.ts",
  globalTeardown: "./src/__tests__/global-teardown.ts",
};
