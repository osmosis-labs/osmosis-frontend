import {
  EmptyAmountError,
  InsufficientAmountError,
} from "@osmosis-labs/keplr-hooks";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

import {
  AddLiquidityPoolData,
  ObservableAddLiquidityConfig,
} from "../add-liquidity";
import { CalculatingShareOutAmountError, NotInitializedError } from "../errors";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };
const wbtc = { coinDenom: "WBTC", coinMinimalDenom: "wbtc", coinDecimals: 8 };
const usdc = { coinDenom: "USDC", coinMinimalDenom: "uusdc", coinDecimals: 6 };
const shareCurrency = {
  coinDenom: "GAMM/1",
  coinMinimalDenom: "gamm/pool/1",
  coinDecimals: 18,
};

/** 1000 OSMO / 100 ATOM, 100 shares, equal weights. */
function makeWeightedPool(): AddLiquidityPoolData {
  return {
    type: "weighted",
    totalShare: new CoinPretty(shareCurrency, new Int("100000000000000000000")),
    assets: [
      {
        amount: new CoinPretty(osmo, new Int("1000000000")),
        weight: new Int(1),
      },
      {
        amount: new CoinPretty(atom, new Int("100000000")),
        weight: new Int(1),
      },
    ],
    totalWeight: new Int(2),
    swapFee: new Dec("0.002"),
  };
}

function makeConfig(
  pool: AddLiquidityPoolData | null = makeWeightedPool(),
  balances = [
    { denom: "uosmo", amount: "500000000" },
    { denom: "uatom", amount: "50000000" },
  ]
) {
  const config = new ObservableAddLiquidityConfig("1", "osmo1sender");
  config.setPool(pool ?? undefined);
  config.setBalances(balances);
  return config;
}

