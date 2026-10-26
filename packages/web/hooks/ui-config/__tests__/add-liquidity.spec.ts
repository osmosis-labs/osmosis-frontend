import type { AddLiquidityPoolData } from "@osmosis-labs/types";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { EmptyAmountError, ZeroAmountError } from "@osmosis-labs/utils";

import {
  type AddLiquidityActionInput,
  type AddLiquidityContext,
  type AddLiquidityInputs,
  addLiquidityReducer,
  chooseSingleAmountInIndex,
  computeSetAmountAt,
  computeSetMax,
  emptyAddLiquidityInputs,
  getAddLiquidityError,
  getBalance,
  getInputsScopeKey,
  getPoolAssets,
  initialAddLiquidityState,
} from "~/hooks/ui-config/add-liquidity";
import { getAssetAmountError } from "~/hooks/ui-config/create-pool";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };
const usdc = { coinDenom: "USDC", coinMinimalDenom: "uusdc", coinDecimals: 6 };
const weth = { coinDenom: "WETH", coinMinimalDenom: "weth", coinDecimals: 18 };
const share = {
  coinDenom: "GAMM/POOL/1",
  coinMinimalDenom: "gamm/pool/1",
  coinDecimals: 18,
};

const makePool = (
  assets: { c: typeof osmo; amount: string; weight: string }[],
  type: "weighted" | "stable" = "weighted"
): AddLiquidityPoolData => ({
  id: "1",
  type,
  totalShare: new CoinPretty(share, new Int("100000000000000000000")),
  assets: assets.map(({ c, amount, weight }) => ({
    amount: new CoinPretty(c, new Int(amount)),
    weight: type === "weighted" ? new Int(weight) : undefined,
  })),
  totalWeight:
    type === "weighted"
      ? new Int(assets.reduce((acc, a) => acc + Number(a.weight), 0))
      : undefined,
  swapFee: new Dec("0.003"),
});

const osmoAtom = makePool([
  { c: osmo, amount: "1000000000", weight: "1" },
  { c: atom, amount: "100000000", weight: "1" },
]);
const atomOsmoUsdc = makePool([
  { c: atom, amount: "300000000", weight: "1" },
  { c: osmo, amount: "1700000000", weight: "2" },
  { c: usdc, amount: "999999999", weight: "1" },
]);
const noOsmo = makePool([
  { c: atom, amount: "123456789", weight: "1" },
  { c: weth, amount: "987654321987654321", weight: "3" },
]);

const plentyBalances: [string, string][] = [
  ["uosmo", "9000000000"],
  ["uatom", "9000000000"],
  ["uusdc", "9000000000"],
  ["weth", "90000000000000000000"],
];
const limitedBalances: [string, string][] = [
  ["uosmo", "500000000"],
  ["uatom", "50000000"],
  ["uusdc", "1000000000"],
];

