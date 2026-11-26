import {
  getRouteTokenInGivenOutParams,
  getRouteTokenOutGivenInParams,
} from "../swap";

const denoms = { tokenInDenom: "uosmo", tokenOutDenom: "uion" };

describe("swap route params", () => {
  it.each(["0", "1", "100000", "123456789012345678901234567890"])(
    "accepts base-unit integer amount %p",
    (amount) => {
      expect(
        getRouteTokenOutGivenInParams.safeParse({
          ...denoms,
          tokenInAmount: amount,
        }).success
      ).toBe(true);
      expect(
        getRouteTokenInGivenOutParams.safeParse({
          ...denoms,
          tokenOutAmount: amount,
        }).success
      ).toBe(true);
    }
  );

  // These used to pass validation and throw in `new Int`, returning a 500.
  it.each([undefined, "", "1.5", "-1", " 1", "1e6", "abc"])(
    "rejects amount %p as bad input",
    (amount) => {
      expect(
        getRouteTokenOutGivenInParams.safeParse({
          ...denoms,
          tokenInAmount: amount,
        }).success
      ).toBe(false);
      expect(
        getRouteTokenInGivenOutParams.safeParse({
          ...denoms,
          tokenOutAmount: amount,
        }).success
      ).toBe(false);
    }
  );
});
