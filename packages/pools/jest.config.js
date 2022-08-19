module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
};
