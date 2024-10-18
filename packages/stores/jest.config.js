const esmModules = [
  "bitcoinjs-lib",
  "uint8array-tools",
  "varuint-bitcoin",
  "@osmosis-labs/tx",
  "superjson",
];

module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "../../jsdom-extended.js",
  testTimeout: 100000,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [`node_modules/(?!(${esmModules.join("|")})/)`],
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
