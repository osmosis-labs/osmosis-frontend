const { swcTransform } = require("../../jest.swc");

module.exports = {
  roots: ["<rootDir>/src/"],
  testMatch: ["**/__tests__/?(*.)+(spec|test).[jt]s?(x)"],
  testTimeout: 100000,
  transform: swcTransform,
};
