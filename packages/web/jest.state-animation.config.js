const nextJest = require("next/jest");

// Dependency lifecycle tests do not need the app's MSW/tRPC setup or built
// workspace packages. Keep the same Next/SWC transform and DOM environment.
module.exports = nextJest({ dir: "./" })({
  testEnvironment: "../../jsdom-extended.js",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: [
    "<rootDir>/stores/__tests__/mobx-react-lite.spec.tsx",
    "<rootDir>/components/animation/__tests__/dynamic-lottie-animation.spec.tsx",
  ],
});
