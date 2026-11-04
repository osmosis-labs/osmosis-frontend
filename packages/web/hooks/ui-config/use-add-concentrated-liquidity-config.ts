import {
  BigDec,
  calcMarginalPriceImpact,
  calcZapInPositionMinima,
  estimateSqrtPriceAfterSwapIn,
} from "@osmosis-labs/math";
import type { Pool } from "@osmosis-labs/server";
import {
  prepareAddToConcentratedLiquidityPositionMsg,
  prepareCreateConcentratedLiquidityPositionMsg,
  prepareZapInToConcentratedPositionMsg,
} from "@osmosis-labs/tx";
import type { ConcentratedPoolRawResponse } from "@osmosis-labs/types";
import {
  AppCurrency,
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { getChainInfo } from "~/config/chain";
import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
} from "~/hooks/fiat-getters";
import { usePrice } from "~/hooks/queries/assets/use-price";
import {
  SlippageConfig,
  useSlippageConfig,
} from "~/hooks/ui-config/use-slippage-config";
import { ClZapQuote, useClZapQuote } from "~/hooks/use-cl-zap-quote";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { api } from "~/utils/trpc";

import { useWallet } from "../use-wallet";
import {
  AddConcentratedLiquidityAction,
  addConcentratedLiquidityReducer,
  calcDepositPercentages,
  ConcentratedPoolParams,
  CounterpartyPlan,
  counterpartyPlanToActions,
  DepositSide,
  deriveRangeView,
  deriveSingleAssetInputState,
  deriveSingleAssetSwap,
  getQuoteOverBaseMultiplier,
  INITIAL_ADD_CL_STATE,
  InvalidRangeError,
  isInactiveConcentratedPool,
  planCounterpartyUpdate,
  RangeView,
  SingleAssetInputState,
  SingleAssetSwap,
} from "./add-concentrated-liquidity-state";
import {
  calcHighGasFee,
  CL_CREATE_POSITION_GAS,
  ConcentratedDepositAmount,
  createConcentratedDepositAmount,
} from "./concentrated-deposit-amount";

export { InvalidRangeError };

/** Drops the non-serializable `coin` so React Query's structural sharing keeps
 *  the array reference stable across refetches with unchanged balances. */
const selectRawBalances = (
  balances: { denom: string; amount: string }[]
): { denom: string; amount: string }[] =>
  balances.map(({ denom, amount }) => ({ denom, amount }));

/** User input config for eventually sending a valid add concentrated liquidity msg.
 *  A snapshot: it changes identity whenever any value in it changes. Setters are stable.
 */
export interface AddConcentratedLiquidityConfig extends Omit<
  RangeView,
  "range"
> {
  readonly poolId: string;
  /** Concentrated pool info (tick spacing, current sqrt price, currencies) from the pools query. Null until loaded. */
  readonly pool: ConcentratedPoolParams | null;
  /** True when the pool has TVL but no in-range liquidity at the current price. */
  readonly isInactivePool: boolean;
  readonly baseDenom: string;
  readonly quoteDenom: string;
  readonly fullRange: boolean;
  /** Flag indicating that the user prefers superfluid staking for this full range position. */
  readonly shouldBeSuperfluidStaked: boolean;
  readonly depositPercentages: [RatePretty, RatePretty];
  readonly baseDepositAmountIn: ConcentratedDepositAmount;
  readonly quoteDepositAmountIn: ConcentratedDepositAmount;
  readonly error: Error | undefined;
  /** Single-asset deposit (zap-in): one side is provided and part of it swapped. */
  readonly singleAssetMode: boolean;
  readonly singleAssetSide: DepositSide;
  /** The deposit input of the provided side in single-asset mode. */
  readonly singleAssetDepositAmountIn: ConcentratedDepositAmount;
  /** The swap leg in single-asset mode; undefined outside it or before a
   *  positive amount is entered. `swapInAmount` zero means a one-sided range. */
  readonly requiredSwap: SingleAssetSwap | undefined;
  /** Submit state in single-asset mode; undefined outside it or before the pool loads. */
  readonly singleAssetInputState: SingleAssetInputState | undefined;
  readonly setSingleAssetMode: (enabled: boolean) => void;
  readonly setSingleAssetSide: (side: DepositSide) => void;
  readonly setMinRange: (min: string) => void;
  readonly setMaxRange: (max: string) => void;
  readonly setFullRange: (isFullRange: boolean) => void;
  readonly setAnchorAsset: (anchor: DepositSide) => void;
  readonly setBaseDepositAmountMax: () => void;
  readonly setQuoteDepositAmountMax: () => void;
  readonly setElectSuperfluidStaking: (elected: boolean) => void;
}

/** Returns the previous currency object while its identity (denom, decimals, display) is unchanged,
 *  since pool refetches hand out new currency objects every time. */
