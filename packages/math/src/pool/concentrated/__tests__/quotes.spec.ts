import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { calcInGivenOut, ConcentratedLiquidityMath } from "../quotes";
const { calcOutGivenIn } = ConcentratedLiquidityMath;

describe("calcOutGivenIn matches chain code", () => {
  // Note: liquidity value for the default position is 1517882343.751510418088349649
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8396");
      expect(afterSqrtPrice.toString()).toEqual("70.738348247484497717");
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("66808388");
      expect(afterSqrtPrice.toString()).toEqual("70.666663910857144332");
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8398");
      expect(afterSqrtPrice.toString()).toEqual("70.724513183069625078");
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("66829187");
      expect(afterSqrtPrice.toString()).toEqual("70.688664163408836320");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1820630");
      expect(afterSqrtPrice.toString()).toEqual("78.137149196095607129");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("9103422788");
      expect(afterSqrtPrice.toString()).toEqual("63.993489023323078693");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1864161");
      expect(afterSqrtPrice.toString()).toEqual("77.819789636800169392");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1609138");
      expect(afterSqrtPrice.toString()).toEqual("75.582373164412551491");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("9321276930");
      expect(afterSqrtPrice.toString()).toEqual("64.257943794993248954");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L339
    //          		5000
    //  		4545 -----|----- 5500
    //  4000 ---------- 4999
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8479320318");
      expect(afterSqrtPrice.toString()).toEqual("65.513815285481060960");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1820545");
      expect(afterSqrtPrice.toString()).toEqual("78.138055169663761658");
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.01");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8312");
      expect(afterSqrtPrice.toString()).toEqual("70.738071546196200264");
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
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.03");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("64824917");
      expect(afterSqrtPrice.toString()).toEqual("70.689324382628080102");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8691708221");
      expect(afterSqrtPrice.toString()).toEqual("64.336946417392457832");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1695807");
      expect(afterSqrtPrice.toString()).toEqual("76.328178655208424124");
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
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8440657775");
      expect(afterSqrtPrice.toString()).toEqual("65.571484748647169032");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L548
    //          5000
    //  4545 -----|----- 5500
    //              5501 ----------- 6250
    it("fee 6 - two sequential positions with a gap usdc -> eth (3% fee)", () => {
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
      const swapFee = new Dec("0.03");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1771252");
      expect(afterSqrtPrice.toString()).toEqual("77.887956882326389372");
    });
  });

  describe("failure cases", () => {
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L587
    it("single position within one tick, trade does not complete due to lack of liquidity: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "5300000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      expect(
        calcOutGivenIn({
          tokenIn,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          precisionFactorAtPriceOne,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L594
    it("single position within one tick, trade does not complete due to lack of liquidity: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "1100000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      expect(
        calcOutGivenIn({
          tokenIn,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          precisionFactorAtPriceOne,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
  });
});

describe("calcInGivenOut matches chain code", () => {
  // Note: liquidity value for the default position is 1517882343.751510418088349649
  describe("without fees, base case", () => {
    // https://github.com/osmosis-labs/osmosis/blob/2be30828d8c8a818652a15c3c19ae27b4c123c60/x/concentrated-liquidity/swaps_test.go#L63
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8404");
      expect(afterSqrtPrice.toString()).toEqual("70.683007989825007162");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L630
    it("single position within one tick: usdc (in) -> eth (out) ofz", () => {
      const tokenOut = new Coin("eth", "13370");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("66891663");
      expect(afterSqrtPrice.toString()).toEqual("70.754747188468900467");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L656
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("two positions within one tick: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "66829187");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020836176699298");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("3035764687.503020836176699298"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-3035764687.503020836176699298"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("13370");
      expect(afterSqrtPrice.toString()).toEqual("70.688664163727643650");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L682
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("two positions within one tick: usdc (in) -> eth (out) | ofz", () => {
      const tokenOut = new Coin("eth", "8398");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020836176699298");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("3035764687.503020836176699298"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-3035764687.503020836176699298"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("41998216");
      expect(afterSqrtPrice.toString()).toEqual("70.724512595179305566");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L713
    //  Consecutive price ranges
    //
    //                     5000
    //             4545 -----|----- 5500
    //  4000 ----------- 4545
    it("two positions with consecutive price ranges: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "9103422788");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("319146854.154260122418390252"),
        },
        {
          tickIndex: new Int(300000),
          netLiquidity: new Dec("1198735489.597250295669959397"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("2000000");
      expect(afterSqrtPrice.toString()).toEqual("63.993489023888951975");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L761
    //  Consecutive price ranges
    //          5000
    //  4545 -----|----- 5500
    //             5500 ----------- 6250
    it("two positions with consecutive price ranges: usdc (in) -> eth (out) | ofz", () => {
      const tokenOut = new Coin("eth", "1820630");
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
        {
          tickIndex: new Int(315010),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("9999999570");
      expect(afterSqrtPrice.toString()).toEqual("78.137148837036751553");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L809
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("two positions with partially overlapping price ranges: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "9321276930");
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
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("2000000");
      expect(afterSqrtPrice.toString()).toEqual("64.257943796086567725");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L809
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "8479320318");
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
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("1800000");
      expect(afterSqrtPrice.toString()).toEqual("65.513815286452064191");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L925
    //  Partially overlapping price ranges
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("two positions with partially overlapping price ranges: usdc (in) -> eth (out) | ofz", () => {
      const tokenOut = new Coin("eth", "1864161");
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
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("9999994688");
      expect(afterSqrtPrice.toString()).toEqual("77.819781711876553576");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L976
    //  Partially overlapping price ranges
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: usdc (in) -> eth (out) | ofz", () => {
      const tokenOut = new Coin("eth", "1609138");
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
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8499999458");
      expect(afterSqrtPrice.toString()).toEqual("75.582372355128594341");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1032
    //  Sequential price ranges with a gap
    //          5000
    //  4545 -----|----- 5500
    //              5501 ----------- 6250
    it("two sequential positions with a gap usdc (in) -> eth (out) | ofz", () => {
      const tokenOut = new Coin("eth", "1820545");
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
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("9999994756");
      expect(afterSqrtPrice.toString()).toEqual("78.138050797173647031");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1076
    // won't do slippage protection test since we are generating estimates to protect against slippage on chain from frontends
  });

  describe("with fees", () => {
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1105
    it("fee 1: single position within one tick: eth (in) -> usdc (out) (1% fee) | zfo", () => {
      const tokenOut = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510418088349649"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.01");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8489");
      expect(afterSqrtPrice.toString()).toEqual("70.683007989825007162");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1135
    it("fee 2: two positions within one tick: usdc (in) -> eth (out) (3% fee) | ofz", () => {
      const tokenOut = new Coin("eth", "8398");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020836176699298");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("3035764687.503020836176699298"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-3035764687.503020836176699298"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.03");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("43297130");
      expect(afterSqrtPrice.toString()).toEqual("70.724512595179305566");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1170
    it("fee 3: two positions with consecutive price ranges: usdc (in) -> eth (out) (0.1% fee) | ofz", () => {
      const tokenOut = new Coin("eth", "1820630");
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
        {
          tickIndex: new Int(315010),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0.001");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("10010009580");
      expect(afterSqrtPrice.toString()).toEqual("78.137148837036751553");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1218
    it("fee 4: two positions with partially overlapping price ranges: eth (in) -> usdc (out) (10% fee) | zfo", () => {
      const tokenOut = new Coin("usdc", "9321276930");
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
      const swapFee = new Dec("0.1");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("2222223");
      expect(afterSqrtPrice.toString()).toEqual("64.257943796086567725");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1278
    it("fee 5: two positions with partially overlapping price ranges, not utilizing full liquidity of second position: usdc (in) -> eth (out) (5% fee) | ofz", () => {
      const tokenOut = new Coin("eth", "1609138");
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
      const swapFee = new Dec("0.05");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8947367851");
      expect(afterSqrtPrice.toString()).toEqual("75.582372355128594341");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1336
    it("fee 6: two sequential positions with a gap usdc (in) -> eth (out) (0.03% fee) | ofz", () => {
      const tokenOut = new Coin("eth", "1820545");
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
      const swapFee = new Dec("0.0003");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        precisionFactorAtPriceOne,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("10002995655");
      expect(afterSqrtPrice.toString()).toEqual("78.138050797173647031");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1383
    // won't do slippage protection test since we are generating estimates to protect against slippage on chain from frontends
  });

  describe("failure cases", () => {
    it("single position within one tick, trade does not complete due to lack of liquidity: usdc -> eth ", () => {
      const tokenOut = new Coin("usdc", "5300000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      expect(
        calcInGivenOut({
          tokenOut,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          precisionFactorAtPriceOne,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
    it("single position within one tick, trade does not complete due to lack of liquidity: eth -> usdc ", () => {
      const tokenOut = new Coin("eth", "1100000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510418088349649");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510418088349649"),
        },
      ];
      const curSqrtPrice = new Dec("70.710678118654752440");
      const precisionFactorAtPriceOne = -4;
      const swapFee = new Dec("0");
      expect(
        calcInGivenOut({
          tokenOut,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          precisionFactorAtPriceOne,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
  });
});
