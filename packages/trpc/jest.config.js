module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  transformIgnorePatterns: ["node_modules/(?!(superjson)/)"],
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
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
