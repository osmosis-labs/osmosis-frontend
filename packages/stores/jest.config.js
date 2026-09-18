const esmModules = [
  "bitcoinjs-lib",
  "uint8array-tools",
  "varuint-bitcoin",
  "@osmosis-labs/tx",
  "superjson",
  "rettime",
  "until-async",
  "msw",
  "@mswjs",
  "@open-draft",
];

module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "../../jsdom-extended.js",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  testTimeout: 100000,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^msw/node$": require.resolve("msw/node"),
  },
  transformIgnorePatterns: [`node_modules/(?!(${esmModules.join("|")})/)`],
  transform: {
    "^.+\\.(js|jsx|mjs)?$": [
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
