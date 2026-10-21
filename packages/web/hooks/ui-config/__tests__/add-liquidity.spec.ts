import {
  type AddLiquidityPoolData,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

import {
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

const balanceSets: Record<string, [string, string][]> = {
  none: [],
  plenty: [
    ["uosmo", "9000000000"],
    ["uatom", "9000000000"],
    ["uusdc", "9000000000"],
    ["weth", "90000000000000000000"],
  ],
  atomLimited: [
    ["uosmo", "500000000"],
    ["uatom", "50000000"],
    ["uusdc", "1000000000"],
    ["weth", "5000000000000000000"],
  ],
  tinyOsmo: [
    ["uosmo", "10000"],
    ["uatom", "9000000000"],
    ["uusdc", "9000000000"],
    ["weth", "1"],
  ],
  zeroOne: [
    ["uosmo", "1000"],
    ["uatom", "0"],
    ["uusdc", "5"],
    ["weth", "7"],
  ],
};

type Op =
  | { op: "amount"; index: number; amount: string }
  | { op: "max" }
  | { op: "single"; value: boolean }
  | { op: "singleIndex"; index: number }
  | { op: "singleAmount"; amount: string };

const scripts: Record<string, Op[]> = {
  typed: [
    { op: "amount", index: 0, amount: "10" },
    { op: "amount", index: 1, amount: ".5" },
    { op: "amount", index: 0, amount: "abc" },
    { op: "amount", index: 0, amount: "0" },
    { op: "amount", index: 0, amount: "-3" },
    { op: "amount", index: 0, amount: "123456789" },
    { op: "amount", index: 0, amount: "0.000001" },
  ],
  max: [{ op: "max" }],
  maxAfterTyping: [{ op: "amount", index: 0, amount: "1" }, { op: "max" }],
  single: [
    { op: "single", value: true },
    { op: "singleAmount", amount: "5" },
    { op: "max" },
    { op: "singleIndex", index: 1 },
    { op: "singleAmount", amount: "0.1" },
    { op: "single", value: false },
    { op: "amount", index: 1, amount: "2" },
    { op: "single", value: true },
  ],
};

function snapshotLegacy(c: ObservableAddLiquidityConfig) {
  return {
    amounts: c.poolAssetConfigs.map((a) => a.amount),
    shareOut: c.shareOutAmount?.toDec().toString(),
    error: c.error?.constructor.name,
    isSingle: c.isSingleAmountIn,
    singleDenom: c.singleAmountInConfig?.sendCurrency.coinMinimalDenom,
    impact: c.singleAmountInPriceImpact?.toDec().toString(),
  };
}

function runLegacy(
  pool: AddLiquidityPoolData,
  bal: [string, string][],
  ops: Op[]
) {
  const c = new ObservableAddLiquidityConfig("1", "osmo1sender");
  c.setPool(pool);
  c.setBalances(bal.map(([denom, amount]) => ({ denom, amount })));
  const out = [snapshotLegacy(c)];
  for (const o of ops) {
    if (o.op === "amount") c.setAmountAt(o.index, o.amount);
    if (o.op === "max") c.setMax();
    if (o.op === "single") c.setIsSingleAmountIn(o.value);
    if (o.op === "singleIndex") c.setSingleAmountInConfigIndex(o.index);
    if (o.op === "singleAmount") c.singleAmountInConfig?.setAmount(o.amount);
    out.push(snapshotLegacy(c));
  }
  return out;
}

function runNew(
  pool: AddLiquidityPoolData,
  bal: [string, string][],
  ops: Op[]
) {
  const ctx: AddLiquidityContext = { pool, balances: new Map(bal) };
  const scopeKey = getInputsScopeKey("1", "osmo1sender", pool);
  let state = { ...initialAddLiquidityState, scopeKey };
  const snap = () => {
    const assets = getPoolAssets(pool);
    const amounts = assets.map((_, i) => state.amounts[i] ?? "");
    const configs = assets.map(({ currency }, i) => ({
      sendCurrency: currency,
      amount: amounts[i],
      error: undefined as Error | undefined,
    }));
    configs.forEach((c) => {
      c.error = getAssetAmountError(
        c.amount,
        getBalance(ctx.balances, c.sendCurrency)
      );
    });
    const single =
      state.isSingleAmountIn && state.singleAmountInConfigIndex < configs.length
        ? configs[state.singleAmountInConfigIndex]
        : undefined;
    return {
      amounts,
      shareOut: state.shareOutAmount?.toDec().toString(),
      error: getAddLiquidityError({
        configs,
        isSingleAmountIn: state.isSingleAmountIn,
        singleAmountInConfig: single,
        shareOutAmount: state.shareOutAmount,
      })?.constructor.name,
      isSingle: state.isSingleAmountIn,
      singleDenom: single?.sendCurrency.coinMinimalDenom,
    };
  };
  const out = [snap()];
  for (const o of ops) {
    const base = { ctx, scopeKey };
    if (o.op === "amount") {
      state = addLiquidityReducer(state, {
        ...base,
        type: "setAmountAt",
        index: o.index,
        amount: o.amount,
      });
    }
    if (o.op === "max")
      state = addLiquidityReducer(state, { ...base, type: "setMax" });
    if (o.op === "single") {
      state = addLiquidityReducer(state, {
        ...base,
        type: "setIsSingleAmountIn",
        value: o.value,
      });
    }
    if (o.op === "singleIndex") {
      state = addLiquidityReducer(state, {
        ...base,
        type: "setSingleAmountInConfigIndex",
        index: o.index,
      });
    }
    if (o.op === "singleAmount") {
      state = addLiquidityReducer(state, {
        ...base,
        type: "setRawAmountAt",
        index: state.singleAmountInConfigIndex,
        amount: o.amount,
      });
    }
    out.push(snap());
  }
  return out;
}

describe("add liquidity calculations match the legacy config", () => {
  const pools = { osmoAtom, atomOsmoUsdc, noOsmo };
  for (const [poolName, pool] of Object.entries(pools)) {
    for (const [balName, bal] of Object.entries(balanceSets)) {
      for (const [scriptName, ops] of Object.entries(scripts)) {
        it(`${poolName} / ${balName} / ${scriptName}`, () => {
          const legacy = runLegacy(pool, bal, ops);
          const next = runNew(pool, bal, ops);
          expect(next).toEqual(
            legacy.map(({ impact: _impact, ...rest }) => rest)
          );
        });
      }
    }
  }
});

describe("add liquidity pure helpers", () => {
  const ctx: AddLiquidityContext = {
    pool: osmoAtom,
    balances: new Map(balanceSets.atomLimited),
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
