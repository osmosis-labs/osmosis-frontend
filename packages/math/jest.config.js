module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  // Workspace deps (e.g. @osmosis-labs/unit) build to ESM; run their .js through Babel.
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { configFile: "../../babel.config.json" }],
    "^.+\\.tsx?$": "ts-jest",
  },
};
