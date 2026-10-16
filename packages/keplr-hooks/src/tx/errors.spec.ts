import * as utils from "@osmosis-labs/utils";

import * as legacy from "./errors";

describe("amount error compatibility", () => {
  it.each([
    "EmptyAmountError",
    "InsufficientAmountError",
    "InvalidNumberAmountError",
    "NegativeAmountError",
    "ZeroAmountError",
  ] as const)("preserves %s constructor identity and instanceof", (name) => {
    expect(legacy[name]).toBe(utils[name]);
    const error = new legacy[name]("example");
    expect(error).toBeInstanceOf(utils[name]);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("example");
  });
});
