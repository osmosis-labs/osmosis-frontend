import type {
  ActiveLiquidityPerTickRange,
  Pool,
  TimeDuration,
  TokenPairHistoricalPrice,
} from "@osmosis-labs/server";
import { Currency } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "~/utils/trpc";

import {
  createValueStore,
  INITIAL_ZOOM,
  useRetainedValue,
  useValueStore,
  type ValueStore,
  zoomedIn,
  zoomedOut,
} from "./chart-state";
import {
  computeDepthChartData,
  computeXRange,
  computeYRange,
  getCurrentPrice,
  getPriceDecimal,
  getQuoteOverBaseMultiplier,
  isEmptyConcentratedPool,
} from "./historical-and-depth-math";

export interface HistoricalAndLiquidityData {
  /** Pool current price, display-adjusted. Zero until the pool loads. */
  currentPrice: Dec;
  pool: (Pool & { poolAssetDenoms: string[] }) | null;
  historicalChartUnavailable: boolean;
  isHistoricalDataLoading: boolean;
  baseDenom: string;
  quoteDenom: string;
  baseCurrency: Currency | undefined;
  quoteCurrency: Currency | undefined;
  /** Use pool current price as last/current chart price. */
  lastChartData: TokenPairHistoricalPrice | null;
  historicalRange: TimeDuration;
  setHistoricalRange: (range: TimeDuration) => void;
  activeLiquidity: ActiveLiquidityPerTickRange[];
  /**
   * Pointer-hover price lives in an external store so hovering the chart
   * does not re-render everything that reads this config. Read it with
   * `useHoverPrice`.
   */
  hoverStore: ValueStore<number>;
  setHoverPrice: (price: number) => void;
  priceDecimal: number;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setPriceRange: (range: [Dec, Dec]) => void;
  historicalChartData: TokenPairHistoricalPrice[];
  /** The selected price range, if any. */
  range: [Dec, Dec] | null;
  yRange: [number, number];
  depthChartData: { price: number; depth: number }[];
  xRange: [number, number];
}

/** Hovered price (the current price when not hovering). */
export function useHoverPrice(
  config: Pick<HistoricalAndLiquidityData, "hoverStore">
): number {
  return useValueStore(config.hoverStore);
}

const EMPTY_DATA: TokenPairHistoricalPrice[] = [];
const EMPTY_LIQUIDITY: ActiveLiquidityPerTickRange[] = [];

export function useHistoricalAndLiquidityData(
  poolId: string
): HistoricalAndLiquidityData {
  const [historicalRange, setHistoricalRange] = useState<TimeDuration>("7d");
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [priceRange, setPriceRange] = useState<[Dec, Dec] | null>(null);
  const [hoverStore] = useState(() => createValueStore(0));
  const setHoverPrice = hoverStore.set;

  const { data: pool } = api.local.pools.getPool.useQuery(
    {
      poolId,
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  // Check if pool is empty (has no initial liquidity)
  // Only applies to concentrated liquidity pools
  const isEmptyPool = isEmptyConcentratedPool(pool);

  const { data: activeLiquidityData } =
    api.local.concentratedLiquidity.getLiquidityPerTickRange.useQuery(
      {
        poolId,
      },
      {
        enabled: !isEmptyPool, // Don't fetch liquidity data for empty pools
      }
    );

  const {
    data: historicalPriceData,
    isLoading,
    isError,
  } = api.edge.assets.getAssetPairHistoricalPrice.useQuery(
    {
      poolId,
      baseCoinMinimalDenom:
        pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
      quoteCoinMinimalDenom:
        pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
      timeDuration: historicalRange,
    },
    {
      enabled: Boolean(pool) && !isEmptyPool, // Don't fetch historical data for empty pools
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  // While a new range loads, keep the last loaded points so the depth
  // chart's price domain does not jump.
  const historicalChartData = useRetainedValue(
    poolId,
    historicalPriceData?.prices,
    EMPTY_DATA
  );

  const poolWithDenoms = useMemo(
    () =>
      pool
        ? {
            ...pool,
            poolAssetDenoms: pool.reserveCoins.map(
              (c) => c.currency.coinMinimalDenom
            ),
          }
        : null,
    [pool]
  );

  const baseCurrency = pool?.reserveCoins?.[0].currency;
  const quoteCurrency = pool?.reserveCoins?.[1].currency;

  const quoteOverBase = useMemo(
    () =>
      getQuoteOverBaseMultiplier(
        baseCurrency?.coinDecimals,
        quoteCurrency?.coinDecimals
      ),
    [baseCurrency?.coinDecimals, quoteCurrency?.coinDecimals]
  );

  const currentPrice = useMemo(
    () => getCurrentPrice(pool, quoteOverBase),
    [pool, quoteOverBase]
  );

  const currentPriceNumber = Number(currentPrice.toString() ?? 0);

  const lastChartData = useMemo<TokenPairHistoricalPrice | null>(() => {
    if (currentPriceNumber === 0) return null;

    return {
      close: currentPriceNumber,
      high: currentPriceNumber,
      low: currentPriceNumber,
      open: currentPriceNumber,
      time: new Date().getTime(),
    };
  }, [currentPriceNumber]);

  // Init hover price to the pool's current price once loaded, and reset it
  // whenever that price or the pool changes (two pools can share a price).
  useEffect(() => {
    if (lastChartData) hoverStore.set(lastChartData.close);
  }, [hoverStore, lastChartData, poolId]);

  const priceDecimal = getPriceDecimal(lastChartData?.close);

  const yRange = useMemo(
    () =>
      computeYRange({
        prices: historicalChartData.map(({ close }) => close),
        currentPrice,
        range: priceRange,
        zoom,
      }),
    [historicalChartData, currentPrice, priceRange, zoom]
  );

  const activeLiquidity = activeLiquidityData ?? EMPTY_LIQUIDITY;

  const depthChartData = useMemo(
    () => computeDepthChartData({ activeLiquidity, yRange, quoteOverBase }),
    [activeLiquidity, yRange, quoteOverBase]
  );

  const xRange = useMemo(() => computeXRange(depthChartData), [depthChartData]);

  const resetZoom = useCallback(() => setZoom(INITIAL_ZOOM), []);
  const zoomIn = useCallback(() => setZoom(zoomedIn), []);
  const zoomOut = useCallback(() => setZoom(zoomedOut), []);

  return useMemo(
    () => ({
      currentPrice,
      pool: poolWithDenoms,
      // What exactly happened isn't important, just that an error occured
      historicalChartUnavailable: isError,
      isHistoricalDataLoading: isLoading,
      baseDenom: pool?.reserveCoins?.[0].denom ?? "",
      quoteDenom: pool?.reserveCoins?.[1].denom ?? "",
      baseCurrency,
      quoteCurrency,
      lastChartData,
      historicalRange,
      setHistoricalRange,
      activeLiquidity,
      hoverStore,
      setHoverPrice,
      priceDecimal,
      setZoom,
      resetZoom,
      zoomIn,
      zoomOut,
      setPriceRange,
      historicalChartData,
      range: priceRange,
      yRange,
      depthChartData,
      xRange,
    }),
    [
      currentPrice,
      poolWithDenoms,
      isError,
      isLoading,
      pool?.reserveCoins,
      baseCurrency,
      quoteCurrency,
      lastChartData,
      historicalRange,
      activeLiquidity,
      hoverStore,
      setHoverPrice,
      priceDecimal,
      resetZoom,
      zoomIn,
      zoomOut,
      historicalChartData,
      priceRange,
      yRange,
      depthChartData,
      xRange,
    ]
  );
}