function useStableCurrency(
  currency: AppCurrency | undefined
): AppCurrency | undefined {
  /* eslint-disable react-hooks/exhaustive-deps */
  return useMemo(
    () => currency,
    [
      currency?.coinMinimalDenom,
      currency?.coinDenom,
      currency?.coinDecimals,
      currency?.coinImageUrl,
    ]
  );
  /* eslint-enable react-hooks/exhaustive-deps */
}

export interface AddConcentratedLiquidityInputs {
  poolId: string;
  /** Currency used until the pool is loaded, and the chain's fee and stake currencies. */
  chain: {
    placeholderCurrency: AppCurrency;
    feeCurrency: Parameters<typeof calcHighGasFee>[0];
    stakeCurrency: AppCurrency;
  };
  pool: Pool | undefined;
  /** Raw user balances (base units). Undefined (loading or no account) reads as zero balances. */
  balances: readonly { denom: string; amount: string }[] | undefined;
  baseDepositPrice: PricePretty | undefined;
  quoteDepositPrice: PricePretty | undefined;
  /** Historical prices with currency decimals; `Infinity` means no data. */
  historicalPriceMinMax: { min: number; max: number } | undefined;
  /** Single-asset mode on first render (the persisted per-pool preference). */
  initialSingleAssetMode?: boolean;
}

