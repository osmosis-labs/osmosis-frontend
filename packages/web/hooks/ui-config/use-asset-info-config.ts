import {
  DEFAULT_VS_CURRENCY,
  type TokenHistoricalPrice,
} from "@osmosis-labs/server";
import { PricePretty } from "@osmosis-labs/unit";
import { Time } from "lightweight-charts";
import { useCallback, useMemo, useState } from "react";

import { timepointToString } from "~/components/chart/light-weight-charts/utils";
import { api } from "~/utils/trpc";

import {
  type AssetChartDataType,
  type AssetChartMode,
  type ChartTick,
  type CoingeckoHistoricalPrices,
  filterFutureData,
  getCustomTimeFrame,
  isHistoricalChartStale,
  type PriceRange,
  toCoingeckoHistoricalData,
} from "./asset-info-utils";
import {
  createValueStore,
  INITIAL_ZOOM,
  useNowOnChange,
  useValueStore,
  type ValueStore,
  zoomedIn,
  zoomedOut,
} from "./chart-state";

export {
  AvailablePriceRanges,
  type PriceRange,
  toCoingeckoHistoricalData,
} from "./asset-info-utils";

interface HoverState {
  price?: number;
  time?: Time;
}

const isHoverEqual = (a: HoverState, b: HoverState) =>
  a.price === b.price && a.time === b.time;

/** Chart state that resets whenever the asset changes. */
interface ChartUiState {
  key: string;
  historicalRange: PriceRange;
  dataType: AssetChartDataType;
  mode: AssetChartMode;
  zoom: number;
}

const initialUiState = (key: string): ChartUiState => ({
  key,
  historicalRange: "7d",
  dataType: "price",
  mode: "simple",
  zoom: INITIAL_ZOOM,
});

export interface AssetInfoConfig {
  denom: string;
  coinMinimalDenom?: string;
  historicalRange: PriceRange;
  dataType: AssetChartDataType;
  mode: AssetChartMode;
  historicalChartData: TokenHistoricalPrice[];
  historicalChartUnavailable: boolean;
  isHistoricalDataLoading: boolean;
  historicalChartStale: boolean;
  lastChartData: ChartTick | undefined;
  lastChartTimestampMs: number | undefined;
  /**
   * Pointer-hover values live in an external store so hovering the chart
   * does not re-render everything that reads this config. Read them with
   * `useAssetInfoHover`.
   */
  hoverStore: ValueStore<HoverState>;
  setHoverData: (data?: number, time?: Time) => void;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setHistoricalRange: (range: PriceRange) => void;
  setDataType: (data: AssetChartDataType) => void;
  setMode: (mode: AssetChartMode) => void;
}

/** Hovered price and formatted date; subscribes to hover changes only. */
export function useAssetInfoHover(config: Pick<AssetInfoConfig, "hoverStore">) {
  const { price, time } = useValueStore(config.hoverStore);

  const hoverData = useMemo(() => {
    const fiat = DEFAULT_VS_CURRENCY;
    if (!fiat || price === undefined) return undefined;
    return new PricePretty(fiat, price);
  }, [price]);

  const hoverDate = useMemo(() => {
    if (!time) return null;

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    return timepointToString(time, formatOptions, "en-US");
  }, [time]);

  return { hoverData, hoverDate };
}

