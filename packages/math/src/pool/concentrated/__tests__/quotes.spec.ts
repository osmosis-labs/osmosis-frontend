import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { ConcentratedLiquidityMath } from "../quotes";
const { calcOutGivenIn } = ConcentratedLiquidityMath;

describe("calcOutGivenIn matches chain code", () => {
  describe("without fees, base case", () => {
    // eth is denom0
    // https://github.com/osmosis-labs/osmosis/blob/2be30828d8c8a818652a15c3c19ae27b4c123c60/x/concentrated-liquidity/swaps_test.go#L63
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "42000000");
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
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("8396");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L92
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: eth -> usdc", () => {
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
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("66808388");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L115
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("two positions within one tick: usdc -> eth", () => {
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
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("8398");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L138
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("two positions within one tick: eth -> usdc", () => {
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
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("66829187");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L167
    //  Consecutive price ranges
    //          5000
    //  4545 -----|----- 5500
    //             5500 ----------- 6250
    it("two positions with consecutive price ranges: usdc -> eth", () => {
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
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("1820630");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L206
    //  Consecutive price ranges
    //          5000
    //  4545 -----|----- 5500
    //             5500 ----------- 6250
    it("two positions with consecutive price ranges: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("319146854.1542601224183902529"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("1198735489.597250295669959397"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("9103422788");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L241
    ///  Partially overlapping price ranges
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("two positions with partially overlapping price ranges: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(310010),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(322500),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("1864161");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L273
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "8500000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(310010),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(322500),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("1609138");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L309
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("two positions with partially overlapping price ranges: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(309990),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("9321276930");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L339
    //          		5000
    //  		4545 -----|----- 5500
    //  4000 ---------- 4999s
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "1800000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(309990),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("8479320318");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L372
    //          5000
    //  4545 -----|----- 5500
    //              5501 ----------- 6250
    it("two sequential positions with a gap: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(315010),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
        {
          tickIndex: new Int(322500),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("1820545");
    });
    // skipping price limit / slippage test, since we're generating the price limit for the chain to use
  });

  describe("with fees", () => {
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L429
    //          5000
    //  4545 -----|----- 5500
    it("fee 1 - single position within one tick: usdc -> eth (1% fee)", () => {
      const tokenIn = new Coin("usdc", "42000000");
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
      const swapFee = new Dec("0.01");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("8312");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L453
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("fee 2 - two positions within one tick: eth -> usdc (3% fee)", () => {
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
      const swapFee = new Dec("0.03");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("64824917");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L481
    //          		   5000
    //  		   4545 -----|----- 5500
    //  4000 ----------- 4545
    it("fee 3 - two positions with consecutive price ranges: eth -> usdc (5% fee)", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("319146854.1542601224183902529"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("1198735489.597250295669959397"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.05");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("8691708221");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L505
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("fee 4 - two positions with partially overlapping price ranges: usdc -> eth (10% fee)", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(310010),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(322500),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.1");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("1695807");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L528
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("fee 5 - two positions with partially overlapping price ranges, not utilizing full liquidity of second position: eth -> usdc (0.5% fee)", () => {
      const tokenIn = new Coin("eth", "1800000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(309990),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.005");
      const { amountOut } = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      expect(amountOut.toString()).toEqual("9321276930");
    });
  });
});
