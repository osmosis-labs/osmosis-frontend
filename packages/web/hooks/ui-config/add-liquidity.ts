import {
  type AddLiquidityPoolData,
  CalculatingShareOutAmountError,
  NotInitializedError,
  OSMO_MEDIUM_TX_FEE,
} from "@osmosis-labs/stores";
import type { Currency } from "@osmosis-labs/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  RatePretty,
} from "@osmosis-labs/unit";

import { getAssetAmountError } from "./create-pool";

export type PoolAssetCurrency = Currency & {
  originCurrency?: Currency & {
    pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
  };
};

export type PoolAsset = {
  weight: IntPretty;
  weightFraction: RatePretty;
  amount: CoinPretty;
  currency: PoolAssetCurrency;
};

/** Context the computations read: the pool and the sender's raw balances by denom. */
export type AddLiquidityContext = {
  pool: AddLiquidityPoolData | undefined;
  balances: ReadonlyMap<string, string>;
};

/** The user's typed inputs. `amounts` is index aligned with the pool assets. */
export type AddLiquidityInputs = {
  amounts: string[];
  shareOutAmount: IntPretty | undefined;
};

export const emptyAddLiquidityInputs: AddLiquidityInputs = {
  amounts: [],
  shareOutAmount: undefined,
};

/** Identifies the pool's asset currencies by denom and decimals, in order. */
export function getAssetsKey(pool: AddLiquidityPoolData): string {
  return pool.assets
    .map(
      ({ amount: { currency } }) =>
        `${currency.coinMinimalDenom}:${currency.coinDecimals}`
    )
    .join(",");
}

/** Typed inputs are only valid for the pool, sender and asset currencies they were typed for. */
export function getInputsScopeKey(
  poolId: string,
  sender: string,
  pool: AddLiquidityPoolData | undefined
): string {
  return `${poolId}|${sender}|${pool ? getAssetsKey(pool) : ""}`;
}

/** Sender's balance of the given currency, zero if none. */
export function getBalance(
  balances: ReadonlyMap<string, string>,
  currency: Currency
): CoinPretty {
  return new CoinPretty(
    currency,
    new Int(balances.get(currency.coinMinimalDenom) ?? "0")
  );
}

export function getPoolAssets(
  pool: AddLiquidityPoolData | undefined
): PoolAsset[] {
  if (!pool) return [];

  return pool.assets.map(({ amount, weight }) => {
    const weights: { weight: IntPretty; weightFraction: RatePretty } =
      weight && pool.totalWeight
        ? {
            weight: new IntPretty(weight),
            weightFraction: new RatePretty(
              weight.toDec().quoTruncate(pool.totalWeight.toDec())
            ),
          }
        : {
            weight: new IntPretty(1), // Assume stable pools have even weight
            weightFraction: new RatePretty(
              new Dec(1).quo(new Dec(pool.assets.length))
            ),
          };

    return {
      ...weights,
      amount,
      currency: amount.currency as PoolAssetCurrency,
    };
  });
}

export function getTotalWeight(poolAssets: PoolAsset[]): IntPretty {
  let result = new IntPretty(new Int(0));
  for (const asset of poolAssets) {
    result = result.add(asset.weight);
  }
  return result;
}

export function getTotalShare(
  pool: AddLiquidityPoolData | undefined
): IntPretty {
  if (!pool) return new IntPretty(new Int(0));
  return new IntPretty(pool.totalShare);
}

/** Amounts aligned to the pool assets, missing entries are empty. */
export function getAmounts(
  pool: AddLiquidityPoolData | undefined,
  amounts: string[]
): string[] {
  return (pool?.assets ?? []).map((_, i) => amounts[i] ?? "");
}

export function getSupportsSingleAmountIn(
  pool: AddLiquidityPoolData | undefined
): boolean {
  if (!pool) return false;
  if (pool.type === "stable") return false;
  // Typed single asset amounts depend on the asset's decimals
  if (pool.hasGuessedCurrency) return false;
  return true;
}

/** Amount text of the given fraction of the balance, as typed by "max". */
function getFractionAmount(balance: CoinPretty, fraction: number): string {
  if (balance.toDec().lte(new Dec(0))) return "0";

  return balance
    .mul(new Dec(fraction))
    .trim(true)
    .locale(false)
    .hideDenom(true)
    .toString();
}