/** State and derived values of the add concentrated liquidity config, with no queries or tx sending. */
export function useAddConcentratedLiquidityState({
  poolId,
  chain,
  pool,
  balances,
  baseDepositPrice,
  quoteDepositPrice,
  historicalPriceMinMax,
  initialSingleAssetMode = false,
}: AddConcentratedLiquidityInputs): AddConcentratedLiquidityConfig {
  const [state, dispatch] = useReducer(
    addConcentratedLiquidityReducer,
    INITIAL_ADD_CL_STATE,
    (initial) => ({ ...initial, singleAssetMode: initialSingleAssetMode })
  );

  // pool
  const concentratedPool = pool?.type === "concentrated" ? pool : null;
  const rawPool = concentratedPool?.raw as
    ConcentratedPoolRawResponse | undefined;
  const currentSqrtPriceStr = rawPool?.current_sqrt_price;
  const tickSpacing = rawPool ? Number(rawPool.tick_spacing) : undefined;
  const poolBaseCurrency = useStableCurrency(
    concentratedPool?.reserveCoins[0].currency
  );
  const poolQuoteCurrency = useStableCurrency(
    concentratedPool?.reserveCoins[1].currency
  );
  const isInactivePool = isInactiveConcentratedPool(pool);

  const poolParams = useMemo<ConcentratedPoolParams | null>(() => {
    if (
      currentSqrtPriceStr === undefined ||
      tickSpacing === undefined ||
      !poolBaseCurrency ||
      !poolQuoteCurrency
    )
      return null;
    return {
      baseCurrency: poolBaseCurrency,
      quoteCurrency: poolQuoteCurrency,
      currentSqrtPrice: new BigDec(currentSqrtPriceStr),
      tickSpacing,
    };
  }, [currentSqrtPriceStr, tickSpacing, poolBaseCurrency, poolQuoteCurrency]);

  // setters of the range are no-ops until the pool is available
  const hasPoolRef = useRef(false);
  useEffect(() => {
    hasPoolRef.current = poolParams !== null;
  }, [poolParams]);

  const baseCurrency = poolParams?.baseCurrency ?? chain.placeholderCurrency;
  const quoteCurrency = poolParams?.quoteCurrency ?? chain.placeholderCurrency;

  // historical prices
  const minHistoricalPrice =
    historicalPriceMinMax && historicalPriceMinMax.min !== Infinity
      ? historicalPriceMinMax.min
      : null;
  const maxHistoricalPrice =
    historicalPriceMinMax && historicalPriceMinMax.max !== Infinity
      ? historicalPriceMinMax.max
      : null;

  const prices = useMemo(
    () =>
      baseDepositPrice && quoteDepositPrice
        ? { base: baseDepositPrice, quote: quoteDepositPrice }
        : null,
    [baseDepositPrice, quoteDepositPrice]
  );

  const rangeView = useMemo(
    () =>
      deriveRangeView({
        fullRange: state.fullRange,
        minInput: state.minInput,
        maxInput: state.maxInput,
        baseCurrency,
        quoteCurrency,
        pool: poolParams,
        minHistoricalPrice,
        maxHistoricalPrice,
      }),
    [
      state.fullRange,
      state.minInput,
      state.maxInput,
      baseCurrency,
      quoteCurrency,
      poolParams,
      minHistoricalPrice,
      maxHistoricalPrice,
    ]
  );

  // stable setters
  const setMinRange = useCallback((value: string) => {
    if (!hasPoolRef.current) return;
    dispatch({ type: "setMinRange", value });
  }, []);
  const setMaxRange = useCallback((value: string) => {
    if (!hasPoolRef.current) return;
    dispatch({ type: "setMaxRange", value });
  }, []);
  const setFullRange = useCallback(
    (value: boolean) => dispatch({ type: "setFullRange", value }),
    []
  );
  const setAnchorAsset = useCallback(
    (anchor: DepositSide) => dispatch({ type: "setAnchor", anchor }),
    []
  );
  const setBaseDepositAmountMax = useCallback(
    () => dispatch({ type: "setMax", side: "base" }),
    []
  );
  const setQuoteDepositAmountMax = useCallback(
    () => dispatch({ type: "setMax", side: "quote" }),
    []
  );
  const setElectSuperfluidStaking = useCallback(
    (elected: boolean) => dispatch({ type: "setSuperfluid", elected }),
    []
  );
  const setSingleAssetMode = useCallback(
    (enabled: boolean) => dispatch({ type: "setSingleAssetMode", enabled }),
    []
  );
  const setSingleAssetSide = useCallback(
    (side: DepositSide) => dispatch({ type: "setSingleAssetSide", side }),
    []
  );
  const setBaseAmount = useCallback(
    (amount: string) => dispatch({ type: "setAmount", side: "base", amount }),
    []
  );
  const setQuoteAmount = useCallback(
    (amount: string) => dispatch({ type: "setAmount", side: "quote", amount }),
    []
  );
  const setBaseFraction = useCallback(
    (fraction: number | undefined) =>
      dispatch({ type: "setFraction", side: "base", fraction }),
    []
  );
  const setQuoteFraction = useCallback(
    (fraction: number | undefined) =>
      dispatch({ type: "setFraction", side: "quote", fraction }),
    []
  );

  // deposit inputs
  const rawBalances = useMemo(
    () =>
      new Map<string, string>(
        (balances ?? []).map(({ denom, amount }) => [denom, amount])
      ),
    [balances]
  );

  /** Fee deducted from the max amount of the stake currency, for the create position tx. */
  const createPositionFee = useMemo(
    () => calcHighGasFee(chain.feeCurrency, CL_CREATE_POSITION_GAS),
    [chain.feeCurrency]
  );
  const stakeDenom = chain.stakeCurrency.coinMinimalDenom;
  let baseFee: CoinPretty | undefined;
  let quoteFee: CoinPretty | undefined;
  if (poolParams) {
    if (stakeDenom === baseCurrency.coinMinimalDenom) {
      baseFee = createPositionFee;
    } else if (stakeDenom === quoteCurrency.coinMinimalDenom) {
      quoteFee = createPositionFee;
    }
  }

  const baseRawBalance = rawBalances.get(baseCurrency.coinMinimalDenom);
  const quoteRawBalance = rawBalances.get(quoteCurrency.coinMinimalDenom);

  const baseDepositAmountIn = useMemo(
    () =>
      createConcentratedDepositAmount({
        currency: baseCurrency,
        rawBalance: baseRawBalance,
        state: state.base,
        fee: baseFee,
        setAmount: setBaseAmount,
        setFraction: setBaseFraction,
      }),
    [
      baseCurrency,
      baseRawBalance,
      state.base,
      baseFee,
      setBaseAmount,
      setBaseFraction,
    ]
  );
  const quoteDepositAmountIn = useMemo(
    () =>
      createConcentratedDepositAmount({
        currency: quoteCurrency,
        rawBalance: quoteRawBalance,
        state: state.quote,
        fee: quoteFee,
        setAmount: setQuoteAmount,
        setFraction: setQuoteFraction,
      }),
    [
      quoteCurrency,
      quoteRawBalance,
      state.quote,
      quoteFee,
      setQuoteAmount,
      setQuoteFraction,
    ]
  );

  const { tickRange, baseDepositOnly, quoteDepositOnly, moderatePriceRange } =
    rangeView;

  const depositPercentages = useMemo(
    () =>
      calcDepositPercentages({
        pool: poolParams,
        baseCurrency,
        quoteCurrency,
        baseDepositPrice: prices?.base ?? null,
        quoteDepositPrice: prices?.quote ?? null,
        tickRange,
        baseDepositOnly,
        quoteDepositOnly,
      }),
    [
      poolParams,
      baseCurrency,
      quoteCurrency,
      prices,
      tickRange,
      baseDepositOnly,
      quoteDepositOnly,
    ]
  );

  // Set the initial range to the moderate range, once, when historical prices load.
  const { rangeInitialized } = state;
  useEffect(() => {
    if (
      rangeInitialized ||
      !poolParams ||
      isInactivePool ||
      minHistoricalPrice === null ||
      maxHistoricalPrice === null
    )
      return;

    const multiplicationQuoteOverBase = getQuoteOverBaseMultiplier(
      baseCurrency,
      quoteCurrency
    );
    dispatch({
      type: "initRange",
      min: moderatePriceRange[0].mul(multiplicationQuoteOverBase).toString(),
      max: moderatePriceRange[1].mul(multiplicationQuoteOverBase).toString(),
    });
  }, [
    rangeInitialized,
    poolParams,
    isInactivePool,
    minHistoricalPrice,
    maxHistoricalPrice,
    moderatePriceRange,
    baseCurrency,
    quoteCurrency,
  ]);

  // The non-anchor deposit amount follows the anchor one. Suppressed in
  // single-asset mode, where the counterparty comes from the swap instead.
  const { singleAssetMode, singleAssetSide } = state;
  const counterpartyPlan = useMemo<CounterpartyPlan>(
    () =>
      singleAssetMode
        ? { type: "none" }
        : planCounterpartyUpdate({
            anchor: state.anchor,
            base: baseDepositAmountIn,
            quote: quoteDepositAmountIn,
            pool: poolParams,
            isInactivePool,
            tickRange,
            baseDepositOnly,
            quoteDepositOnly,
            baseDepositPrice: prices?.base ?? null,
            quoteDepositPrice: prices?.quote ?? null,
          }),
    [
      singleAssetMode,
      state.anchor,
      baseDepositAmountIn,
      quoteDepositAmountIn,
      poolParams,
      isInactivePool,
      tickRange,
      baseDepositOnly,
      quoteDepositOnly,
      prices,
    ]
  );
  useEffect(() => {
    if (counterpartyPlan.type === "none" && counterpartyPlan.warning) {
      console.warn(counterpartyPlan.warning);
    }
    counterpartyPlanToActions(counterpartyPlan).forEach(
      (action: AddConcentratedLiquidityAction) => dispatch(action)
    );
  }, [counterpartyPlan]);

  const singleAssetDepositAmountIn =
    singleAssetSide === "base" ? baseDepositAmountIn : quoteDepositAmountIn;
  const requiredSwap = useMemo(
    () =>
      singleAssetMode
        ? deriveSingleAssetSwap({
            side: singleAssetSide,
            input: singleAssetDepositAmountIn,
            counterpartyCurrency:
              singleAssetSide === "base" ? quoteCurrency : baseCurrency,
            pool: poolParams,
            tickRange,
          })
        : undefined,
    [
      singleAssetMode,
      singleAssetSide,
      singleAssetDepositAmountIn,
      baseCurrency,
      quoteCurrency,
      poolParams,
      tickRange,
    ]
  );
  const singleAssetInputState =
    singleAssetMode && poolParams
      ? deriveSingleAssetInputState(singleAssetDepositAmountIn, requiredSwap)
      : undefined;

  const { fullRange } = state;
  const error = useMemo<Error | undefined>(() => {
    if (!fullRange && rangeView.range[0].gte(rangeView.range[1])) {
      return new InvalidRangeError(
        "lower range must be less than upper range."
      );
    }
    // In single-asset mode only the provided side's input is relevant.
    if (singleAssetMode) return singleAssetDepositAmountIn.error;
    if (quoteDepositOnly) return quoteDepositAmountIn.error;
    if (baseDepositOnly) return baseDepositAmountIn.error;
    return baseDepositAmountIn.error || quoteDepositAmountIn.error;
  }, [
    fullRange,
    rangeView.range,
    baseDepositOnly,
    quoteDepositOnly,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    singleAssetMode,
    singleAssetDepositAmountIn,
  ]);

  const shouldBeSuperfluidStaked = state.superfluidStakingElected && fullRange;

  return useMemo(
    () => ({
      ...rangeView,
      poolId,
      pool: poolParams,
      isInactivePool,
      baseDenom: poolParams?.baseCurrency.coinDenom ?? "",
      quoteDenom: poolParams?.quoteCurrency.coinDenom ?? "",
      fullRange,
      shouldBeSuperfluidStaked,
      depositPercentages,
      baseDepositAmountIn,
      quoteDepositAmountIn,
      error,
      singleAssetMode,
      singleAssetSide,
      singleAssetDepositAmountIn,
      requiredSwap,
      singleAssetInputState,
      setSingleAssetMode,
      setSingleAssetSide,
      setMinRange,
      setMaxRange,
      setFullRange,
      setAnchorAsset,
      setBaseDepositAmountMax,
      setQuoteDepositAmountMax,
      setElectSuperfluidStaking,
    }),
    [
      rangeView,
      poolId,
      isInactivePool,
      poolParams,
      fullRange,
      shouldBeSuperfluidStaked,
      depositPercentages,
      baseDepositAmountIn,
      quoteDepositAmountIn,
      error,
      singleAssetMode,
      singleAssetSide,
      singleAssetDepositAmountIn,
      requiredSwap,
      singleAssetInputState,
      setSingleAssetMode,
      setSingleAssetSide,
      setMinRange,
      setMaxRange,
      setFullRange,
      setAnchorAsset,
      setBaseDepositAmountMax,
      setQuoteDepositAmountMax,
      setElectSuperfluidStaking,
    ]
  );
}

