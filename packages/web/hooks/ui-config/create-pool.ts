import { fromBech32 } from "@cosmjs/encoding";
import type { PoolType } from "@osmosis-labs/types";
import { AppCurrency, CoinPretty, Dec, RatePretty } from "@osmosis-labs/unit";
import {
  DepositNoBalanceError,
  EmptyAmountError,
  HighSwapFeeError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  InvalidScalingFactorControllerAddress,
  InvalidSwapFeeError,
  MaxAssetsCountError,
  MinAssetsCountError,
  NegativeAmountError,
  NegativePercentageError,
  NegativeSwapFeeError,
  PercentageSumError,
  ScalingFactorTooLowError,
  ZeroAmountError,
} from "@osmosis-labs/utils";

export type CreatePoolType = PoolType;

export interface CreatePoolConfigOpts {
  minAssetsCount: number;
  maxAssetsCount: number;
}

export const DefaultCreatePoolOpts: CreatePoolConfigOpts = {
  minAssetsCount: 2,
  maxAssetsCount: 4,
};

/** A raw (base unit) balance of a currency. */
export interface CreatePoolBalance {
  currency: AppCurrency;
  /** Amount in base units. */
  amount: string;
}

/** Input state of one asset in a new pool. */
export interface CreatePoolAssetState {
  percentage?: string;
  scalingFactor?: number;
  sendCurrency: AppCurrency;
  /** Raw typed amount, ignored while `fraction` is set. */
  rawAmount: string;
  /** Fraction of the balance to use (1 = max). */
  fraction: number | undefined;
}

export interface CreatePoolState {
  poolType: CreatePoolType | null;
  swapFee: string;
  scalingFactorControllerAddress: string;
  assets: CreatePoolAssetState[];
  acknowledgeFee: boolean;
  duplicateAcknowledged: boolean;
  /** Set by the create-pool UI when an exact-duplicate pool is detected (or
   *  the check is pending) and the user must acknowledge before proceeding. */
  duplicateBlocking: boolean;
}

export const initialCreatePoolState: CreatePoolState = {
  poolType: null,
  swapFee: "0",
  scalingFactorControllerAddress: "",
  assets: [],
  acknowledgeFee: false,
  duplicateAcknowledged: false,
  duplicateBlocking: false,
};

// DERIVED VALUES

/** Balance of the currency, zero if the user holds none. */
export function getBalance(
  balances: CreatePoolBalance[],
  currency: AppCurrency
): CoinPretty {
  const balance = balances.find(
    (bal) => bal.currency.coinMinimalDenom === currency.coinMinimalDenom
  );
  return new CoinPretty(currency, balance?.amount ?? "0");
}

/** Currencies with a positive balance, excluding gamm share tokens. */
export function getSendableCurrencies(
  balances: CreatePoolBalance[]
): AppCurrency[] {
  return balances
    .filter(
      (bal) =>
        new Dec(bal.amount).gt(new Dec(0)) &&
        !bal.currency.coinDenom.toLowerCase().includes("gamm")
    )
    .map((bal) => bal.currency);
}

/** Sendable currencies not yet among the assets. */
export function getRemainingSelectableCurrencies(
  balances: CreatePoolBalance[],
  assets: CreatePoolAssetState[]
): AppCurrency[] {
  return getSendableCurrencies(balances).filter(
    (cur) =>
      assets.find(
        (asset) => asset.sendCurrency.coinMinimalDenom === cur.coinMinimalDenom
      ) == null
  );
}

export function getCanAddAsset(
  balances: CreatePoolBalance[],
  assets: CreatePoolAssetState[],
  opts: CreatePoolConfigOpts
): boolean {
  return (
    assets.length < opts.maxAssetsCount &&
    getRemainingSelectableCurrencies(balances, assets).length > 0
  );
}

/** Human-readable amount. Derived from the balance when a fraction is set. */
export function getAssetAmount(
  asset: CreatePoolAssetState,
  balance: CoinPretty
): string {
  if (asset.fraction != null) {
    if (balance.toDec().lte(new Dec(0))) return "0";

    return balance
      .mul(new Dec(asset.fraction))
      .trim(true)
      .locale(false)
      .hideDenom(true)
      .toString();
  }
  return asset.rawAmount;
}

