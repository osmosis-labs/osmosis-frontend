import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { ConcentratedLiquidityMath } from "../quotes";
const { calcOutGivenIn } = ConcentratedLiquidityMath;

describe("calcOutGivenIn", () => {
  // eth is denom0
  // https://github.com/osmosis-labs/osmosis/blob/2be30828d8c8a818652a15c3c19ae27b4c123c60/x/concentrated-liquidity/swaps_test.go#L63
  //  One price range
  //
  //          5000
  //  4545 -----|----- 5500
  it("matches chain code - single position within one tick: usdc -> eth", () => {
    const tokenIn = new Coin("uusd", "42000000");
    const tokenDenom0 = "eth";
    const poolLiquidity = new Dec("1517882343.751510418088349649");
    // found by printing liquidity net values to console with go test
    const inittedTicks = [
      {
        tickIndex: new Int(305450),
        netLiquidity: new Dec("1517882343.751510418088349649"),
      },
      {
        tickIndex: new Int(0),
        netLiquidity: new Dec("0"),
      },
      {
        tickIndex: new Int(315000),
        netLiquidity: new Dec("-1517882343.751510418088349649"),
      },
    ];
    const curTick = new Int(0);
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(5004);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curTick,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("8396");
  });
  // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L92
  //  One price range
  //
  //          5000
  //  4545 -----|----- 5500
  it("matches chain code - single position within one tick: eth -> usdc", () => {
    const tokenIn = new Coin("eth", "13370");
    const tokenDenom0 = "eth";
    const poolLiquidity = new Dec("1517882343.751510418088349649");
    // found by printing liquidity net values to console with go test
    const inittedTicks = [
      {
        tickIndex: new Int(305450),
        netLiquidity: new Dec("1517882343.751510418088349649"),
      },
      {
        tickIndex: new Int(0),
        netLiquidity: new Dec("0"),
      },
      {
        tickIndex: new Int(315000),
        netLiquidity: new Dec("-1517882343.751510418088349649"),
      },
    ];
    const curTick = new Int(0);
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(4993);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curTick,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("66808388");
  });
});
