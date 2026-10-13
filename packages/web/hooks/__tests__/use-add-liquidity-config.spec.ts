import { CoinPretty, Int } from "@osmosis-labs/unit";

import { makeAddLiquidityPoolData } from "~/hooks/ui-config/use-add-liquidity-config";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };

// reserve coins from the sidecar can be in a different order than the chain pool assets
const reserveCoins = [
  new CoinPretty(atom, new Int("99000000")),
  new CoinPretty(osmo, new Int("990000000")),
];

describe("makeAddLiquidityPoolData", () => {
  it("builds weighted pool data from the raw pool in chain order", () => {
    const data = makeAddLiquidityPoolData({
      id: "1",
      type: "weighted",
      reserveCoins,
      raw: {
        total_weight: "3",
        total_shares: { denom: "gamm/pool/1", amount: "100000000000000000000" },
        pool_assets: [
          { weight: "2", token: { denom: "uosmo", amount: "1000000000" } },
          { weight: "1", token: { denom: "uatom", amount: "100000000" } },
        ],
      },
    } as any);

    expect(data?.type).toBe("weighted");
    expect(data?.assets.map((a) => a.amount.currency.coinDenom)).toEqual([
      "OSMO",
      "ATOM",
    ]);
    // amounts come from the raw pool, not the reserve coins
    expect(data?.assets[0].amount.toCoin().amount).toBe("1000000000");
    expect(data?.assets[0].weight?.toString()).toBe("2");
    expect(data?.totalWeight?.toString()).toBe("3");
    expect(data?.totalShare.currency.coinMinimalDenom).toBe("gamm/pool/1");
    expect(data?.totalShare.currency.coinDecimals).toBe(18);
    expect(data?.totalShare.toDec().toString()).toBe("100.000000000000000000");
  });

  it("builds stable pool data with scaling factors", () => {
    const data = makeAddLiquidityPoolData({
      id: "2",
      type: "stable",
      reserveCoins,
      raw: {
        total_shares: { denom: "gamm/pool/2", amount: "5000000000000000000" },
        pool_liquidity: [
          { denom: "uatom", amount: "100000000" },
          { denom: "uosmo", amount: "200000000" },
        ],
        scaling_factors: ["100", "1000"],
        scaling_factor_controller: "osmo1ctrl",
      },
    } as any);

    expect(data?.assets.map((a) => a.amount.currency.coinDenom)).toEqual([
      "ATOM",
      "OSMO",
    ]);
    expect(data?.assets[0].weight).toBeUndefined();
    expect(data?.stableSwapInfo).toEqual({
      scalingFactorController: "osmo1ctrl",
      scalingFactor: ["100", "1000"],
    });
  });

  it("returns undefined for non share pools", () => {
    expect(
      makeAddLiquidityPoolData({
        id: "3",
        type: "concentrated",
        reserveCoins,
        raw: {},
      } as any)
    ).toBeUndefined();
  });

  it("returns undefined when a pool asset has no known currency", () => {
    expect(
      makeAddLiquidityPoolData({
        id: "4",
        type: "stable",
        reserveCoins,
        raw: {
          total_shares: { denom: "gamm/pool/4", amount: "1" },
          pool_liquidity: [{ denom: "uunknown", amount: "1" }],
          scaling_factors: ["1"],
          scaling_factor_controller: "",
        },
      } as any)
    ).toBeUndefined();
  });
});