export function getAssetAmountError(
  amount: string,
  balance: CoinPretty
): Error | undefined {
  if (amount === "") return new EmptyAmountError("Amount is empty");
  if (Number.isNaN(parseFloat(amount))) {
    return new InvalidNumberAmountError("Invalid form of number");
  }
  let dec;
  try {
    dec = new Dec(amount);
    if (dec.equals(new Dec(0))) return new ZeroAmountError("Amount is zero");
  } catch {
    return new InvalidNumberAmountError("Invalid form of number");
  }
  if (dec.lt(new Dec(0))) return new NegativeAmountError("Amount is negative");
  if (dec.gt(balance.toDec())) {
    return new InsufficientAmountError("Insufficient amount");
  }
  return;
}

/** The (non-rounded) percentage for a balanced weighted pool of the current asset count. */
export function getBalancedPercentage(
  poolType: CreatePoolType | null,
  assetCount: number
): RatePretty {
  // A weighted pool with no assets has no balanced share (the legacy getter threw on division by zero)
  if (poolType !== "weighted" || assetCount === 0) {
    return new RatePretty(0).ready(false);
  }
  return new RatePretty(new Dec(1).quo(new Dec(assetCount)));
}

// ERRORS

export function getPositiveBalanceError(
  balances: CreatePoolBalance[]
): Error | undefined {
  if (getSendableCurrencies(balances).length === 0) {
    return new DepositNoBalanceError("You have no assets to deposit");
  }
  return;
}

export function getAssetCountError(
  assetCount: number,
  opts: CreatePoolConfigOpts
): Error | undefined {
  if (assetCount < opts.minAssetsCount) {
    return new MinAssetsCountError(
      `Minimum of ${opts.minAssetsCount} assets required`
    );
  }
  if (assetCount > opts.maxAssetsCount) {
    return new MaxAssetsCountError(
      `Maximumm of ${opts.maxAssetsCount} assets allowed`
    );
  }
  return;
}

export function getPercentageError(
  state: Pick<CreatePoolState, "poolType" | "assets">
): Error | undefined {
  if (state.poolType !== "weighted") return;

  let totalPercentage = new Dec(0);
  for (const asset of state.assets) {
    try {
      if (!asset.percentage) return;
      const percentage = new Dec(asset.percentage);

      if (percentage.lte(new Dec(0))) {
        return new NegativePercentageError("Non-positive percentage");
      }

      totalPercentage = totalPercentage.add(percentage);
    } catch {
      return new InvalidNumberAmountError("Invalid number");
    }
  }
  if (!totalPercentage.equals(new Dec(100))) {
    return new PercentageSumError("Sum of percentages is not 100");
  }
  return;
}

export function getScalingFactorError(
  state: Pick<CreatePoolState, "poolType" | "assets">
): Error | undefined {
  if (state.poolType !== "stable") return;

  for (const asset of state.assets) {
    if (asset.scalingFactor !== undefined && asset.scalingFactor < 1) {
      return new ScalingFactorTooLowError("Scaling factor too low");
    }
  }
  return;
}

export function getSwapFeeError(swapFee: string): Error | undefined {
  try {
    const dec = new Dec(swapFee);
    if (dec.lt(new Dec(0)))
      return new NegativeSwapFeeError("Negative swap fee");
    if (dec.gte(new Dec(100))) return new HighSwapFeeError("Swap fee too high");
  } catch {
    return new InvalidSwapFeeError("Invalid swap fee");
  }
  return;
}

/** Validates the scaling factor controller as a bech32 address. When
 *  `bech32Prefix` is given the address must use it. */
export function getScalingFactorControllerError(
  state: Pick<CreatePoolState, "poolType" | "scalingFactorControllerAddress">,
  bech32Prefix: string | undefined
): Error | undefined {
  if (
    state.poolType !== "stable" ||
    state.scalingFactorControllerAddress === ""
  )
    return;

  try {
    const { prefix } = fromBech32(state.scalingFactorControllerAddress);
    if (bech32Prefix && prefix !== bech32Prefix) {
      throw new Error(`Unexpected bech32 prefix: ${prefix}`);
    }
  } catch {
    return new InvalidScalingFactorControllerAddress(
      "Invalid scaling factor controller address"
    );
  }
  return;
}

// STATE TRANSITIONS

