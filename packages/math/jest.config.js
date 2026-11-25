const { swcTransform } = require("../../jest.swc");

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  transform: swcTransform,
};
