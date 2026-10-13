import * as OsmosisMath from "@osmosis-labs/math";
import { CoinPretty, Dec, DecUtils, Int } from "@osmosis-labs/unit";

import {
  getJoinPoolTokenInMaxs,
  getJoinSwapShareOutMinAmount,
  JoinPoolData,
} from "../osmosis/join-pool";

const SHARE_DECIMALS = 18;

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const wbtc = { coinDenom: "WBTC", coinMinimalDenom: "wbtc", coinDecimals: 8 };
const dai = { coinDenom: "DAI", coinMinimalDenom: "dai", coinDecimals: 18 };
const shareCurrency = {
  coinDenom: "GAMM/1",
  coinMinimalDenom: "gamm/pool/1",
  coinDecimals: SHARE_DECIMALS,
};

const rawAssets = [
  { currency: osmo, amount: "1234567891", weight: "3" },
  { currency: wbtc, amount: "98765432", weight: "2" },
  { currency: dai, amount: "5000000000000000000000", weight: "5" },
];
const rawTotalShare = "123456789012345678901";
const swapFee = new Dec("0.003");

const pool: JoinPoolData = {
  totalShare: new CoinPretty(shareCurrency, new Int(rawTotalShare)),
  swapFee,
  totalWeight: new Int(10),
  assets: rawAssets.map(({ currency, amount, weight }) => ({
    amount: new CoinPretty(currency, new Int(amount)),
    weight: new Int(weight),
  })),
};

/** The computation `sendJoinPoolMsg` did inline before, fed with the old query store shapes. */
function referenceTokenInMaxs(shareOutAmount: string, maxSlippage: string) {
  const maxSlippageDec = new Dec(maxSlippage).quo(
    DecUtils.getTenExponentNInPrecisionRange(2)
  );
  const estimated = OsmosisMath.estimateJoinSwap(
    { totalShare: new Int(rawTotalShare) },
    rawAssets.map(({ currency, amount }) => ({
      denom: currency.coinMinimalDenom,
      amount: new Int(amount),
    })),
    (coin) =>
      new CoinPretty(
        rawAssets.find((a) => a.currency.coinMinimalDenom === coin.denom)!
          .currency,
        coin.amount
      ),
    shareOutAmount,
    SHARE_DECIMALS
  );

  return maxSlippageDec.equals(new Dec(0))
    ? []
    : estimated.tokenIns.map((tokenIn) => {
        const dec = tokenIn.toDec();
        const amount = dec
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              tokenIn.currency.coinDecimals
            )
          )
          .mul(new Dec(1).add(maxSlippageDec))
          .truncate();

        return {
          denom: tokenIn.currency.coinMinimalDenom,
          amount: amount.toString(),
        };
      });
}

/** The computation `sendJoinSwapExternAmountInMsg` did inline before. */
function referenceShareOutMin(
  tokenIn: { currency: typeof osmo; amount: string },
  maxSlippage: string
) {
  const asset = rawAssets.find(
    (a) => a.currency.coinMinimalDenom === tokenIn.currency.coinMinimalDenom
  )!;
  const estimated = OsmosisMath.estimateJoinSwapExternAmountIn(
    { amount: new Int(asset.amount), weight: new Int(asset.weight) },
    {
      totalShare: new Int(rawTotalShare),
      totalWeight: new Int(10),
      swapFee,
    },
    tokenIn,
    SHARE_DECIMALS
  );

  const outRatio = new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100)));
  return estimated.shareOutAmountRaw.toDec().mul(outRatio).truncate();
}

describe("getJoinPoolTokenInMaxs", () => {
  it.each([
    ["1", "2.5"],
    ["0.123456789", "2.5"],
    ["7.5", "0.1"],
    ["0.000001", "15"],
  ])(
    "matches the previous computation for %s shares at %s%%",
    (shares, slip) => {
      const actual = getJoinPoolTokenInMaxs(pool, shares, slip, SHARE_DECIMALS);

      expect(actual).toEqual(referenceTokenInMaxs(shares, slip));
      expect(actual.map((a) => a.denom)).toEqual(["uosmo", "wbtc", "dai"]);
    }
  );

  it("returns no maxes with zero slippage", () => {
    expect(getJoinPoolTokenInMaxs(pool, "1", "0", SHARE_DECIMALS)).toEqual([]);
  });
});

describe("getJoinSwapShareOutMinAmount", () => {
  it.each([
    [osmo, "10.5", "2.5"],
    [wbtc, "0.01", "2.5"],
    [dai, "100", "0.5"],
    [osmo, "1", "0"],
  ])(
    "matches the previous computation for %p in %s at %s%%",
    (currency, amount, slip) => {
      const tokenIn = { currency, amount };

      expect(
        getJoinSwapShareOutMinAmount(
          pool,
          tokenIn,
          slip,
          SHARE_DECIMALS
        ).toString()
      ).toBe(referenceShareOutMin(tokenIn, slip).toString());
    }
  );

  it("throws for pools without weights or unknown assets", () => {
    const tokenIn = { currency: osmo, amount: "1" };
    expect(() =>
      getJoinSwapShareOutMinAmount(
        { ...pool, totalWeight: undefined },
        tokenIn,
        "2.5",
        SHARE_DECIMALS
      )
    ).toThrow("Must be weighted pool");
    expect(() =>
      getJoinSwapShareOutMinAmount(
        pool,
        { currency: { ...osmo, coinMinimalDenom: "unknown" }, amount: "1" },
        "2.5",
        SHARE_DECIMALS
      )
    ).toThrow("Pool doesn't have the pool asset");
    expect(() =>
      getJoinSwapShareOutMinAmount(
        {
          ...pool,
          assets: pool.assets.map(({ amount }) => ({ amount })),
        },
        tokenIn,
        "2.5",
        SHARE_DECIMALS
      )
    ).toThrow("Pool asset not weighted");
  });
});