export type CreatePoolAction =
  | { type: "setPoolType"; poolType: CreatePoolType | null }
  | { type: "setSwapFee"; swapFee: string }
  | { type: "setScalingFactorControllerAddress"; address: string }
  | { type: "setAcknowledgeFee"; value: boolean }
  | { type: "setDuplicateAcknowledged"; value: boolean }
  | { type: "setDuplicateBlocking"; value: boolean }
  | {
      type: "addAsset";
      currency: AppCurrency;
      balances: CreatePoolBalance[];
      opts: CreatePoolConfigOpts;
    }
  | { type: "removeAssetAt"; index: number }
  | { type: "setAssetPercentageAt"; index: number; percentage: string }
  | { type: "setScalingFactorAt"; index: number; scalingFactor: string }
  | { type: "setBalancedPercentages" }
  | { type: "setAssetSendCurrencyAt"; index: number; currency: AppCurrency }
  | { type: "setAssetAmountAt"; index: number; amount: string }
  | { type: "setAssetFractionAt"; index: number; fraction: number | undefined };

function updateAsset(
  state: CreatePoolState,
  index: number,
  update: (asset: CreatePoolAssetState) => CreatePoolAssetState
): CreatePoolState {
  if (index < 0 || index >= state.assets.length) return state;
  return {
    ...state,
    assets: state.assets.map((a, i) => (i === index ? update(a) : a)),
  };
}

function setAssetPercentage(
  state: CreatePoolState,
  index: number,
  percentage: string
): CreatePoolState {
  if (state.poolType !== "weighted") return state;
  if (percentage.startsWith(".")) percentage = "0" + percentage;
  return updateAsset(state, index, (a) => ({ ...a, percentage }));
}

export function createPoolReducer(
  state: CreatePoolState,
  action: CreatePoolAction
): CreatePoolState {
  switch (action.type) {
    case "setPoolType":
      return { ...state, poolType: action.poolType };
    case "setSwapFee":
      return { ...state, swapFee: action.swapFee };
    case "setScalingFactorControllerAddress":
      if (state.poolType !== "stable") return state;
      return { ...state, scalingFactorControllerAddress: action.address };
    case "setAcknowledgeFee":
      return { ...state, acknowledgeFee: action.value };
    case "setDuplicateAcknowledged":
      return { ...state, duplicateAcknowledged: action.value };
    case "setDuplicateBlocking":
      return { ...state, duplicateBlocking: action.value };
    case "addAsset": {
      if (!getCanAddAsset(action.balances, state.assets, action.opts)) {
        return state;
      }
      const base = {
        sendCurrency: action.currency,
        rawAmount: "",
        fraction: undefined,
      };
      if (state.poolType === "weighted") {
        return {
          ...state,
          assets: [...state.assets, { ...base, percentage: "0" }],
        };
      }
      if (state.poolType === "stable") {
        return {
          ...state,
          assets: [...state.assets, { ...base, scalingFactor: 1 }],
        };
      }
      return state;
    }
    case "removeAssetAt":
      return {
        ...state,
        assets: state.assets.filter((_, i) => i !== action.index),
      };
    case "setAssetPercentageAt":
      return setAssetPercentage(state, action.index, action.percentage);
    case "setScalingFactorAt": {
      if (state.poolType !== "stable") return state;
      const scalingFactor = parseFloat(action.scalingFactor);
      if (Number.isNaN(scalingFactor)) return state;
      return updateAsset(state, action.index, (a) => ({ ...a, scalingFactor }));
    }
    case "setBalancedPercentages": {
      if (state.poolType !== "weighted") return state;
      const count = state.assets.length;
      let next = state;
      state.assets.forEach((_, index) => {
        next = setAssetPercentage(
          next,
          index,
          new Dec(1)
            .quo(new Dec(count))
            .mul(new Dec(100))
            .add(new Dec(count % 2 === 1 && count - 1 === index ? 1 : 0))
            .truncate()
            .toString()
        );
      });
      return next;
    }
    case "setAssetSendCurrencyAt":
      return updateAsset(state, action.index, (a) => ({
        ...a,
        sendCurrency: action.currency,
      }));
    case "setAssetAmountAt": {
      const amount = action.amount.startsWith(".")
        ? "0" + action.amount
        : action.amount;
      return updateAsset(state, action.index, (a) => ({
        ...a,
        fraction: undefined,
        rawAmount: amount,
      }));
    }
    case "setAssetFractionAt":
      return updateAsset(state, action.index, (a) => ({
        ...a,
        fraction: action.fraction,
      }));
  }
}