/** Provides the add concentrated liquidity config for a React view, plus memoized callbacks
 *  for sending common messages associated with adding concentrated liquidity.
 */
export function useAddConcentratedLiquidityConfig(
  osmosisChainId: string,
  poolId: string
): {
  config: AddConcentratedLiquidityConfig;
  addLiquidity: (superfluidValidatorAddress?: string) => Promise<void>;
  increaseLiquidity: (positionId: string) => Promise<void>;
} & ZapInConfig {
  const apiUtils = api.useUtils();

  const {
    address: walletAddress,
    signAndBroadcast,
    transactionContext,
  } = useWallet(osmosisChainId);
  const address = walletAddress ?? "";

  const chain = useMemo(() => {
    const chainInfo = getChainInfo(osmosisChainId);
    if (chainInfo.currencies.length === 0) {
      throw new Error("Chain doesn't have the sendable currency informations");
    }
    return {
      placeholderCurrency: chainInfo.currencies[0],
      feeCurrency: chainInfo.feeCurrencies[0],
      stakeCurrency: chainInfo.stakeCurrency,
    };
  }, [osmosisChainId]);

  const { data: pool, isFetched: isPoolFetched } =
    api.local.pools.getPool.useQuery(
      { poolId },
      {
        refetchInterval: 5_000, // 5 seconds
      }
    );

  const { data: balances } = api.local.balances.getUserBalances.useQuery(
    { bech32Address: address },
    { enabled: Boolean(address), select: selectRawBalances }
  );

  const { data: baseDepositPrice } = api.edge.assets.getAssetPrice.useQuery({
    coinMinimalDenom: pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
  });

  const { data: quoteDepositPrice } = api.edge.assets.getAssetPrice.useQuery({
    coinMinimalDenom: pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
  });

  const { data: historicalPriceData } =
    api.edge.assets.getAssetPairHistoricalPrice.useQuery(
      {
        poolId,
        baseCoinMinimalDenom:
          pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
        quoteCoinMinimalDenom:
          pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
        timeDuration: "7d",
      },
      { enabled: isPoolFetched }
    );

  // Single-asset mode is a per-pool preference, not shareable state.
  const [persistedSingleAssetMode, setPersistedSingleAssetMode] =
    useLocalStorageState<boolean>(
      `cl-add-position-single-asset-mode:${poolId}`,
      false
    );

  const stateConfig = useAddConcentratedLiquidityState({
    poolId,
    chain,
    pool,
    balances,
    baseDepositPrice,
    quoteDepositPrice,
    historicalPriceMinMax: historicalPriceData,
    initialSingleAssetMode: persistedSingleAssetMode,
  });
  const { setSingleAssetMode: setStateSingleAssetMode } = stateConfig;
  const setSingleAssetMode = useCallback(
    (enabled: boolean) => {
      setStateSingleAssetMode(enabled);
      setPersistedSingleAssetMode(enabled);
    },
    [setStateSingleAssetMode, setPersistedSingleAssetMode]
  );
  const config = useMemo(
    () => ({ ...stateConfig, setSingleAssetMode }),
    [stateConfig, setSingleAssetMode]
  );

  const zap = useZapIn({
    poolId,
    config,
    transactionContext,
    signAndBroadcast,
    apiUtils,
  });

  const {
    baseDepositAmountIn,
    quoteDepositAmountIn,
    baseDepositOnly,
    quoteDepositOnly,
    tickRange,
    pool: clPoolParams,
  } = config;

  const addLiquidity = useCallback(
    (superfluidValidatorAddress?: string) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          const quoteCoin = {
            currency: quoteDepositAmountIn.sendCurrency,
            amount: quoteDepositAmountIn.amount,
          };
          const baseCoin = {
            currency: baseDepositAmountIn.sendCurrency,
            amount: baseDepositAmountIn.amount,
          };
          let quoteDepositValue = undefined;
          let baseDepositValue = undefined;
          if (baseDepositOnly) {
            baseDepositValue = baseCoin;
          } else if (quoteDepositOnly) {
            quoteDepositValue = quoteCoin;
          } else {
            quoteDepositValue = quoteCoin;
            baseDepositValue = baseCoin;
          }

          const clPool = clPoolParams;
          if (!clPool) throw new Error(`Pool #${poolId} not found`);

          await prepareCreateConcentratedLiquidityPositionMsg(
            transactionContext,
            poolId,
            clPool,
            tickRange[0],
            tickRange[1],
            superfluidValidatorAddress,
            baseDepositValue,
            quoteDepositValue,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                // refresh pool data and tick data
                Promise.all([
                  apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange.invalidate(
                    { poolId }
                  ),
                  apiUtils.local.pools.getPool.invalidate({ poolId }),
                ])
                  .then(() => resolve())
                  .catch(reject);
              }
            }
          ).then((prepared) => signAndBroadcast(...prepared));
        } catch (e: any) {
          console.error(e);
          reject(e.message);
        }
      });
    },
    [
      quoteDepositAmountIn.sendCurrency,
      quoteDepositAmountIn.amount,
      baseDepositAmountIn.sendCurrency,
      baseDepositAmountIn.amount,
      baseDepositOnly,
      quoteDepositOnly,
      clPoolParams,
      poolId,
      transactionContext,
      tickRange,
      apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange,
      apiUtils.local.pools.getPool,
      signAndBroadcast,
    ]
  );

  const increaseLiquidity = useCallback(
    (positionId: string) =>
      new Promise<void>(async (resolve, reject) => {
        const coin0 = quoteDepositOnly
          ? {
              denom: baseDepositAmountIn.sendCurrency.coinMinimalDenom,
              amount: "0",
            }
          : baseDepositAmountIn.getAmountPrimitive();
        const coin1 = baseDepositOnly
          ? {
              denom: quoteDepositAmountIn.sendCurrency.coinMinimalDenom,
              amount: "0",
            }
          : quoteDepositAmountIn.getAmountPrimitive();

        try {
          await prepareAddToConcentratedLiquidityPositionMsg(
            transactionContext,
            positionId,
            coin0,
            coin1,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                // refresh pool data and tick data
                Promise.all([
                  apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange.invalidate(
                    { poolId }
                  ),
                  apiUtils.local.pools.getPool.invalidate({ poolId }),
                ])
                  .then(() => resolve())
                  .catch(reject);
              }
            }
          ).then((prepared) => signAndBroadcast(...prepared));
        } catch (e: any) {
          console.error(e);
          reject(e.message);
        }
      }),
    [
      quoteDepositOnly,
      baseDepositAmountIn,
      baseDepositOnly,
      quoteDepositAmountIn,
      transactionContext,
      apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange,
      apiUtils.local.pools.getPool,
      poolId,
      signAndBroadcast,
    ]
  );

  return { config, addLiquidity, increaseLiquidity, ...zap };
}

