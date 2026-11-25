const { swcTransform } = require("../../jest.swc");

module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: swcTransform,
};
