module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Workspace dependencies build to ESM. Match the other legacy package suites.
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { configFile: "../../babel.config.json" }],
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
};
