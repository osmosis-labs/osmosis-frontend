// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const nextJest = require("next/jest");
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require("ts-jest");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require("./tsconfig");

config = {
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  moduleNameMapper: {
    // Resolve absolute imports
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },
};

module.exports = async () => ({
    // ...(await createJestConfig(config)()),
    ...config,
    testEnvironment: "node",
    // transformIgnorePatterns: [
    //     "node_modules/(?!superjson/.*)",
    // ],

    transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
      transformIgnorePatterns: ['<rootDir>/node_modules/']
  });