// Representative expected values retained from the legacy parity tests.
// Shared amount validation is covered by create-pool and concentrated-deposit-amount;
// single-asset share calculations are covered by tx/account/join-pool.
describe("add liquidity calculations", () => {
  it.each([
    {
      name: "two assets",
      pool: osmoAtom,
      amounts: ["5", "0.5"],
      shares: "0.500000000000000000",
    },
    {
      name: "three assets with OSMO second",
      pool: atomOsmoUsdc,
      amounts: ["0.08", "0.5", "0.29"],
      shares: "0.029411764705882353",
    },
    {
      name: "mixed 6- and 18-decimal assets without OSMO",
      pool: noOsmo,
      amounts: ["62.4", "0.5"],
      shares: "50.624999948742187551",
    },
  ])(
    "balances and rounds a typed deposit for $name",
    ({ pool, amounts, shares }) => {
      const result = computeSetAmountAt(
        { pool, balances: new Map(plentyBalances) },
        emptyAddLiquidityInputs,
        1,
        ".5"
      );
      expect(result.amounts).toEqual(amounts);
      expect(result.shareOutAmount?.toDec().toString()).toBe(shares);
    }
  );

  it("clears calculated shares on invalid input without changing the other amount", () => {
    const ctx = { pool: osmoAtom, balances: new Map(plentyBalances) };
    const valid = computeSetAmountAt(ctx, emptyAddLiquidityInputs, 0, "10");
    expect(valid.shareOutAmount).toBeDefined();
    const invalid = computeSetAmountAt(ctx, valid, 0, "abc");
    expect(invalid.amounts).toEqual(["abc", "1"]);
    expect(invalid.shareOutAmount).toBeUndefined();
  });

  it("reports a rounded-to-zero counterpart even when shares are positive", () => {
    const ctx = { pool: osmoAtom, balances: new Map(plentyBalances) };
    const result = computeSetAmountAt(
      ctx,
      emptyAddLiquidityInputs,
      0,
      "0.000001"
    );
    expect(result.amounts).toEqual(["0.000001", "0"]);
    expect(result.shareOutAmount?.toDec().isPositive()).toBe(true);
    expect(
      getAddLiquidityError({
        configs: getPoolAssets(ctx.pool).map(({ currency }, i) => ({
          error: getAssetAmountError(
            result.amounts[i],
            getBalance(ctx.balances, currency)
          ),
        })),
        isSingleAmountIn: false,
        singleAmountInConfig: undefined,
        shareOutAmount: result.shareOutAmount,
      })
    ).toBeInstanceOf(ZeroAmountError);
  });

  it.each([
    {
      name: "OSMO limits the deposit and reserves the fee",
      pool: osmoAtom,
      balances: limitedBalances,
      amounts: ["499.9875", "49.99875"],
      shares: "49.998750000000000000",
    },
    {
      name: "another asset limits the deposit without exhausting OSMO",
      pool: atomOsmoUsdc,
      balances: limitedBalances,
      amounts: ["49.99999", "283.3333", "166.6666"],
      shares: "16.666664705882352941",
    },
    {
      name: "OSMO is the second asset and reserves the fee",
      pool: atomOsmoUsdc,
      balances: plentyBalances,
      amounts: ["1588.233", "8999.987", "5294.109"],
      shares: "529.411000000000000000",
    },
    {
      name: "OSMO is absent and asset decimals differ",
      pool: noOsmo,
      balances: plentyBalances,
      amounts: ["9000", "72"],
      shares: "7290.000066339000603685",
    },
  ])(
    "max replaces typed amounts when $name",
    ({ pool, balances, amounts, shares }) => {
      const ctx = { pool, balances: new Map(balances) };
      const typed = computeSetAmountAt(ctx, emptyAddLiquidityInputs, 0, "1");
      const result = computeSetMax(ctx, typed, {
        isSingleAmountIn: false,
        index: 0,
      });
      expect(result.amounts).toEqual(amounts);
      expect(result.shareOutAmount?.toDec().toString()).toBe(shares);
    }
  );

  it("does not calculate shares when the OSMO balance cannot cover the fee reserve", () => {
    const result = computeSetMax(
      {
        pool: osmoAtom,
        balances: new Map([
          ["uosmo", "10000"],
          ["uatom", "9000000000"],
        ]),
      },
      emptyAddLiquidityInputs,
      { isSingleAmountIn: false, index: 0 }
    );
    expect(result.amounts).toEqual(["-0.0025", ""]);
    expect(result.shareOutAmount).toBeUndefined();
  });

  it("prefers OSMO, uses its full balance on single-asset max, and keeps raw inputs independent", () => {
    const ctx = { pool: atomOsmoUsdc, balances: new Map(plentyBalances) };
    const scopeKey = getInputsScopeKey("1", "osmo1sender", ctx.pool);
    let state = { ...initialAddLiquidityState, scopeKey };
    const dispatch = (action: AddLiquidityActionInput) => {
      state = addLiquidityReducer(state, { ...action, ctx, scopeKey });
    };

    dispatch({ type: "setIsSingleAmountIn", value: true });
    expect(state.isSingleAmountIn).toBe(true);
    expect(state.singleAmountInConfigIndex).toBe(1);
    dispatch({ type: "setRawAmountAt", index: 1, amount: "5" });
    expect(state.amounts).toEqual(["", "5", ""]);
    expect(state.shareOutAmount).toBeUndefined();
    dispatch({ type: "setMax" });
    expect(state.amounts).toEqual(["1588", "9000", "5294"]);
    expect(state.shareOutAmount?.toDec().toString()).toBe(
      "529.411764705882352941"
    );

    dispatch({ type: "setSingleAmountInConfigIndex", index: 0 });
    expect(state.singleAmountInConfigIndex).toBe(0);
    dispatch({ type: "setRawAmountAt", index: 0, amount: ".1" });
    expect(state.amounts).toEqual(["0.1", "9000", "5294"]);
    dispatch({ type: "setIsSingleAmountIn", value: false });
    expect(state.isSingleAmountIn).toBe(false);
    expect(state.amounts).toEqual(["0.1", "9000", "5294"]);
    dispatch({ type: "setIsSingleAmountIn", value: true });
    expect(state.singleAmountInConfigIndex).toBe(1);
  });

  it("validates only the selected asset in single-asset mode without requiring balanced shares", () => {
    const empty = { error: new EmptyAmountError("Amount is empty") };
    const selected = { error: undefined };
    const input = {
      configs: [empty, selected],
      singleAmountInConfig: selected,
      shareOutAmount: undefined,
    };
    expect(
      getAddLiquidityError({ ...input, isSingleAmountIn: true })
    ).toBeUndefined();
    expect(getAddLiquidityError({ ...input, isSingleAmountIn: false })).toBe(
      empty.error
    );
  });
});