/** Sets the amount of an asset and, when it is valid, derives the share out amount
 *  and the amounts of all other assets so the deposit stays balanced.
 *  share out amount = (token in amount * total share) / pool asset
 */
export function computeSetAmountAt(
  ctx: AddLiquidityContext,
  inputs: AddLiquidityInputs,
  index: number,
  amount: string,
  isMax = false
): AddLiquidityInputs {
  const poolAssets = getPoolAssets(ctx.pool);
  if (index < 0 || index >= poolAssets.length) return inputs;

  if (amount.startsWith(".")) amount = "0" + amount;
  const amounts = getAmounts(ctx.pool, inputs.amounts);
  amounts[index] = amount;

  const currency = poolAssets[index].currency;
  const error = getAssetAmountError(amount, getBalance(ctx.balances, currency));
  if (error !== undefined) return { amounts, shareOutAmount: undefined };

  const tokenInAmount = new IntPretty(new Dec(amount));
  const totalShare = getTotalShare(ctx.pool);
  const poolAsset = poolAssets.find(
    (asset) => asset.currency.coinMinimalDenom === currency.coinMinimalDenom
  );

  if (tokenInAmount.toDec().equals(new Dec(0))) {
    return { amounts, shareOutAmount: undefined };
  }
  if (totalShare.toDec().equals(new Dec(0))) {
    return { amounts, shareOutAmount: undefined };
  }
  if (!poolAsset) return { amounts, shareOutAmount: undefined };

  // totalShare / poolAsset.amount = totalShare per poolAssetAmount = total share per tokenInAmount
  // tokenInAmount * (total share per tokenInAmount) = totalShare of given tokenInAmount aka shareOutAmount;
  // tokenInAmount in terms of totalShare unit

  // shareOutAmount / totalShare = totalShare proportion of tokenInAmount;
  // totalShare proportion of tokenInAmount * otherTotalPoolAssetAmount = otherPoolAssetAmount
  const shareOutAmount = tokenInAmount.mul(totalShare).quo(poolAsset.amount);

  for (let i = 0; i < poolAssets.length; i++) {
    if (i === index) continue;
    const otherCurrency = poolAssets[i].currency;
    const otherPoolAsset = poolAssets.find(
      (asset) =>
        asset.currency.coinMinimalDenom === otherCurrency.coinMinimalDenom
    );
    if (!otherPoolAsset) return { amounts, shareOutAmount: undefined };

    amounts[i] = shareOutAmount
      .mul(otherPoolAsset.amount)
      .quo(totalShare)
      .trim(true)
      .shrink(true)
      .maxDecimals(isMax ? 6 : 2)
      .locale(false)
      .toString();
  }

  return { amounts, shareOutAmount };
}

/** Fills in the largest balanced deposit the sender's balances allow.
 *  In single amount in mode this is the whole balance of the selected asset. */
