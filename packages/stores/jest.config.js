module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "jsdom",
  testTimeout: 100000,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  transformIgnorePatterns: ["node_modules/(?!(@osmosis-labs/tx)/)"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(js|jsx)?$": [
      "babel-jest",
      { configFile: "../../babel.config.json" },
    ],
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};