describe("add liquidity pure helpers", () => {
  const ctx: AddLiquidityContext = {
    pool: osmoAtom,
    balances: new Map(limitedBalances),
  };

  it("ignores amounts for unknown asset indexes", () => {
    expect(computeSetAmountAt(ctx, emptyAddLiquidityInputs, 5, "1")).toBe(
      emptyAddLiquidityInputs
    );
    expect(computeSetAmountAt(ctx, emptyAddLiquidityInputs, -1, "1")).toBe(
      emptyAddLiquidityInputs
    );
  });

  it("zeroes every amount when any balance is empty on max", () => {
    const zero: AddLiquidityContext = {
      pool: osmoAtom,
      balances: new Map([["uosmo", "5"]]),
    };
    const inputs: AddLiquidityInputs = {
      amounts: ["1", "2"],
      shareOutAmount: undefined,
    };
    expect(
      computeSetMax(zero, inputs, { isSingleAmountIn: false, index: 0 }).amounts
    ).toEqual(["0", "0"]);
  });

  it("chooses the highest typed asset for single amount in when OSMO is absent", () => {
    const c: AddLiquidityContext = { pool: noOsmo, balances: new Map() };
    expect(chooseSingleAmountInIndex(c, ["1", "5"])).toBe(1);
    expect(chooseSingleAmountInIndex(c, ["", ""])).toBe(0);
  });

  it("drops inputs typed for another scope but keeps the single amount in mode", () => {
    const scopeA = getInputsScopeKey("1", "osmo1a", osmoAtom);
    const scopeB = getInputsScopeKey("1", "osmo1b", osmoAtom);
    let state = addLiquidityReducer(
      { ...initialAddLiquidityState, scopeKey: scopeA },
      { ctx, scopeKey: scopeA, type: "setIsSingleAmountIn", value: true }
    );
    state = addLiquidityReducer(state, {
      ctx,
      scopeKey: scopeA,
      type: "setAmountAt",
      index: 0,
      amount: "1",
    });
    expect(state.amounts[0]).toBe("1");
    state = addLiquidityReducer(state, {
      ctx,
      scopeKey: scopeB,
      type: "setSingleAmountInConfigIndex",
      index: 1,
    });
    expect(state.amounts).toEqual([]);
    expect(state.shareOutAmount).toBeUndefined();
    expect(state.isSingleAmountIn).toBe(true);
    expect(state.singleAmountInConfigIndex).toBe(1);
  });

  it("does not enable single amount in for stable pools", () => {
    const stable = makePool(
      [
        { c: atom, amount: "1", weight: "1" },
        { c: osmo, amount: "1", weight: "1" },
      ],
      "stable"
    );
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const scopeKey = getInputsScopeKey("1", "", stable);
    const state = addLiquidityReducer(
      { ...initialAddLiquidityState, scopeKey },
      {
        ctx: { pool: stable, balances: new Map() },
        scopeKey,
        type: "setIsSingleAmountIn",
        value: true,
      }
    );
    expect(state.isSingleAmountIn).toBe(false);
    warn.mockRestore();
  });
});