export function computeSetMax(
  ctx: AddLiquidityContext,
  inputs: AddLiquidityInputs,
  single: { isSingleAmountIn: boolean; index: number }
): AddLiquidityInputs {
  const poolAssets = getPoolAssets(ctx.pool);
  const currencies = poolAssets.map((a) => a.currency);

  if (
    single.isSingleAmountIn &&
    currencies.length > 0 &&
    single.index < currencies.length
  ) {
    const balance = getBalance(ctx.balances, currencies[single.index]);
    return computeSetAmountAt(
      ctx,
      inputs,
      single.index,
      getFractionAmount(balance, 1)
    );
  }

  const balancePrettyList = currencies.map((currency) =>
    getBalance(ctx.balances, currency)
  );
  if (balancePrettyList.some((b) => b.toDec().equals(new Dec(0)))) {
    return {
      ...inputs,
      amounts: getAmounts(ctx.pool, inputs.amounts).map(() => "0"),
    };
  }

  const totalShare = getTotalShare(ctx.pool);
  for (const balancePretty of balancePrettyList) {
    const baseBalanceInt = new IntPretty(balancePretty);
    const basePoolAsset = poolAssets.find(
      (poolAsset) =>
        poolAsset.currency.coinMinimalDenom ===
        balancePretty.currency.coinMinimalDenom
    );
    if (!basePoolAsset) continue;
    const baseShareOutAmount = baseBalanceInt
      .mul(totalShare)
      .quo(basePoolAsset.amount);
    const outAmountInfoList = poolAssets.map((poolAsset) => {
      const coinMinimalDenom = poolAsset.currency.coinMinimalDenom;
      if (basePoolAsset.currency.coinMinimalDenom === coinMinimalDenom) {
        return { coinMinimalDenom, outAmount: baseBalanceInt };
      }
      return {
        coinMinimalDenom,
        outAmount: baseShareOutAmount.mul(poolAsset.amount).quo(totalShare),
      };
    });
    const hasInsufficientBalance = outAmountInfoList.some((outAmountInfo) => {
      const balanceInfo = balancePrettyList.find(
        (balance) =>
          balance.currency.coinMinimalDenom === outAmountInfo.coinMinimalDenom
      );
      if (!balanceInfo) return false;
      return balanceInfo.toDec().lt(outAmountInfo.outAmount.toDec());
    });
    if (hasInsufficientBalance) continue;

    // A feasible max is found: apply it and stop, whatever the outcome.
    const osmoIndex = currencies.findIndex(
      (currency) => currency.coinMinimalDenom === "uosmo"
    );

    if (osmoIndex !== -1) {
      const osmoOutAmountInfo = outAmountInfoList.find(
        (outAmountInfo) => outAmountInfo.coinMinimalDenom === "uosmo"
      );
      if (!osmoOutAmountInfo) return inputs;
      const osmoBalanceInfo = balancePrettyList.find(
        (balance) => balance.currency.coinMinimalDenom === "uosmo"
      );
      if (!osmoBalanceInfo) return inputs;
      const osmoOutAmount = osmoBalanceInfo
        .toDec()
        .sub(new Dec(OSMO_MEDIUM_TX_FEE))
        .lt(osmoOutAmountInfo.outAmount.toDec())
        ? osmoOutAmountInfo.outAmount.sub(new Dec(OSMO_MEDIUM_TX_FEE))
        : osmoOutAmountInfo.outAmount;

      return computeSetAmountAt(
        ctx,
        inputs,
        osmoIndex,
        osmoOutAmount
          .trim(true)
          .shrink(true)
          /** osmo is used to pay tx fees, should have some padding left for future tx? if no padding needed maxDecimals to 6 else 2*/
          .maxDecimals(6)
          .locale(false)
          .toString(),
        true
      );
    }

    /**TODO: should use cheaper coin to setAmount for higher accuracy*/
    const baseOutAmountInfo = outAmountInfoList.find(
      (outAmountInfo) =>
        outAmountInfo.coinMinimalDenom === currencies[0].coinMinimalDenom
    );
    if (!baseOutAmountInfo) return inputs;

    return computeSetAmountAt(
      ctx,
      inputs,
      0,
      baseOutAmountInfo.outAmount
        .trim(true)
        .shrink(true)
        .maxDecimals(6)
        .locale(false)
        .toString(),
      true
    );
  }

  return inputs;
}

/** Which asset to deposit in single amount in mode: OSMO if possible, else the
 *  asset with the highest typed amount, else the first. */
export function chooseSingleAmountInIndex(
  ctx: AddLiquidityContext,
  amounts: string[]
): number {
  const currencies = getPoolAssets(ctx.pool).map((a) => a.currency);
  const osmoIndex = currencies.findIndex(
    (currency) => currency.coinDenom === "OSMO"
  );
  if (osmoIndex !== -1) return osmoIndex;

  let maxAmount = new Dec(0);
  let maxIndex = 0;
  getAmounts(ctx.pool, amounts).forEach((amount, index) => {
    try {
      const curAmt = new Dec(amount);
      if (curAmt.gt(maxAmount)) {
        maxAmount = curAmt;
        maxIndex = index;
      }
    } catch {}
  });
  return maxIndex;
}

/** Price impact of adding the typed single asset amount to its pool asset.
 *  The spot price is ( Bi / Wi ) / (Bo / Wo), and "single amount in" only changes
 *  the Bi or Bo, so the impact follows from the added amount of one asset alone. */
