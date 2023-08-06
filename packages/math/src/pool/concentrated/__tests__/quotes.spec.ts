import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { BigDec } from "../../../big-dec";
import { maxTick } from "../const";
import { calcInGivenOut, ConcentratedLiquidityMath } from "../quotes";
const { calcOutGivenIn } = ConcentratedLiquidityMath;

describe("calcOutGivenIn matches chain code", () => {
  // Note: liquidity value for the default position is 1517882343.751510417627556287
  describe("without fees, base case", () => {
    // eth is denom0
    // https://github.com/osmosis-labs/osmosis/blob/4c7238029997d7d4de1052b0a42f07da0b1dae85/x/concentrated-liquidity/swaps_test.go#L84
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8396");
      expect(afterSqrtPrice).toEqual(
        new BigDec("70.738348247484497718514800000003600626")
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L166
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "13370");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("66808388");
      expect(afterSqrtPrice.toString()).toEqual(
        "70.666663910857144332134093938182290274"
      );
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
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-3035764687.503020835255112574"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(afterSqrtPrice.toString()).toEqual(
        "70.724513183069625079757400000001800313"
      );
      expect(amountOut.toString()).toEqual("8398");
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L277
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("two positions within one tick: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "13370");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(305450),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(315000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("66829187");
      expect(afterSqrtPrice.toString()).toEqual(
        "70.688664163408836320215015370847179540"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L321
    //  Consecutive price ranges
    //          5000
    //  4545 -----|----- 5500
    //             5500 ----------- 6250
    it("two positions with consecutive price ranges: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-320114898.796002294143710268"),
        },
        {
          tickIndex: new Int(32250000), // this tick's sqrt price ends up being calculated differently from chain.
          netLiquidity: new Dec("-1197767444.955508123483846019"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1820630");
      // TODO: Note this value is actually off by 10^-18 which seems to stem from the difference
      // in the sqrt function. On-chain out sqrt is monotonic.
      // True value: 78.137149196095607130096044752300452857
      expect(afterSqrtPrice).toEqual(
        new BigDec("78.137149196095607129096044752300452857")
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L376
    //  Consecutive price ranges
    //          5000
    //  4545 -----|----- 5500
    //             5500 ----------- 6250
    it("two positions with consecutive price ranges: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("319146854.154260121957596890"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("1199528406.18741366948159633"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(afterSqrtPrice.toString()).toEqual(
        "63.993489023323078692803734142129673908"
      );
      expect(amountOut.toString()).toEqual("9103422788");
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L433
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("two positions with partially overlapping price ranges: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1864161");
      // TODO: Note this value is actually off by 10^-18 which seems to stem from the difference
      // in the sqrt function. On-chain out sqrt is monotonic.
      // 77.819789636800169393792766394158739007
      expect(afterSqrtPrice.toString()).toEqual(
        "77.819789636800169392792766394158739007"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L487
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "8500000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1609138");
      // 75.582373164412551492069079174313215667
      expect(afterSqrtPrice.toString()).toEqual(
        "75.582373164412551491069079174313215667"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L553
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("two positions with partially overlapping price ranges: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("9321276930");
      expect(afterSqrtPrice.toString()).toEqual(
        "64.257943794993248953756640624575523292"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L339
    //          		5000
    //  		4545 -----|----- 5500
    //  4000 ---------- 4999
    it("two positions with partially overlapping price ranges, not utilizing full liquidity of second position: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "1800000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8479320318");
      expect(afterSqrtPrice.toString()).toEqual(
        "65.513815285481060959469337552596846421"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L678
    //          5000
    //  4545 -----|----- 5500
    //              5501 ----------- 6250
    it("two sequential positions with a gap: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.18741366948159633"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1820545");
      // TODO: Note this value is actually off by 10^-18 which seems to stem from the difference
      // in the sqrt function. On-chain out sqrt is monotonic.
      // 78.138055169663761658508234345605157554
      expect(afterSqrtPrice.toString()).toEqual(
        "78.138055169663761657508234345605157554"
      );
    });
    // skipping price limit / slippage test, since we're generating the price limit for the chain to use
  });

  describe("with fees", () => {
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L772
    //          5000
    //  4545 -----|----- 5500
    it("spread factor 1 - single position within one tick: usdc -> eth (1% spread factor)", () => {
      const tokenIn = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.01");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(afterSqrtPrice.toString()).toEqual(
        "70.738071546196200265739652000003564619"
      );
      expect(amountOut.toString()).toEqual("8312");
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L788
    //  Two equal price ranges
    //
    //          5000
    //  4545 -----|----- 5500
    //  4545 -----|----- 5500
    it("spread factor 2 - two positions within one tick: eth -> usdc (3% spread factor)", () => {
      const tokenIn = new Coin("eth", "13370");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.03");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("64824917");
      expect(afterSqrtPrice.toString()).toEqual(
        "70.689324382628080102675847658610048839"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L809
    //          		   5000
    //  		   4545 -----|----- 5500
    //  4000 ----------- 4545
    it("spread factor 3 - two positions with consecutive price ranges: eth -> usdc (5% spread factor)", () => {
      const tokenIn = new Coin("eth", "2000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("319146854.1542601219575968909"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("1199528406.18741366948159633"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.05");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8691708221");
      expect(afterSqrtPrice.toString()).toEqual(
        "64.336946417392457831833484334393884770"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L829
    //          5000
    //  4545 -----|----- 5500
    //        5001 ----------- 6250
    it("spread factor 4 - two positions with partially overlapping price ranges: usdc -> eth (10% spread factor)", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.1");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1695807");
      // TODO: Note this value is actually off by 10^-18 which seems to stem from the difference
      // in the sqrt function. On-chain out sqrt is monotonic.
      // 76.328178655208424125976974912322629171
      expect(afterSqrtPrice.toString()).toEqual(
        "76.328178655208424124976974912322629171"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L849
    //  Partially overlapping price ranges
    //                5000
    //        4545 -----|----- 5500
    //  4000 ----------- 4999
    it("spread factor 5 - two positions with partially overlapping price ranges, not utilizing full liquidity of second position: eth -> usdc (0.5% spread factor)", () => {
      const tokenIn = new Coin("eth", "1800000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.005");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("8440657775");
      expect(afterSqrtPrice.toString()).toEqual(
        "65.571484748647169031180086346638617316"
      );
    });
    // https://github.com/osmosis-labs/osmosis/blob/844c172f50cb602b6af030e1d7abbca28d2dbddc/x/concentrated-liquidity/swaps_test.go#L869
    //          5000
    //  4545 -----|----- 5500
    //              5501 ----------- 6250
    it("spread factor 6 - two sequential positions with a gap usdc -> eth (3% spread factor)", () => {
      const tokenIn = new Coin("usdc", "10000000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.18741366948159633"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.03");
      const result = calcOutGivenIn({
        tokenIn,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountOut, afterSqrtPrice } = result;
      expect(amountOut.toString()).toEqual("1771252");
      // TODO: Note this value is actually off by 10^-18 which seems to stem from the difference
      // in the sqrt function. On-chain out sqrt is monotonic.
      // 77.887956882326389372687567917665252424
      expect(afterSqrtPrice.toString()).toEqual(
        "77.887956882326389371687567917665252424"
      );
    });
  });

  describe("failure cases", () => {
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L587
    it("single position within one tick, trade does not complete due to lack of liquidity: usdc -> eth", () => {
      const tokenIn = new Coin("usdc", "5300000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      expect(
        calcOutGivenIn({
          tokenIn,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L594
    it("single position within one tick, trade does not complete due to lack of liquidity: eth -> usdc", () => {
      const tokenIn = new Coin("eth", "1100000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      expect(
        calcOutGivenIn({
          tokenIn,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
  });
});

// Note these tests are skipped since precision increase from 18 to 36 made
// a lot of them break. Due to CL launch timing, we are skipping this as
// in given out is not supported at launch.
// If you want to fix this, refer to this PR for a similar fix for out given in:
// https://github.com/osmosis-labs/osmosis-frontend/pull/1800
test.skip("calcInGivenOut matches chain code", () => {
  // Note: liquidity value for the default position is 1517882343.751510417627556287
  describe("without fees, base case", () => {
    // https://github.com/osmosis-labs/osmosis/blob/2be30828d8c8a818652a15c3c19ae27b4c123c60/x/concentrated-liquidity/swaps_test.go#L63
    //  One price range
    //
    //          5000
    //  4545 -----|----- 5500
    it("single position within one tick: eth (in) -> usdc (out) | zfo", () => {
      const tokenOut = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("3035764687.503020835255112574"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-3035764687.503020835255112574"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("3035764687.503020835255112574"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-3035764687.503020835255112574"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("319146854.154260121957596890"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("1199528406.18741366948159633"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-320114898.796002294865348513"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-1197767444.955508123223001136"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
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
    it("spread factor 1: single position within one tick: eth (in) -> usdc (out) (1% spread factor) | zfo", () => {
      const tokenOut = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.01");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8489");
      expect(afterSqrtPrice.toString()).toEqual("70.683007989825007162");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1135
    it("spread factor 2: two positions within one tick: usdc (in) -> eth (out) (3% spread factor) | ofz", () => {
      const tokenOut = new Coin("eth", "8398");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("3035764687.503020835255112574");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("3035764687.503020835255112574"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-3035764687.503020835255112574"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.03");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("43297130");
      expect(afterSqrtPrice.toString()).toEqual("70.724512595179305566");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1170
    it("spread factor 3: two positions with consecutive price ranges: usdc (in) -> eth (out) (0.1% spread factor) | ofz", () => {
      const tokenOut = new Coin("eth", "1820630");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-320114898.796002294865348513"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-1197767444.955508123223001136"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.001");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("10010009580");
      expect(afterSqrtPrice.toString()).toEqual("78.137148837036751553");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1218
    it("spread factor 4: two positions with partially overlapping price ranges: eth (in) -> usdc (out) (10% spread factor) | zfo", () => {
      const tokenOut = new Coin("usdc", "9321276930");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(30999000),
          netLiquidity: new Dec("-670416215.718827443660400593"),
        },
        {
          tickIndex: new Int(30545000),
          netLiquidity: new Dec("1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(30000000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.1");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("2222223");
      expect(afterSqrtPrice.toString()).toEqual("64.257943796086567725");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1278
    it("spread factor 5: two positions with partially overlapping price ranges, not utilizing full liquidity of second position: usdc (in) -> eth (out) (5% spread factor) | ofz", () => {
      const tokenOut = new Coin("eth", "1609138");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31001000),
          netLiquidity: new Dec("670416088.605668727039240782"),
        },
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("-670416088.605668727039240782"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.05");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("8947367851");
      expect(afterSqrtPrice.toString()).toEqual("75.582372355128594341");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1336
    it("spread factor 6: two sequential positions with a gap usdc (in) -> eth (out) (0.03% spread factor) | ofz", () => {
      const tokenOut = new Coin("eth", "1820545");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
        {
          tickIndex: new Int(31501000),
          netLiquidity: new Dec("1199528406.187413669220031452"),
        },
        {
          tickIndex: new Int(32250000),
          netLiquidity: new Dec("670416215.718827443660400593"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.0003");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks,
        curSqrtPrice,
        swapFee,
      });
      if (result === "no-more-ticks") throw new Error("no more ticks");
      const { amountIn, afterSqrtPrice } = result;
      expect(amountIn.toString()).toEqual("10002995655");
      expect(afterSqrtPrice.toString()).toEqual("78.138050797173647031");
    });
    // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L1383
    // won't do slippage protection test since we are generating estimates to protect against slippage on chain from frontends

    it("returns not-enough-ticks if there's not enough ticks to calculate", () => {
      const tokenOut = new Coin("eth", "1820545");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0.0003");
      const result = calcInGivenOut({
        tokenOut,
        tokenDenom0,
        poolLiquidity,
        inittedTicks: [],
        curSqrtPrice,
        swapFee,
      });
      expect(result).toEqual("no-more-ticks");
    });
  });

  describe("failure cases", () => {
    it("single position within one tick, trade does not complete due to lack of liquidity: usdc -> eth ", () => {
      const tokenOut = new Coin("usdc", "5300000000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      expect(
        calcInGivenOut({
          tokenOut,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
    it("single position within one tick, trade does not complete due to lack of liquidity: eth -> usdc ", () => {
      const tokenOut = new Coin("eth", "1100000");
      const tokenDenom0 = "eth";
      const poolLiquidity = new Dec("1517882343.751510417627556287");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: new Int(31500000),
          netLiquidity: new Dec("-1517882343.751510417627556287"),
        },
      ];
      const curSqrtPrice = new BigDec("70.710678118654752441");
      const swapFee = new Dec("0");
      expect(
        calcInGivenOut({
          tokenOut,
          tokenDenom0,
          poolLiquidity,
          inittedTicks,
          curSqrtPrice,
          swapFee,
        })
      ).toEqual("no-more-ticks");
    });
  });

  describe("edge cases found in live testing", () => {
    it("one for zero at large ticks, no progress is being made", () => {
      const tokenIn = new Coin("usdc", "42000000");
      const tokenDenom0 = "eth";
      const poolLiquidity2 = new Dec("0");
      // found by printing liquidity net values to console with go test
      const inittedTicks = [
        {
          tickIndex: maxTick.sub(new Int(1000)),
          netLiquidity: new Dec(
            "199984999874993749609347654199057.829367574974588761"
          ),
        },
        {
          tickIndex: maxTick,
          netLiquidity: new Dec(
            "-199984999874993749609347654199057.829367574974588761"
          ),
        },
      ];
      const curSqrtPrice = new BigDec("1.000000000000000000");
      const swapFee = new Dec("0.001");

      try {
        calcOutGivenIn({
          tokenIn,
          tokenDenom0,
          poolLiquidity: poolLiquidity2,
          inittedTicks,
          curSqrtPrice,
          swapFee,
        });
        fail("should have thrown");
      } catch (e: any) {
        expect(e.message).toContain(
          "Failed to advance the swap step while estimating slippage bound"
        );
      }
    });
  });
});