/** Total zap-in cost (price impact + swap fees) at which the submit Confirm
 *  gate engages, as a fraction of value in. */
const ZAP_HIGH_COST_THRESHOLD = new Dec(0.05);

export interface ZapInConfig {
  /** Swap + create-position in one atomic tx, for single-asset mode. */
  zapInLiquidity: () => Promise<void>;
  zapQuote: ReturnType<typeof useClZapQuote>;
  /** The user's slippage for the swap leg. */
  zapSlippageConfig: SlippageConfig;
  /** Fiat value of the full single-asset deposit; undefined without a quote.
   *  Same single-price calculation as `zapTotalCostPercent`. */
  zapValueIn: PricePretty | undefined;
  /** Fiat value landing in the position (value in minus swap fees and price
   *  impact on the swapped slice); undefined without a quote. */
  zapValueOut: PricePretty | undefined;
  /** Combined zap-in cost as a fraction of value in. For a swap routed through
   *  the destination pool this uses the POST-swap marginal impact when it is
   *  worse than the quoted average fill: arbitrage reverts the moved price
   *  against the in-range LPs, which the depositor is about to become. */
  zapTotalCostPercent: RatePretty | undefined;
  /** True when `zapTotalCostPercent` reaches the high-cost threshold. */
  zapHighCost: boolean;
  /** True while the quote routes through the destination pool but the depth
   *  data for the marginal impact hasn't loaded; submission blocks on this so
   *  the gate never evaluates on the understated average-fill figure. */
  zapImpactPending: boolean;
}

