import { makePoolFromChainPool } from "@osmosis-labs/server";
import type { TransactionPreparationContext } from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { EmptyAmountError, InsufficientAmountError } from "@osmosis-labs/utils";
import { NotInitializedError } from "@osmosis-labs/utils";
import { act, renderHook } from "@testing-library/react";

import {
  AddLiquidityPreflightError,
  makeAddLiquidityPoolData,
  sendAddLiquidity,
  useAddLiquidityConfig,
} from "~/hooks/ui-config/use-add-liquidity-config";

// The tRPC queries the hook reads, backed by mutable test data
let mockPool: any;
let mockBalances: { denom: string; amount: string }[] | undefined;

jest.mock("~/utils/trpc", () => ({
  api: {
    useUtils: () => ({ local: { pools: { getPool: { fetch: jest.fn() } } } }),
    local: {
      pools: { getPool: { useQuery: () => ({ data: mockPool }) } },
      balances: {
        getUserBalances: { useQuery: () => ({ data: mockBalances }) },
      },
    },
  },
}));
jest.mock("~/hooks/use-wallet", () => ({
  useWallet: () => ({ wallet: undefined, address: "osmo1sender" }),
}));
jest.mock("~/components/alert", () => ({
  displayToast: jest.fn(),
  ToastType: { ERROR: "error" },
}));

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atomDenom =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const atom = {
  coinDenom: "ATOM",
  coinMinimalDenom: atomDenom,
  coinDecimals: 6,
};

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
          { weight: "1", token: { denom: atomDenom, amount: "100000000" } },
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
          { denom: atomDenom, amount: "100000000" },
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

  it("flags unlisted assets as guessed even when reserve coins carry them", () => {
    // The server's chain fallback puts guessed currencies into reserve coins
    const unlisted = {
      coinDenom: "factory/osmo1x/unlisted",
      coinMinimalDenom: "factory/osmo1x/unlisted",
      coinDecimals: 6,
    };
    const data = makeAddLiquidityPoolData({
      id: "8",
      type: "weighted",
      reserveCoins: [
        new CoinPretty(osmo, new Int("1000")),
        new CoinPretty(unlisted, new Int("2000")),
      ],
      raw: {
        total_weight: "2",
        pool_params: { swap_fee: "0.003" },
        total_shares: { denom: "gamm/pool/8", amount: "100" },
        pool_assets: [
          { weight: "1", token: { denom: "uosmo", amount: "1000" } },
          {
            weight: "1",
            token: { denom: "factory/osmo1x/unlisted", amount: "2000" },
          },
        ],
      },
    } as any);

    expect(data?.hasGuessedCurrency).toBe(true);
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
          { weight: "1", token: { denom: atomDenom, amount: "100000000" } },
        ],
      },
    }) as any;

  beforeEach(() => {
    mockPool = rawPool("1000000000");
    mockBalances = [
      { denom: "uosmo", amount: "500000000" },
      { denom: atomDenom, amount: "50000000" },
    ];
  });

  function setup(isSingle: boolean) {
    const hook = renderHook(() => useAddLiquidityConfig("osmosis-1", "1"));
    if (isSingle) {
      act(() => hook.result.current.config.setIsSingleAmountIn(true));
      act(() =>
        hook.result.current.config.singleAmountInConfig?.setAmount("10")
      );
    } else {
      act(() => hook.result.current.config.setAmountAt(0, "10"));
    }
    return hook;
  }

  const transactionContext = {
    address: "osmo1sender",
    chainId: "osmosis-1",
    chains: [],
    findCurrency: () => undefined,
    stakeCurrency: () => osmo,
    simulatePositionMigration: jest.fn(),
  } satisfies TransactionPreparationContext;

  function signer() {
    return jest.fn(async (_type: string, messages: any) => {
      if (typeof messages === "function") await messages();
    });
  }

  it("builds a balanced join from freshly fetched pool data, not the seeded config", async () => {
    const { result } = setup(false);
    const { config } = result.current;
    const signAndBroadcast = signer();
    await sendAddLiquidity({
      config,
      signAndBroadcast,
      transactionContext,
      fetchPool: async () => rawPool("2000000000"),
      onFulfill: jest.fn(),
    });
    expect(signAndBroadcast).toHaveBeenCalledTimes(1);
    const messages = await signAndBroadcast.mock.calls[0][1]();
    expect(messages[0].value).toEqual(
      expect.objectContaining({
        poolId: BigInt(1),
        sender: "osmo1sender",
        shareOutAmount: "1000000000000000000",
        tokenInMaxs: expect.arrayContaining([
          { denom: "uosmo", amount: "20500000" },
        ]),
      })
    );
    expect(config.pool?.assets[0].amount.toCoin().amount).toBe("1000000000");
  });

  it("builds a single asset join from freshly fetched pool data", async () => {
    const { result } = setup(true);
    const { config } = result.current;
    const signAndBroadcast = signer();
    await sendAddLiquidity({
      config,
      signAndBroadcast,
      transactionContext,
      fetchPool: async () => rawPool("3000000000"),
      onFulfill: jest.fn(),
    });
    const messages = await signAndBroadcast.mock.calls[0][1]();
    expect(messages[0].value).toEqual(
      expect.objectContaining({
        poolId: BigInt(1),
        sender: "osmo1sender",
        tokenIn: { denom: "uosmo", amount: "10000000" },
      })
    );
  });

  it("fails before signing when the fetch fails or the pool is not joinable", async () => {
    const { result } = setup(false);
    const signAndBroadcast = signer();
    await expect(
      sendAddLiquidity({
        config: result.current.config,
        signAndBroadcast,
        transactionContext,
        fetchPool: async () => {
          throw new Error("offline");
        },
        onFulfill: jest.fn(),
      })
    ).rejects.toThrow(AddLiquidityPreflightError);
    await expect(
      sendAddLiquidity({
        config: result.current.config,
        signAndBroadcast,
        transactionContext,
        fetchPool: async () => ({ ...rawPool("1"), type: "concentrated" }),
        onFulfill: jest.fn(),
      })
    ).rejects.toThrow("not a joinable share pool");
    expect(signAndBroadcast).not.toHaveBeenCalled();
  });

  it("does not send when the fresh pool has other decimals for an asset", async () => {
    const { result, rerender } = setup(true);
    const signAndBroadcast = signer();
    const fresh = rawPool("1000000000");
    fresh.reserveCoins = [
      new CoinPretty({ ...atom, coinDecimals: 8 }, new Int("99000000")),
      new CoinPretty(osmo, new Int("990000000")),
    ];
    await act(async () => {
      await expect(
        sendAddLiquidity({
          config: result.current.config,
          signAndBroadcast,
          transactionContext,
          fetchPool: async () => fresh,
          onFulfill: jest.fn(),
        })
      ).rejects.toThrow(AddLiquidityPreflightError);
    });
    expect(signAndBroadcast).not.toHaveBeenCalled();
    expect(result.current.config.singleAmountInConfig?.amount ?? "").toBe("");
    mockPool = fresh;
    rerender();
    expect(
      result.current.config.poolAssetConfigs[1].sendCurrency.coinDecimals
    ).toBe(8);
    expect(result.current.config.singleAmountInConfig?.amount ?? "").toBe("");
  });
});

