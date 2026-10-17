import { fromBech32 } from "@cosmjs/encoding";
import type { AppCurrency, CoinPretty, RatePretty } from "@osmosis-labs/unit";
import { useCallback, useMemo, useReducer } from "react";

import { api } from "~/utils/trpc";

import {
  CreatePoolBalance,
  CreatePoolConfigOpts,
  createPoolReducer,
  CreatePoolType,
  DefaultCreatePoolOpts,
  getAssetAmount,
  getAssetAmountError,
  getAssetCountError,
  getBalance,
  getBalancedPercentage,
  getCanAddAsset,
  getPercentageError,
  getPositiveBalanceError,
  getRemainingSelectableCurrencies,
  getScalingFactorControllerError,
  getScalingFactorError,
  getSendableCurrencies,
  getSwapFeeError,
  initialCreatePoolState,
} from "./create-pool";

export type { CreatePoolConfigOpts, CreatePoolType };

export type CreatePoolAssetConfig = {
  percentage?: string;
  scalingFactor?: number;
  amountConfig: {
    readonly sendCurrency: AppCurrency;
    readonly fraction: number | undefined;
    readonly isMax: boolean;
    readonly balance: CoinPretty;
    /** Human-readable amount. Derived from the balance when a fraction is set. */
    readonly amount: string;
    readonly error: Error | undefined;
    setSendCurrency: (currency: AppCurrency) => void;
    setAmount: (amount: string) => void;
    setIsMax: (isMax: boolean) => void;
    setFraction: (fraction: number | undefined) => void;
  };
};

export type CreatePoolConfig = {
  readonly sender: string;
  readonly poolType: CreatePoolType | null;
  readonly swapFee: string;
  readonly scalingFactorControllerAddress: string;
  readonly assets: CreatePoolAssetConfig[];
  readonly balances: CreatePoolBalance[];
  readonly acknowledgeFee: boolean;
  readonly duplicateAcknowledged: boolean;
  readonly duplicateBlocking: boolean;
  readonly sendableCurrencies: AppCurrency[];
  readonly remainingSelectableCurrencies: AppCurrency[];
  readonly canAddAsset: boolean;
  readonly balancedPercentage: RatePretty;
  readonly positiveBalanceError: Error | undefined;
  readonly assetCountError: Error | undefined;
  readonly percentageError: Error | undefined;
  readonly scalingFactorError: Error | undefined;
  readonly swapFeeError: Error | undefined;
  readonly amountError: Error | undefined;
  readonly scalingFactorControllerError: Error | undefined;
  setPoolType: (poolType: CreatePoolType | null) => void;
  setSwapFee: (swapFee: string) => void;
  setScalingFactorControllerAddress: (address: string) => void;
  setAcknowledgeFee: (value: boolean) => void;
  setDuplicateAcknowledged: (value: boolean) => void;
  setDuplicateBlocking: (value: boolean) => void;
  addAsset: (currency: AppCurrency) => void;
  removeAssetAt: (index: number) => void;
  setAssetPercentageAt: (index: number, percentage: string) => void;
  setScalingFactorAt: (index: number, scalingFactor: string) => void;
  /** Set percentages for all assets for an evenly balanced pool. */
  setBalancedPercentages: () => void;
};

/** The account prefix of a bech32 address, if it is one. */
function getBech32Prefix(address: string): string | undefined {
  if (!address) return undefined;
  try {
    return fromBech32(address).prefix;
  } catch {
    return undefined;
  }
}

/** State of the create pool flow for the React view lifecycle, with the user's balances from tRPC.
 *  Setters are referentially stable (except `addAsset`, which tracks balances); the returned
 *  object changes identity whenever its state changes.
 *
 *  The scaling factor controller address must share the prefix of `bech32Address`
 *  (the Osmosis account address) when one is given.
 */