export function getSingleAmountInPriceImpact(
  poolAssets: PoolAsset[],
  config: { sendCurrency: PoolAssetCurrency; amount: string } | undefined
): RatePretty | undefined {
  try {
    if (!config || config.amount === "") return;

    const poolAsset = poolAssets.find(
      (asset) =>
        asset.currency.coinMinimalDenom === config.sendCurrency.coinMinimalDenom
    );
    if (!poolAsset) return;

    return new RatePretty(
      new Dec(1).sub(
        poolAsset.amount
          .toDec()
          .quo(
            poolAsset.amount
              .toDec()
              .add(
                new CoinPretty(
                  config.sendCurrency,
                  new Dec(config.amount).mul(
                    DecUtils.getTenExponentNInPrecisionRange(
                      config.sendCurrency.coinDecimals
                    )
                  )
                ).toDec()
              )
          )
      )
    );
  } catch (e) {
    console.error(e);
  }
}

/** The first problem with the input, if any. */
export function getAddLiquidityError({
  configs,
  isSingleAmountIn,
  singleAmountInConfig,
  shareOutAmount,
}: {
  configs: { error: Error | undefined }[];
  isSingleAmountIn: boolean;
  singleAmountInConfig: { error: Error | undefined } | undefined;
  shareOutAmount: IntPretty | undefined;
}): Error | undefined {
  if (configs.length === 0) {
    return new NotInitializedError("Not initialized yet");
  }

  if (isSingleAmountIn && singleAmountInConfig) {
    return singleAmountInConfig.error ?? undefined;
  }
  for (const config of configs) {
    if (config.error != null) return config.error;
  }

  if (!shareOutAmount || shareOutAmount.toDec().lte(new Dec(0))) {
    return new CalculatingShareOutAmountError(
      "Calculating the share out amount"
    );
  }
  return;
}

// STATE

export type AddLiquidityState = AddLiquidityInputs & {
  /** The scope the inputs were typed for, see `getInputsScopeKey`. */
  scopeKey: string;
  isSingleAmountIn: boolean;
  singleAmountInConfigIndex: number;
};

export const initialAddLiquidityState: AddLiquidityState = {
  ...emptyAddLiquidityInputs,
  scopeKey: "",
  isSingleAmountIn: false,
  singleAmountInConfigIndex: 0,
};

/** Action payload without the context that is added at dispatch. */
export type AddLiquidityActionInput =
  | { type: "setAmountAt"; index: number; amount: string }
  | { type: "setRawAmountAt"; index: number; amount: string }
  | { type: "setMax" }
  | { type: "setIsSingleAmountIn"; value: boolean }
  | { type: "setSingleAmountInConfigIndex"; index: number }
  | { type: "reset" };

export type AddLiquidityAction = {
  /** Context at the time of dispatch. */
  ctx: AddLiquidityContext;
  scopeKey: string;
} & AddLiquidityActionInput;

export function addLiquidityReducer(
  prev: AddLiquidityState,
  action: AddLiquidityAction
): AddLiquidityState {
  // Inputs typed for another pool, sender or asset currencies are dropped
  const state: AddLiquidityState =
    prev.scopeKey === action.scopeKey
      ? prev
      : { ...prev, ...emptyAddLiquidityInputs, scopeKey: action.scopeKey };
  const { ctx } = action;

  switch (action.type) {
    case "setAmountAt":
      return {
        ...state,
        ...computeSetAmountAt(ctx, state, action.index, action.amount),
      };
    case "setRawAmountAt": {
      // Sets the text only, without balancing the other assets
      const amounts = getAmounts(ctx.pool, state.amounts);
      if (action.index < 0 || action.index >= amounts.length) return state;
      amounts[action.index] = action.amount.startsWith(".")
        ? "0" + action.amount
        : action.amount;
      return { ...state, amounts };
    }
    case "setMax":
      return {
        ...state,
        ...computeSetMax(ctx, state, {
          isSingleAmountIn: state.isSingleAmountIn,
          index: state.singleAmountInConfigIndex,
        }),
      };
    case "setIsSingleAmountIn": {
      if (!ctx.pool) return state;
      if (ctx.pool.type === "stable") {
        console.warn(
          "Single asset join pool currently not supported for stable pools"
        );
        return state;
      }
      if (!getSupportsSingleAmountIn(ctx.pool)) return state;

      return {
        ...state,
        isSingleAmountIn: action.value,
        singleAmountInConfigIndex: action.value
          ? chooseSingleAmountInIndex(ctx, state.amounts)
          : state.singleAmountInConfigIndex,
      };
    }
    case "setSingleAmountInConfigIndex":
      return { ...state, singleAmountInConfigIndex: action.index };
    case "reset":
      return { ...state, ...emptyAddLiquidityInputs };
  }
}