/** Portion of a quote's swap input routed through the destination pool. In an
 *  acyclic route the destination pair pool can only appear as a direct
 *  single-hop route (any other placement revisits a denom), so the amount is
 *  exact from the split. */
function destinationRoutedInput(
  quote: ClZapQuote | undefined,
  poolId: string
): { amount: Int; spread: Dec } {
  const routes = (quote?.split ?? []).filter(
    (route) => route.pools.length === 1 && route.pools[0].id === poolId
  );
  return {
    amount: routes.reduce(
      (sum, route) => sum.add(route.initialAmount),
      new Int(0)
    ),
    // The chain charges the spread factor on token-in before the price math.
    // The un-deducted taker fee overstates the movement slightly, which the
    // pre/post-swap minima envelope absorbs.
    spread: routes[0]?.pools[0].spreadFactor?.toDec() ?? new Dec(0),
  };
}

function useZapIn({
  poolId,
  config,
  transactionContext,
  signAndBroadcast,
  apiUtils,
}: {
  poolId: string;
  config: AddConcentratedLiquidityConfig;
  transactionContext: ReturnType<typeof useWallet>["transactionContext"];
  signAndBroadcast: ReturnType<typeof useWallet>["signAndBroadcast"];
  apiUtils: ReturnType<typeof api.useUtils>;
}): ZapInConfig {
  // Reuses the user's general swap slippage scope.
  const zapSlippageConfig = useSlippageConfig();
  const slippage = zapSlippageConfig.slippage.toDec();

  const {
    requiredSwap,
    singleAssetMode,
    singleAssetSide,
    singleAssetDepositAmountIn,
    pool: clPool,
    tickRange,
  } = config;

  const zapQuote = useClZapQuote({
    tokenInAmount: requiredSwap?.swapInAmount.toString() ?? "0",
    tokenInDenom: requiredSwap?.tokenInCurrency.coinMinimalDenom ?? "",
    tokenOutDenom: requiredSwap?.tokenOutCurrency.coinMinimalDenom ?? "",
    enabled: singleAssetMode && Boolean(requiredSwap?.needsSwap),
  });
  const quote = zapQuote.quote;

  // Marginal impact of the destination-routed slice, over the pool's live
  // tick liquidity. The same simulation runs at submit time for the minima.
  const destination = destinationRoutedInput(quote, poolId);
  const needsMarginalImpact = destination.amount.gt(new Int(0));
  const { data: liquidityDepths } =
    api.local.concentratedLiquidity.getLiquidityPerTickRange.useQuery(
      { poolId },
      { enabled: needsMarginalImpact }
    );
  let marginalImpact: Dec | undefined;
  const spotSqrtPrice = clPool?.currentSqrtPrice;
  if (
    needsMarginalImpact &&
    spotSqrtPrice &&
    !spotSqrtPrice.isZero() &&
    liquidityDepths &&
    liquidityDepths.length > 0
  ) {
    marginalImpact = calcMarginalPriceImpact({
      currentSqrtPrice: spotSqrtPrice,
      postSwapSqrtPrice: estimateSqrtPriceAfterSwapIn({
        tokenInAmount: new Dec(destination.amount)
          .mul(new Dec(1).sub(destination.spread))
          .truncate(),
        inputSide: singleAssetSide,
        currentSqrtPrice: spotSqrtPrice,
        liquidityDepths,
      }),
      inputSide: singleAssetSide,
    });
  }
  const zapImpactPending = needsMarginalImpact && marginalImpact === undefined;

  // Value in, value out and total cost: one calculation shared by the
  // breakdown rows, the rust styling and the Confirm gate, so display and gate
  // can't diverge. Both sides are priced off the single token-in price, so
  // value out can't exceed value in.
  const { price: zapInputPrice } = usePrice(requiredSwap?.tokenInCurrency);
  let zapValueIn: PricePretty | undefined;
  let zapValueOut: PricePretty | undefined;
  let zapTotalCostPercent: RatePretty | undefined;
  if (requiredSwap && quote && zapInputPrice) {
    const valueIn = zapInputPrice.mul(
      new CoinPretty(requiredSwap.tokenInCurrency, requiredSwap.inputAmount)
    );
    if (valueIn.toDec().isPositive()) {
      const swapInValue = zapInputPrice.mul(
        new CoinPretty(requiredSwap.tokenInCurrency, requiredSwap.swapInAmount)
      );
      const retainedValue = zapInputPrice.mul(
        new CoinPretty(
          requiredSwap.tokenInCurrency,
          requiredSwap.inputAmount.sub(requiredSwap.swapInAmount)
        )
      );
      // Worst of the quoted (average-fill) and marginal impacts.
      const quotedImpact = quote.priceImpactTokenOut?.toDec();
      const impact =
        marginalImpact !== undefined &&
        (quotedImpact === undefined || marginalImpact.lt(quotedImpact))
          ? marginalImpact
          : quotedImpact;
      const valueOut = retainedValue.add(
        getTokenOutFiatValue(impact, swapInValue.toDec()).sub(
          getTokenInFeeAmountFiatValue(
            requiredSwap.tokenInCurrency,
            quote.tokenInFeeAmount,
            zapInputPrice
          )
        )
      );
      zapValueIn = valueIn;
      zapValueOut = valueOut;
      zapTotalCostPercent = new RatePretty(
        valueIn.toDec().sub(valueOut.toDec()).quo(valueIn.toDec())
      );
    }
  }
  const zapHighCost = Boolean(
    singleAssetMode && zapTotalCostPercent?.toDec().gte(ZAP_HIGH_COST_THRESHOLD)
  );

  const zapInLiquidity = useCallback(
    () =>
      new Promise<void>(async (resolve, reject) => {
        // Broadcast failures are toasted by the tx client. Failures BEFORE it
        // (stale quote, missing pool price, unavailable depth data) have no
        // other user-visible surface, so the catch below toasts them.
        let broadcastAttempted = false;
        try {
          if (!requiredSwap) throw new Error("No single-asset amount entered");
          if (!clPool) throw new Error(`Pool #${poolId} not found`);
          const [lowerTick, upperTick] = tickRange;

          const onFulfill = (tx: { code?: number; rawLog?: string }) => {
            if (tx.code) reject(tx.rawLog);
            else {
              Promise.all([
                apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange.invalidate(
                  { poolId }
                ),
                apiUtils.local.pools.getPool.invalidate({ poolId }),
              ])
                .then(() => resolve())
                .catch(reject);
            }
          };

          // A two-sided range that needs no swap only because the split
          // truncated to zero (dust input) must not be sent as a one-sided
          // position.
          if (!requiredSwap.needsSwap && !requiredSwap.rangeIsOneSided) {
            throw new Error(
              "Deposit amount too small to compute a swap for this range"
            );
          }

          // Range entirely on the provided side: no swap, create a one-sided
          // position directly with the full provided amount.
          if (!requiredSwap.needsSwap) {
            const provided = {
              currency: singleAssetDepositAmountIn.sendCurrency,
              amount: singleAssetDepositAmountIn.amount,
            };
            broadcastAttempted = true;
            const prepared =
              await prepareCreateConcentratedLiquidityPositionMsg(
                transactionContext,
                poolId,
                clPool,
                lowerTick,
                upperTick,
                undefined,
                singleAssetSide === "base" ? provided : undefined,
                singleAssetSide === "quote" ? provided : undefined,
                undefined,
                undefined,
                onFulfill
              );
            await signAndBroadcast(...prepared);
            return;
          }

          if (!quote || zapQuote.isRefreshing)
            throw new Error("Swap quote not ready");

          const routes = quote.split.map((route) => ({
            pools: route.pools.map((routePool, i: number) => ({
              id: routePool.id,
              tokenOutDenom: route.tokenOutDenoms[i],
            })),
            tokenInAmount: route.initialAmount.toString(),
          }));

          const tokenOutMinAmount = new Dec(quote.amount.toCoin().amount)
            .mul(new Dec(1).sub(slippage))
            .truncate();
          if (tokenOutMinAmount.lte(new Int(0)))
            throw new Error("Swap output floor rounds to zero");

          // `tokensProvided` is the MAX the chain pulls, so each side is an
          // amount the wallet is GUARANTEED to hold after the swap leg: the
          // exact un-swapped remainder, and the swap's guaranteed floor (not
          // the expected output) on the swapped side. A positive-slippage
          // surplus stays as wallet dust rather than reverting the position.
          const providedRemaining = requiredSwap.inputAmount.sub(
            requiredSwap.swapInAmount
          );
          const baseMicro =
            singleAssetSide === "base" ? providedRemaining : tokenOutMinAmount;
          const quoteMicro =
            singleAssetSide === "base" ? tokenOutMinAmount : providedRemaining;
          const tokensProvided = [
            { denom: clPool.baseCurrency.coinMinimalDenom, amount: baseMicro },
            {
              denom: clPool.quoteCurrency.coinMinimalDenom,
              amount: quoteMicro,
            },
          ].map(({ denom, amount }) => ({ denom, amount: amount.toString() }));

          // Minima sit one slippage-width below each side's EXPECTED
          // consumption at the price the position is created at. A route
          // through the destination pool itself moves that price first, so
          // simulate the move over the live tick liquidity and envelope the
          // minima between the pre- and post-swap prices. The depth data is
          // REQUIRED for that route: fail closed rather than compose spot-only
          // minima that the moved price would revert.
          let postSwapSqrtPrice: BigDec | undefined;
          const submitDestination = destinationRoutedInput(quote, poolId);
          if (submitDestination.amount.gt(new Int(0))) {
            const depthsError = new Error(
              "Pool liquidity data required for this swap route could not be loaded, please try again"
            );
            const depths =
              await apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange
                .fetch({ poolId })
                .catch((e) => {
                  console.error(e);
                  throw depthsError;
                });
            if (!depths || depths.length === 0) throw depthsError;
            postSwapSqrtPrice = estimateSqrtPriceAfterSwapIn({
              tokenInAmount: new Dec(submitDestination.amount)
                .mul(new Dec(1).sub(submitDestination.spread))
                .truncate(),
              inputSide: singleAssetSide,
              currentSqrtPrice: clPool.currentSqrtPrice,
              liquidityDepths: depths,
            });
          }

          const minima = calcZapInPositionMinima({
            cap0: baseMicro,
            cap1: quoteMicro,
            lowerTick,
            upperTick,
            currentSqrtPrice: clPool.currentSqrtPrice,
            postSwapSqrtPrice,
            slippage,
          });

          broadcastAttempted = true;
          const prepared = await prepareZapInToConcentratedPositionMsg(
            transactionContext,
            poolId,
            clPool,
            lowerTick,
            upperTick,
            {
              routes,
              tokenInCoinMinimalDenom:
                requiredSwap.tokenInCurrency.coinMinimalDenom,
              tokenOutMinAmount: tokenOutMinAmount.toString(),
            },
            tokensProvided,
            minima.tokenMinAmount0.toString(),
            minima.tokenMinAmount1.toString(),
            undefined,
            onFulfill
          );
          await signAndBroadcast(...prepared);
        } catch (e: unknown) {
          console.error(e);
          const message = e instanceof Error ? e.message : String(e);
          if (!broadcastAttempted) {
            displayToast(
              {
                titleTranslationKey: "errors.generic",
                captionElement: message,
              },
              ToastType.ERROR
            );
          }
          reject(message);
        }
      }),
    [
      requiredSwap,
      clPool,
      poolId,
      tickRange,
      apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange,
      apiUtils.local.pools.getPool,
      singleAssetDepositAmountIn,
      singleAssetSide,
      transactionContext,
      signAndBroadcast,
      quote,
      zapQuote.isRefreshing,
      slippage,
    ]
  );

  return {
    zapInLiquidity,
    zapQuote,
    zapSlippageConfig,
    zapValueIn,
    zapValueOut,
    zapTotalCostPercent,
    zapHighCost,
    zapImpactPending,
  };
}
