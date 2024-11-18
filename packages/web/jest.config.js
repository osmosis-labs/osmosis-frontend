const nextJest = require("next/jest");
// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup-tests.ts"],
  setupFiles: ["jest-launchdarkly-mock"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  moduleNameMapper: {
    // Resolve absolute imports
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  testEnvironment: "../../jsdom-extended.js",
  testPathIgnorePatterns: ["e2e"],
};

const esmModules = [
  "superjson",
  "@cosmos-kit/core",
  "uuid",
  "@keplr-wallet/unit",
  "@osmosis-labs/stores",
  "@osmosis-labs/utils",
  "@axelar-network/axelarjs-sdk",
  "wagmi",
  "@wagmi",
  "@walletconnect/ethereum-provider",
  "uint8arrays",
  "multiformats",
  "@walletconnect/universal-provider",
  "bitcoinjs-lib",
  "uint8array-tools",
  "varuint-bitcoin",
];

module.exports = async () => ({
  ...(await createJestConfig(config)()),
  transformIgnorePatterns: [`node_modules/(?!(${esmModules.join("|")})/)`],
});
