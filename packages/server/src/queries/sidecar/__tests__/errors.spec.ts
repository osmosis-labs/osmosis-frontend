import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "../errors";

describe("sidecar router errors", () => {
  it("keeps default messages that the swap UI matches on", () => {
    expect(NoRouteError.defaultMessage).toBe("No route found");
    expect(NotEnoughLiquidityError.defaultMessage).toBe("Not enough liquidity");
    expect(NotEnoughQuotedError.defaultMessage).toBe(
      "Not enough quoted. Try increasing amount."
    );
  });
});
