import { makePoolFromChainPool } from "@osmosis-labs/server";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { CoinPretty, Int } from "@osmosis-labs/unit";

import {
  makeAddLiquidityPoolData,
  sendAddLiquidity,
} from "~/hooks/ui-config/use-add-liquidity-config";

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
        pool_params: { swap_fee: "0.003" },
        total_shares: { denom: "gamm/pool/1", amount: "100000000000000000000" },
        pool_assets: [
          { weight: "2", token: { denom: "uosmo", amount: "1000000000" } },
          { weight: "1", token: { denom: "uatom", amount: "100000000" } },
        ],
      },
    } as any);

    expect(data?.type).toBe("weighted");
    expect(data?.id).toBe("1");
    expect(data?.hasGuessedCurrency).toBe(false);
    expect(data?.swapFee.toString()).toBe("0.003000000000000000");
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
        pool_params: { swap_fee: "0.0001" },
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
    expect(data?.hasGuessedCurrency).toBe(true);
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

  it("returns undefined instead of assuming a zero fee when swap fee is missing", () => {
    expect(
      makeAddLiquidityPoolData({
        id: "7",
        type: "weighted",
        reserveCoins,
        raw: {
          total_weight: "1",
          total_shares: { denom: "gamm/pool/7", amount: "1" },
          pool_assets: [
            { weight: "1", token: { denom: "uosmo", amount: "1" } },
          ],
        },
      } as any)
    ).toBeUndefined();
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

describe("sendAddLiquidity", () => {
  const rawPool = (osmoAmount: string) =>
    ({
      id: "1",
      type: "weighted",
      reserveCoins,
      raw: {
        total_weight: "2",
        pool_params: { swap_fee: "0.003" },
        total_shares: { denom: "gamm/pool/1", amount: "100000000000000000000" },
        pool_assets: [
          { weight: "1", token: { denom: "uosmo", amount: osmoAmount } },
          { weight: "1", token: { denom: "uatom", amount: "100000000" } },
        ],
      },
    }) as any;

  function makeConfig(isSingle: boolean) {
    const seeded = makeAddLiquidityPoolData(rawPool("1000000000"))!;
    const config = new ObservableAddLiquidityConfig("1", "osmo1sender");
    config.setPool(seeded);
    config.setBalances([
      { denom: "uosmo", amount: "500000000" },
      { denom: "uatom", amount: "50000000" },
    ]);
    if (isSingle) {
      config.setIsSingleAmountIn(true);
      config.singleAmountInConfig?.setAmount("10");
    } else {
      config.setAmountAt(0, "10");
    }
    return config;
  }

  it("builds a balanced join from freshly fetched pool data, not the seeded config", async () => {
    const config = makeConfig(false);
    const osmosis = {
      sendJoinPoolMsg: jest.fn().mockResolvedValue(undefined),
      sendJoinSwapExternAmountInMsg: jest.fn(),
    };
    const onFulfill = jest.fn();

    await sendAddLiquidity({
      config,
      osmosis,
      fetchPool: async () => rawPool("2000000000"),
      onFulfill,
    });

    expect(osmosis.sendJoinPoolMsg).toHaveBeenCalledTimes(1);
    const [poolId, pool, shareOut] = osmosis.sendJoinPoolMsg.mock.calls[0];
    expect(poolId).toBe("1");
    expect(pool.assets[0].amount.toCoin().amount).toBe("2000000000");
    expect(config.pool?.assets[0].amount.toCoin().amount).toBe("1000000000");
    // the user's estimate is kept
    expect(shareOut).toBe("1.000000000000000000");
  });

  it("builds a single asset join from freshly fetched pool data", async () => {
    const config = makeConfig(true);
    const osmosis = {
      sendJoinPoolMsg: jest.fn(),
      sendJoinSwapExternAmountInMsg: jest.fn().mockResolvedValue(undefined),
    };

    await sendAddLiquidity({
      config,
      osmosis,
      fetchPool: async () => rawPool("3000000000"),
      onFulfill: jest.fn(),
    });

    const [, pool, tokenIn] =
      osmosis.sendJoinSwapExternAmountInMsg.mock.calls[0];
    expect(pool.assets[0].amount.toCoin().amount).toBe("3000000000");
    expect(tokenIn.amount).toBe("10");
  });

  it("fails when the fetch fails or the pool is not joinable", async () => {
    const osmosis = {
      sendJoinPoolMsg: jest.fn(),
      sendJoinSwapExternAmountInMsg: jest.fn(),
    };

    await expect(
      sendAddLiquidity({
        config: makeConfig(false),
        osmosis,
        fetchPool: async () => {
          throw new Error("offline");
        },
        onFulfill: jest.fn(),
      })
    ).rejects.toThrow("offline");
    await expect(
      sendAddLiquidity({
        config: makeConfig(false),
        osmosis,
        fetchPool: async () => ({ ...rawPool("1"), type: "concentrated" }),
        onFulfill: jest.fn(),
      })
    ).rejects.toThrow("not a joinable share pool");
    expect(osmosis.sendJoinPoolMsg).not.toHaveBeenCalled();
  });
});
