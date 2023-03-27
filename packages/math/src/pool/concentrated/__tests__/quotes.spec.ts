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
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(5004);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
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
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(4993);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("66808388");
  });
  // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L115
  //  Two equal price ranges
  //
  //          5000
  //  4545 -----|----- 5500
  //  4545 -----|----- 5500
  it("matches chain code - two positions within one tick: usdc -> eth", () => {
    const tokenIn = new Coin("usdc", "42000000");
    const tokenDenom0 = "eth";
    const poolLiquidity = new Dec("3035764687.503020836176699298");
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
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(4993);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("8398");
  });
  // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L138
  //  Two equal price ranges
  //
  //          5000
  //  4545 -----|----- 5500
  //  4545 -----|----- 5500
  it("matches chain code - two positions within one tick: eth -> usdc", () => {
    const tokenIn = new Coin("eth", "13370");
    const tokenDenom0 = "eth";
    const poolLiquidity = new Dec("3035764687.503020836176699298");
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
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(4993);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("66829187");
  });
  // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L167
  //  Consecutive price ranges
  //          5000
  //  4545 -----|----- 5500
  //             5500 ----------- 6250
  it("matches chain code - two positions with consecutive price ranges: usdc -> eth", () => {
    const tokenIn = new Coin("usdc", "10000000000");
    const tokenDenom0 = "eth";
    const poolLiquidity = new Dec("1517882343.751510418088349649");
    // found by printing liquidity net values to console with go test
    const inittedTicks = [
      {
        tickIndex: new Int(315000),
        netLiquidity: new Dec("-320114898.796002294865348513"),
      },
      {
        tickIndex: new Int(322500),
        netLiquidity: new Dec("-1197767444.955508123223001136"),
      },
    ];
    const curSqrtPrice = new Dec("70.710678118654752440");
    const precisionFactorAtPriceOne = -4;
    const swapFee = new Dec("0");
    const priceLimit = new Dec(6255);
    const result = calcOutGivenIn({
      tokenIn,
      tokenDenom0,
      poolLiquidity,
      inittedTicks,
      curSqrtPrice,
      precisionFactorAtPriceOne,
      swapFee,
      priceLimit,
    });
    expect(result.toString()).toEqual("1820630");
  });
});