describe("ObservableAddLiquidityConfig", () => {
  it("is not initialized until a pool is set", () => {
    const config = makeConfig(null);
    expect(config.poolAssets).toHaveLength(0);
    expect(config.error).toBeInstanceOf(NotInitializedError);
    expect(config.supportsSingleAmountIn).toBe(false);
  });

  it("derives pool assets and weight fractions from plain pool data", () => {
    const config = makeConfig();
    expect(config.poolAssets.map((a) => a.currency.coinDenom)).toEqual([
      "OSMO",
      "ATOM",
    ]);
    expect(config.poolAssets[0].weightFraction.toDec().toString()).toBe(
      "0.500000000000000000"
    );
    expect(config.totalShare.toDec().toString()).toBe("100.000000000000000000");
    expect(config.error).toBeInstanceOf(EmptyAmountError);
  });

  it("reads balances from set balances, zero when missing", () => {
    const config = makeConfig(null, [{ denom: "uosmo", amount: "500000000" }]);
    expect(config.getBalance(osmo).toDec().toString()).toBe(
      "500.000000000000000000"
    );
    expect(config.getBalance(atom).toDec().isZero()).toBe(true);
  });

  it("estimates share out and balances the other assets proportionally", () => {
    const config = makeConfig();
    config.setAmountAt(0, "10");

    // 10 / 1000 of the pool = 1 of 100 shares
    expect(config.shareOutAmount?.toDec().toString()).toBe(
      "1.000000000000000000"
    );
    expect(config.getAmountAt(1)).toBe("1");
    expect(config.error).toBeUndefined();

    config.setAmountAt(1, "5");
    expect(config.shareOutAmount?.toDec().toString()).toBe(
      "5.000000000000000000"
    );
    expect(config.getAmountAt(0)).toBe("50");
  });

  it("flags insufficient balance and clears the share out estimate", () => {
    const config = makeConfig();
    config.setAmountAt(0, "10");
    config.setAmountAt(0, "600");

    expect(config.shareOutAmount).toBeUndefined();
    expect(config.error).toBeInstanceOf(InsufficientAmountError);
  });

  it("revalidates when balances change", () => {
    const config = makeConfig();
    config.setAmountAt(0, "600");
    expect(config.error).toBeInstanceOf(InsufficientAmountError);

    config.setBalances([
      { denom: "uosmo", amount: "700000000" },
      { denom: "uatom", amount: "100000000" },
    ]);
    config.setAmountAt(0, "600");
    expect(config.poolAssetConfigs[0].error).toBeUndefined();
    expect(config.poolAssetConfigs[1].error).toBeUndefined();
    expect(config.error).toBeUndefined();
  });

  it("requires input in single asset mode", () => {
    const config = makeConfig();
    config.setIsSingleAmountIn(true);
    expect(config.error).toBeInstanceOf(EmptyAmountError);
  });

  it("selects OSMO and computes price impact in single asset mode", () => {
    const config = makeConfig();
    config.setIsSingleAmountIn(true);
    expect(config.singleAmountInAsset?.currency.coinDenom).toBe("OSMO");

    config.singleAmountInConfig?.setAmount("10");
    expect(config.error).toBeUndefined();
    // 1 - 1000 / (1000 + 10)
    expect(config.singleAmountInPriceImpact?.toDec().toString()).toBe(
      "0.009900990099009901"
    );
    expect(config.singleAmountInBalance?.toDec().toString()).toBe(
      "500.000000000000000000"
    );
  });

  it("falls back to the first asset when OSMO is not in the pool", () => {
    const pool = makeWeightedPool();
    pool.assets[0] = {
      amount: new CoinPretty(usdc, new Int("1000000000")),
      weight: new Int(1),
    };
    const config = makeConfig(pool);
    config.setIsSingleAmountIn(true);

    expect(config.singleAmountInAsset?.currency.coinDenom).toBe("USDC");
  });

  it("does not support single asset mode for stable pools", () => {
    const pool = makeWeightedPool();
    const stable: AddLiquidityPoolData = {
      ...pool,
      type: "stable",
      assets: pool.assets.map(({ amount }) => ({ amount })),
      totalWeight: undefined,
      stableSwapInfo: {
        scalingFactorController: "osmo1ctrl",
        scalingFactor: ["1", "1"],
      },
    };
    const config = makeConfig(stable);

    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(config.supportsSingleAmountIn).toBe(false);
    config.setIsSingleAmountIn(true);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(config.isSingleAmountIn).toBe(false);
    expect(config.stableSwapInfo?.scalingFactorController).toBe("osmo1ctrl");
    // stable pools assume even weights
    expect(config.poolAssets[0].weightFraction.toDec().toString()).toBe(
      "0.500000000000000000"
    );
  });

  it("sets the max feasible amount, leaving padding for OSMO fees", () => {
    const config = makeConfig();
    config.setMax();

    // OSMO is the limiting side: 500 OSMO needs 50 ATOM, which the user has
    expect(config.getAmountAt(0)).toBe("499.9875");
    expect(config.getAmountAt(1)).toBe("49.99875");
    expect(config.error).toBeUndefined();
  });

  it("zeroes all amounts on max when any balance is empty", () => {
    const config = makeConfig(null, [{ denom: "uosmo", amount: "500000000" }]);
    config.setPool(makeWeightedPool());
    config.setMax();

    expect(config.getAmountAt(0)).toBe("0");
    expect(config.getAmountAt(1)).toBe("0");
  });

  it("sets the single asset to its full balance on max", () => {
    const config = makeConfig();
    config.setIsSingleAmountIn(true);
    config.setMax();

    expect(config.singleAmountInConfig?.amount).toBe("500");
    expect(config.singleAmountInConfig?.error).toBeUndefined();
  });

  it("handles assets with other than 6 decimals", () => {
    const pool = makeWeightedPool();
    // 10 WBTC (8 decimals) in place of ATOM
    pool.assets[1] = {
      amount: new CoinPretty(wbtc, new Int("1000000000")),
      weight: new Int(1),
    };
    const config = makeConfig(pool, [
      { denom: "uosmo", amount: "500000000" },
      { denom: "wbtc", amount: "500000000" },
    ]);

    config.setAmountAt(0, "10");
    // 10 / 1000 of the pool = 0.1 of 10 WBTC
    expect(config.shareOutAmount?.toDec().toString()).toBe(
      "1.000000000000000000"
    );
    expect(config.getAmountAt(1)).toBe("0.1");
    expect(config.error).toBeUndefined();

    config.setAmountAt(1, "6");
    // 5 WBTC balance
    expect(config.error).toBeInstanceOf(InsufficientAmountError);
    expect(config.getBalance(wbtc).toDec().toString()).toBe(
      "5.000000000000000000"
    );
  });

  it("keeps entered amounts when pool data refreshes", () => {
    const config = makeConfig();
    config.setAmountAt(0, "10");
    config.setPool(makeWeightedPool());

    expect(config.getAmountAt(0)).toBe("10");
    expect(config.getAmountAt(1)).toBe("1");
  });

  it("reports share out calculation pending when amounts are set directly", () => {
    const config = makeConfig();
    config.poolAssetConfigs[0].setAmount("10");
    config.poolAssetConfigs[1].setAmount("1");

    expect(config.error).toBeInstanceOf(CalculatingShareOutAmountError);
  });
});