export const useAssetInfoConfig = (
  denom: string,
  coinMinimalDenom?: string,
  coingeckoId?: string,
  realtime?: boolean
): AssetInfoConfig => {
  const key = `${denom}|${coinMinimalDenom ?? ""}`;

  const [storedUi, setStoredUi] = useState(() => initialUiState(key));
  // A different asset starts from defaults, as a fresh config used to.
  const ui = useMemo(
    () => (storedUi.key === key ? storedUi : initialUiState(key)),
    [storedUi, key]
  );
  const updateUi = useCallback(
    (patch: (current: ChartUiState) => Partial<ChartUiState>) =>
      setStoredUi((prev) => {
        const current = prev.key === key ? prev : initialUiState(key);
        return { ...current, ...patch(current) };
      }),
    [key]
  );

  const [hoverStore] = useState(() =>
    createValueStore<HoverState>({}, isHoverEqual)
  );
  const setHoverData = useCallback(
    (price?: number, time?: Time) => hoverStore.set({ price, time }),
    [hoverStore]
  );

  const { historicalRange, dataType } = ui;

  const customTimeFrame = useMemo(
    () => getCustomTimeFrame(historicalRange, dataType),
    [historicalRange, dataType]
  );

  const {
    data: historicalPriceData,
    dataUpdatedAt: historicalUpdatedAt,
    isLoading,
    isError,
  } = api.edge.assets.getAssetHistoricalPrice.useQuery(
    {
      coinMinimalDenom: coinMinimalDenom ?? denom,
      timeFrame: {
        custom: customTimeFrame,
      },
      realtime,
    },
    {
      enabled: Boolean(coinMinimalDenom ?? denom),
      staleTime: realtime ? 3000 : 1000 * 60 * 3,
      gcTime: realtime ? 3000 : 1000 * 60 * 6,
      // The procedure's defaults skip focus refetches; realtime prices still
      // need them.
      refetchOnWindowFocus: Boolean(realtime),
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const enableCoinGecko =
    Boolean(coingeckoId) &&
    coingeckoId !== undefined &&
    historicalPriceData !== undefined &&
    historicalPriceData.length === 0 &&
    !isLoading;

  // Stable so React Query keeps the selected array between renders.
  const selectCoingeckoData = useCallback(
    (data: CoingeckoHistoricalPrices) =>
      toCoingeckoHistoricalData(data, historicalRange),
    [historicalRange]
  );

  const {
    data: coingeckoHistoricalPriceData,
    dataUpdatedAt: coingeckoUpdatedAt,
    isLoading: isLoadingCoingecko,
    isError: isErrorCoingecko,
  } = api.edge.assets.getCoingeckoAssetHistoricalPrice.useQuery(
    {
      /**
       * We need to add a fallback but just to avoid ts errors,
       * using `enabled` prop we make sure that we do not trigger
       * the query if the id is undefined
       */
      id: coingeckoId ?? "",
      timeFrame: historicalRange,
    },
    {
      select: selectCoingeckoData,
      enabled: enableCoinGecko,
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 6, // 6 minutes
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const historicalData =
    (enableCoinGecko
      ? (coingeckoHistoricalPriceData ?? historicalPriceData)
      : historicalPriceData) ?? EMPTY_DATA;

  const isHistoricalDataLoading = enableCoinGecko
    ? isLoadingCoingecko
    : isLoading;
  const historicalDataError = enableCoinGecko ? isErrorCoingecko : isError;

  // Independent query for the single most recent price point at the finest
  // available bucket. Used so the stale-data pill shows a consistent
  // "last update" across timeframes instead of jittering with each range's
  // bucket size. The input intentionally does NOT include historicalRange or
  // dataType — those would invalidate the cache on every timeframe switch.
  //
  // Cache + stale times are deliberately decoupled from the `realtime` flag
  // that drives the chart's historical-price query. The pill's underlying
  // datum (the most recent on-chain trade timestamp) only changes when a new
  // trade lands; for a stale asset that's days or weeks apart. A 3s stale
  // time (matching the chart's `realtime` cadence) would refire the query
  // on every focus / remount, and on the cascade path that means up to 3
  // SQS calls (5min → 60min → 1440min) every 3 seconds. Use a 5min stale
  // window + 30min cache so timeframe switches don't refetch and a
  // transitioning asset still recovers within minutes. The pill copy is
  // day-precision anyway, so 5min lag isn't user-visible.
  const { data: latestPricePoint, dataUpdatedAt: latestUpdatedAt } =
    api.edge.assets.getAssetLatestPricePoint.useQuery(
      {
        coinMinimalDenom: coinMinimalDenom ?? denom,
        realtime,
      },
      {
        enabled: Boolean(coinMinimalDenom ?? denom),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        trpc: { context: { skipBatch: true } },
      }
    );

  // A settled `null` (cascade found no data) and `undefined` (not loaded)
  // both mean there is no timestamp.
  const latestPricePointTimeSec = latestPricePoint?.time;

  // "Now" is sampled when the inputs change, not ticked on a timer. It is
  // taken in an effect because the clock is impure.
  const nowMs = useNowOnChange(
    `${key}|${historicalRange}|${historicalUpdatedAt}|${coingeckoUpdatedAt}|${latestUpdatedAt}`
  );

  const historicalChartData = useMemo(
    () => filterFutureData(historicalData, nowMs),
    [historicalData, nowMs]
  );

  const historicalChartUnavailable =
    historicalDataError ||
    (!isHistoricalDataLoading && historicalChartData.length === 0);

  const lastChartData: ChartTick | undefined =
    historicalChartData[historicalChartData.length - 1];

  const historicalChartStale = isHistoricalChartStale({
    isLoading: isHistoricalDataLoading,
    isUnavailable: historicalChartUnavailable,
    usingCoingeckoFallback: enableCoinGecko,
    latestPricePointTimeSec,
    range: historicalRange,
    nowMs,
  });

  const lastChartTimestampMs =
    latestPricePointTimeSec !== undefined
      ? latestPricePointTimeSec * 1000
      : undefined;

  const setZoom = useCallback(
    (zoom: number) => updateUi(() => ({ zoom })),
    [updateUi]
  );
  const resetZoom = useCallback(
    () => updateUi(() => ({ zoom: INITIAL_ZOOM })),
    [updateUi]
  );
  const zoomIn = useCallback(
    () => updateUi((s) => ({ zoom: zoomedIn(s.zoom) })),
    [updateUi]
  );
  const zoomOut = useCallback(
    () => updateUi((s) => ({ zoom: zoomedOut(s.zoom) })),
    [updateUi]
  );
  const setHistoricalRange = useCallback(
    (range: PriceRange) => updateUi(() => ({ historicalRange: range })),
    [updateUi]
  );
  const setDataType = useCallback(
    (data: AssetChartDataType) => updateUi(() => ({ dataType: data })),
    [updateUi]
  );
  const setMode = useCallback(
    (mode: AssetChartMode) => updateUi(() => ({ mode })),
    [updateUi]
  );

  return useMemo(
    () => ({
      denom,
      coinMinimalDenom,
      historicalRange,
      dataType,
      mode: ui.mode,
      historicalChartData,
      historicalChartUnavailable,
      isHistoricalDataLoading,
      historicalChartStale,
      lastChartData,
      lastChartTimestampMs,
      hoverStore,
      setHoverData,
      setZoom,
      resetZoom,
      zoomIn,
      zoomOut,
      setHistoricalRange,
      setDataType,
      setMode,
    }),
    [
      denom,
      coinMinimalDenom,
      historicalRange,
      dataType,
      ui.mode,
      historicalChartData,
      historicalChartUnavailable,
      isHistoricalDataLoading,
      historicalChartStale,
      lastChartData,
      lastChartTimestampMs,
      hoverStore,
      setHoverData,
      setZoom,
      resetZoom,
      zoomIn,
      zoomOut,
      setHistoricalRange,
      setDataType,
      setMode,
    ]
  );
};

const EMPTY_DATA: TokenHistoricalPrice[] = [];