export function useCreatePoolConfig(
  bech32Address: string,
  opts: CreatePoolConfigOpts = DefaultCreatePoolOpts
): CreatePoolConfig {
  const [state, dispatch] = useReducer(
    createPoolReducer,
    initialCreatePoolState
  );

  const { data: balanceData } = api.local.balances.getUserBalances.useQuery(
    { bech32Address },
    { enabled: Boolean(bech32Address) }
  );
  const balances = useMemo<CreatePoolBalance[]>(
    () =>
      (balanceData ?? []).flatMap(({ amount, coin }) =>
        coin ? [{ currency: coin.currency, amount }] : []
      ),
    [balanceData]
  );

  const { minAssetsCount, maxAssetsCount } = opts;
  const stableOpts = useMemo(
    () => ({ minAssetsCount, maxAssetsCount }),
    [minAssetsCount, maxAssetsCount]
  );

  const setPoolType = useCallback(
    (poolType: CreatePoolType | null) =>
      dispatch({ type: "setPoolType", poolType }),
    []
  );
  const setSwapFee = useCallback(
    (swapFee: string) => dispatch({ type: "setSwapFee", swapFee }),
    []
  );
  const setScalingFactorControllerAddress = useCallback(
    (address: string) =>
      dispatch({ type: "setScalingFactorControllerAddress", address }),
    []
  );
  const setAcknowledgeFee = useCallback(
    (value: boolean) => dispatch({ type: "setAcknowledgeFee", value }),
    []
  );
  const setDuplicateAcknowledged = useCallback(
    (value: boolean) => dispatch({ type: "setDuplicateAcknowledged", value }),
    []
  );
  const setDuplicateBlocking = useCallback(
    (value: boolean) => dispatch({ type: "setDuplicateBlocking", value }),
    []
  );
  const addAsset = useCallback(
    (currency: AppCurrency) =>
      dispatch({ type: "addAsset", currency, balances, opts: stableOpts }),
    [balances, stableOpts]
  );
  const removeAssetAt = useCallback(
    (index: number) => dispatch({ type: "removeAssetAt", index }),
    []
  );
  const setAssetPercentageAt = useCallback(
    (index: number, percentage: string) =>
      dispatch({ type: "setAssetPercentageAt", index, percentage }),
    []
  );
  const setScalingFactorAt = useCallback(
    (index: number, scalingFactor: string) =>
      dispatch({ type: "setScalingFactorAt", index, scalingFactor }),
    []
  );
  const setBalancedPercentages = useCallback(
    () => dispatch({ type: "setBalancedPercentages" }),
    []
  );

  return useMemo<CreatePoolConfig>(() => {
    const assets = state.assets.map((asset, index): CreatePoolAssetConfig => {
      const balance = getBalance(balances, asset.sendCurrency);
      const amount = getAssetAmount(asset, balance);
      return {
        percentage: asset.percentage,
        scalingFactor: asset.scalingFactor,
        amountConfig: {
          sendCurrency: asset.sendCurrency,
          fraction: asset.fraction,
          isMax: asset.fraction === 1,
          balance,
          amount,
          error: getAssetAmountError(amount, balance),
          setSendCurrency: (currency) =>
            dispatch({ type: "setAssetSendCurrencyAt", index, currency }),
          setAmount: (value) =>
            dispatch({ type: "setAssetAmountAt", index, amount: value }),
          setIsMax: (isMax) =>
            dispatch({
              type: "setAssetFractionAt",
              index,
              fraction: isMax ? 1 : undefined,
            }),
          setFraction: (fraction) =>
            dispatch({ type: "setAssetFractionAt", index, fraction }),
        },
      };
    });

    return {
      sender: bech32Address,
      poolType: state.poolType,
      swapFee: state.swapFee,
      scalingFactorControllerAddress: state.scalingFactorControllerAddress,
      assets,
      balances,
      acknowledgeFee: state.acknowledgeFee,
      duplicateAcknowledged: state.duplicateAcknowledged,
      duplicateBlocking: state.duplicateBlocking,
      sendableCurrencies: getSendableCurrencies(balances),
      remainingSelectableCurrencies: getRemainingSelectableCurrencies(
        balances,
        state.assets
      ),
      canAddAsset: getCanAddAsset(balances, state.assets, stableOpts),
      balancedPercentage: getBalancedPercentage(
        state.poolType,
        state.assets.length
      ),
      positiveBalanceError: getPositiveBalanceError(balances),
      assetCountError: getAssetCountError(state.assets.length, stableOpts),
      percentageError: getPercentageError(state),
      scalingFactorError: getScalingFactorError(state),
      swapFeeError: getSwapFeeError(state.swapFee),
      amountError: assets.find((a) => a.amountConfig.error != null)
        ?.amountConfig.error,
      scalingFactorControllerError: getScalingFactorControllerError(
        state,
        getBech32Prefix(bech32Address)
      ),
      setPoolType,
      setSwapFee,
      setScalingFactorControllerAddress,
      setAcknowledgeFee,
      setDuplicateAcknowledged,
      setDuplicateBlocking,
      addAsset,
      removeAssetAt,
      setAssetPercentageAt,
      setScalingFactorAt,
      setBalancedPercentages,
    };
  }, [
    state,
    balances,
    bech32Address,
    stableOpts,
    setPoolType,
    setSwapFee,
    setScalingFactorControllerAddress,
    setAcknowledgeFee,
    setDuplicateAcknowledged,
    setDuplicateBlocking,
    addAsset,
    removeAssetAt,
    setAssetPercentageAt,
    setScalingFactorAt,
    setBalancedPercentages,
  ]);
}