describe("useAddLiquidityConfig", () => {
  beforeEach(() => {
    mockPool = {
      id: "1",
      type: "weighted",
      reserveCoins,
      raw: {
        total_weight: "2",
        pool_params: { swap_fee: "0.003" },
        total_shares: { denom: "gamm/pool/1", amount: "100000000000000000000" },
        pool_assets: [
          { weight: "1", token: { denom: "uosmo", amount: "1000000000" } },
          { weight: "1", token: { denom: atomDenom, amount: "100000000" } },
        ],
      },
    };
    mockBalances = [
      { denom: "uosmo", amount: "500000000" },
      { denom: atomDenom, amount: "50000000" },
    ];
  });

  it("is not initialized without a pool", () => {
    mockPool = undefined;
    const { result } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    expect(result.current.config.error).toBeInstanceOf(NotInitializedError);
    expect(result.current.config.poolAssets).toEqual([]);
  });

  it("balances the other assets and the share out amount when typing", () => {
    const { result } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    expect(result.current.config.error).toBeInstanceOf(EmptyAmountError);

    act(() => result.current.config.setAmountAt(0, "10"));
    const { config } = result.current;
    expect(config.getAmountAt(0)).toBe("10");
    // 10 OSMO of 1000 OSMO is 1% of the pool: 1 ATOM of 100
    expect(config.getAmountAt(1)).toBe("1");
    expect(config.shareOutAmount?.toDec().toString()).toBe(
      "1.000000000000000000"
    );
    expect(config.error).toBeUndefined();
  });

  it("reports insufficient balance and clears the share out amount", () => {
    const { result } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    act(() => result.current.config.setAmountAt(0, "10"));
    act(() => result.current.config.setAmountAt(0, "501"));
    expect(result.current.config.error).toBeInstanceOf(InsufficientAmountError);
    expect(result.current.config.shareOutAmount).toBeUndefined();
  });

  it("sets the max feasible balanced amounts, keeping OSMO for fees", () => {
    const { result } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    act(() => result.current.config.setMax());
    const { config } = result.current;
    // 500 OSMO (the whole balance) needs 50 ATOM, which is available, so OSMO
    // is the base; its amount is reduced by the 0.0125 fee padding
    expect(config.getAmountAt(0)).toBe("499.9875");
    expect(config.getAmountAt(1)).toBe("49.99875");
    expect(config.error).toBeUndefined();
  });

  it("clears inputs when the pool's asset decimals change", () => {
    const { result, rerender } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    act(() => result.current.config.setAmountAt(0, "10"));
    expect(result.current.config.getAmountAt(0)).toBe("10");

    mockPool = {
      ...mockPool,
      reserveCoins: [
        new CoinPretty({ ...atom, coinDecimals: 8 }, new Int("99000000")),
        new CoinPretty(osmo, new Int("990000000")),
      ],
    };
    rerender();
    expect(result.current.config.getAmountAt(0)).toBe("");
    expect(result.current.config.shareOutAmount).toBeUndefined();
  });

  it("single amount in prefers OSMO and does not balance other assets", () => {
    const { result } = renderHook(() =>
      useAddLiquidityConfig("osmosis-1", "1")
    );
    expect(result.current.config.supportsSingleAmountIn).toBe(true);
    act(() => result.current.config.setIsSingleAmountIn(true));
    expect(result.current.config.singleAmountInAsset?.currency.coinDenom).toBe(
      "OSMO"
    );

    act(() => result.current.config.singleAmountInConfig?.setAmount("10"));
    expect(result.current.config.error).toBeUndefined();
    expect(result.current.config.poolAssetConfigs[1].amount).toBe("");
    expect(
      result.current.config.singleAmountInPriceImpact?.toDec().toString()
    ).toBe(new Dec(1).sub(new Dec(1000).quo(new Dec(1010))).toString());
  });
});
