module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
  // Workspace deps (e.g. @osmosis-labs/unit) build to ESM; run their .js through Babel.
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { configFile: "../../babel.config.json" }],
    "^.+\\.tsx?$": "ts-jest",
  },
};
