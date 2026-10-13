import { makePoolFromChainPool } from "@osmosis-labs/server";
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

  it("falls back to minimal currencies when reserve coins are empty (testnet)", () => {
    const data = makeAddLiquidityPoolData({
      id: "5",
      type: "weighted",
      reserveCoins: [],
      raw: {
        total_weight: "2",
        pool_params: { swap_fee: "0.003" },
        total_shares: { denom: "gamm/pool/5", amount: "100" },
        pool_assets: [
          { weight: "1", token: { denom: "uosmo", amount: "1000" } },
          { weight: "1", token: { denom: "ibc/ABC", amount: "2000" } },
        ],
      },
    } as any);

    expect(data?.assets.map((a) => a.amount.currency.coinMinimalDenom)).toEqual(
      ["uosmo", "ibc/ABC"]
    );
    expect(data?.assets[1].amount.currency.coinDecimals).toBe(6);
    expect(data?.swapFee.toString()).toBe("0.003000000000000000");
  });

  it("works on pools built by the real chain pool mapping", () => {
    const chainPool = {
      "@type": "/osmosis.gamm.v1beta1.Pool",
      id: "6",
      pool_params: {
        swap_fee: "0.002",
        exit_fee: "0",
        smooth_weight_change_params: null,
      },
      total_weight: "2",
      total_shares: { denom: "gamm/pool/6", amount: "100000000000000000000" },
      pool_assets: [
        { weight: "1", token: { denom: "uosmo", amount: "1000000000" } },
        { weight: "1", token: { denom: "ibc/XYZ", amount: "2000000000" } },
      ],
    };
    const pool = makePoolFromChainPool({
      chainPool: chainPool as any,
      assetLists: [],
    });

    const data = pool && makeAddLiquidityPoolData(pool);

    expect(data?.type).toBe("weighted");
    expect(data?.assets.map((a) => a.amount.toCoin().amount)).toEqual([
      "1000000000",
      "2000000000",
    ]);
    expect(data?.totalWeight?.toString()).toBe("2");
    expect(data?.swapFee.toString()).toBe("0.002000000000000000");
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
});
