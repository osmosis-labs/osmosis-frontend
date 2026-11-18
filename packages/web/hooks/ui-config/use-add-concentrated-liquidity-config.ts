import { BigDec } from "@osmosis-labs/math";
import type { Pool } from "@osmosis-labs/server";
import {
  prepareAddToConcentratedLiquidityPositionMsg,
  prepareCreateConcentratedLiquidityPositionMsg,
} from "@osmosis-labs/tx";
import type { ConcentratedPoolRawResponse } from "@osmosis-labs/types";
import {
  AppCurrency,
  CoinPretty,
  Dec,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { getChainInfo } from "~/config/chain";
import { api } from "~/utils/trpc";

import { useWallet } from "../use-wallet";
import {
  AddConcentratedLiquidityAction,
  addConcentratedLiquidityReducer,
  calcDepositPercentages,
  ConcentratedPoolParams,
  counterpartyPlanToActions,
  DepositSide,
  deriveRangeView,
  getQuoteOverBaseMultiplier,
  INITIAL_ADD_CL_STATE,
  InvalidRangeError,
  isInactiveConcentratedPool,
  planCounterpartyUpdate,
  RangeView,
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
  readonly setMinRange: (min: string) => void;
  readonly setMaxRange: (max: string) => void;
  readonly setFullRange: (isFullRange: boolean) => void;
  readonly setAnchorAsset: (anchor: DepositSide) => void;
  readonly setBaseDepositAmountMax: () => void;
  readonly setQuoteDepositAmountMax: () => void;
  readonly setElectSuperfluidStaking: (elected: boolean) => void;
  /** Lookback in days the sliders-driven range strategy optimizes against. */
  readonly lookbackDays: number;
  readonly setLookbackDays: (days: number) => void;
  /** Subset of the 1-year series covering the active lookback window. */
  readonly historicalPrices: HistoricalPricePoint[];
  /** The 1-year series as Dec closes in display units, directly comparable
   *  against `rangeWithCurrencyDecimals` and `currentPriceWithDecimals`. */
  readonly allHistoricalPricesInDisplayUnits: {
    time: number;
    close: Dec;
  }[];
  /** 7-day min/max, with currency decimals; null without data. */
  readonly minHistoricalPrice: number | null;
  readonly maxHistoricalPrice: number | null;
}

export type HistoricalPricePoint = { time: number; close: number };

/** Default lookback in days for the sliders-driven range strategy. Matches
 *  the 7-day window of the moderate/aggressive presets. */
const DEFAULT_LOOKBACK_DAYS = 7;

const MS_PER_DAY = 86_400_000;

const EMPTY_HISTORICAL_PRICES: HistoricalPricePoint[] = [];

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
  /** 1-year price series (display units) for the advanced range sliders and backtest. */
  historicalPrices?: HistoricalPricePoint[];
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
  historicalPrices: allHistoricalPrices = EMPTY_HISTORICAL_PRICES,
}: AddConcentratedLiquidityInputs): AddConcentratedLiquidityConfig {
  const [state, dispatch] = useReducer(
    addConcentratedLiquidityReducer,
    INITIAL_ADD_CL_STATE
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

  // advanced range strategy: the lookback slider filters the 1-year series
  // client-side so any window works without new fetches
  const [lookbackDays, setLookbackDaysState] = useState(DEFAULT_LOOKBACK_DAYS);
  const setLookbackDays = useCallback(
    (days: number) => setLookbackDaysState(Math.max(0, days)),
    []
  );
  // the window ends at mount time, which keeps the filter pure
  const [nowMs] = useState(() => Date.now());
  const historicalPrices = useMemo(() => {
    if (allHistoricalPrices.length === 0) return EMPTY_HISTORICAL_PRICES;
    const cutoff = nowMs - lookbackDays * MS_PER_DAY;
    return allHistoricalPrices.filter((p) => p.time >= cutoff);
  }, [allHistoricalPrices, lookbackDays, nowMs]);
  // The data service already returns display prices, so no decimal shift here
  // (shifting again moved the series by 10^(baseDecimals - quoteDecimals) on
  // pairs with unequal exponents).
  const allHistoricalPricesInDisplayUnits = useMemo(
    () =>
      allHistoricalPrices.map((p) => ({
        time: p.time,
        close: new Dec(p.close),
      })),
    [allHistoricalPrices]
  );

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

  // The non-anchor deposit amount follows the anchor one.
  const counterpartyPlan = useMemo(
    () =>
      planCounterpartyUpdate({
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

  const { fullRange } = state;
  const error = useMemo<Error | undefined>(() => {
    if (!fullRange && rangeView.range[0].gte(rangeView.range[1])) {
      return new InvalidRangeError(
        "lower range must be less than upper range."
      );
    }
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
      setMinRange,
      setMaxRange,
      setFullRange,
      setAnchorAsset,
      setBaseDepositAmountMax,
      setQuoteDepositAmountMax,
      setElectSuperfluidStaking,
      lookbackDays,
      setLookbackDays,
      historicalPrices,
      allHistoricalPricesInDisplayUnits,
      minHistoricalPrice,
      maxHistoricalPrice,
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
      setMinRange,
      setMaxRange,
      setFullRange,
      setAnchorAsset,
      setBaseDepositAmountMax,
      setQuoteDepositAmountMax,
      setElectSuperfluidStaking,
      lookbackDays,
      setLookbackDays,
      historicalPrices,
      allHistoricalPricesInDisplayUnits,
      minHistoricalPrice,
      maxHistoricalPrice,
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
} {
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

  // 1-year fetch: drives the advanced sliders and backtest. The 7-day fetch
  // above still drives the moderate/aggressive presets.
  const { data: longHistoricalPriceData } =
    api.edge.assets.getAssetPairHistoricalPrice.useQuery(
      {
        poolId,
        baseCoinMinimalDenom:
          pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
        quoteCoinMinimalDenom:
          pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
        timeDuration: "1y",
      },
      { enabled: isPoolFetched }
    );

  const config = useAddConcentratedLiquidityState({
    poolId,
    chain,
    pool,
    balances,
    baseDepositPrice,
    quoteDepositPrice,
    historicalPriceMinMax: historicalPriceData,
    historicalPrices: longHistoricalPriceData?.prices,
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

  return { config, addLiquidity, increaseLiquidity };
}
