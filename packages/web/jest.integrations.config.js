const nextJest = require("next/jest");
// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  testMatch: [
    "**/server/integrations/**/__tests__/**/*.spec.ts",
    "**/__tests__/api/**/*.spec.ts",
  ],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },
  testEnvironment: "node",
};

const esmModules = ["@moonpay/moonpay-node", "@osmosis-labs/utils"];

module.exports = async () => ({
  ...(await createJestConfig(config)()),
  transformIgnorePatterns: [`node_modules/(?!(${esmModules.join("|")})/)`],
});
