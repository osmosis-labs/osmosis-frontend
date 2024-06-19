module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  setupFilesAfterEnv: ["./src/__tests__/setup-tests.ts"],
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
  transformIgnorePatterns: ["node_modules/(?!(superjson)/)"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
