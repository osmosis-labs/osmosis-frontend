const nextJest = require("next/jest");

// Offline dependency/store regressions: no app providers, MSW or wallet adapters.
// Keep production Next transforms without importing the global test lifecycle.
const createConfig = nextJest({ dir: "./" })({
  testEnvironment: "../../jsdom-extended.js",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: { "^~/(.*)$": "<rootDir>/$1" },
  testMatch: [
    "<rootDir>/stores/__tests__/react19-external-stores.spec.tsx",
    "<rootDir>/stores/__tests__/mobx-react-lite.spec.tsx",
    "<rootDir>/stores/__tests__/nav-bar-store.spec.ts",
    "<rootDir>/stores/__tests__/profile-store.spec.ts",
    "<rootDir>/stores/__tests__/user-settings-store.spec.ts",
  ],
});

module.exports = async () => ({
  ...(await createConfig()),
  transformIgnorePatterns: ["node_modules/(?!(wagmi|@wagmi)/)"],
});
