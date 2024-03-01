import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { ChainGetter, IQueriesStore } from "@osmosis-labs/keplr-stores";
import {
  ActiveLiquidityPerTickRange,
  BigDec,
  maxSpotPrice,
  minSpotPrice,
  priceToTick,
} from "@osmosis-labs/math";
import {
  ObservableQueryCfmmConcentratedPoolLinks,
  ObservableQueryLiquidityPerTickRange,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { useEffect, useState } from "react";
import { DeepReadonly } from "utility-types";

import type { Pool } from "~/server/queries/complex/pools";
import type {
  TimeDuration,
  TokenPairHistoricalPrice,
} from "~/server/queries/imperator";
import type { ConcentratedPoolRawResponse } from "~/server/queries/osmosis";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export function useHistoricalAndLiquidityData(
  poolId: string
): ObservableHistoricalAndLiquidityData {
  const { queriesStore, chainStore } = useStore();

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const [config] = useState(
    () =>
      new ObservableHistoricalAndLiquidityData(
        chainStore,
        chainStore.osmosis.chainId,
        poolId,
        queriesStore,
        osmosisQueries.queryLiquiditiesPerTickRange.getForPoolId(poolId),
        osmosisQueries.queryCfmmConcentratedPoolLinks
      )
  );
  // react dev tools will unmount the component so only dispose if
  // in production environment, where the component will only unmount once
  useEffect(
    () => () => {
      if (process.env.NODE_ENV === "production") {
        config.dispose();
      }
    },
    [config]
  );

  const { data: pool } = api.edge.pools.getPool.useQuery(
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
  if (pool) config.setPool(pool);

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
      timeDuration: config.historicalRange,
    },
    {
      enabled: Boolean(pool),
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  if (historicalPriceData) config.setHistoricalData(historicalPriceData.prices);
  config.setIsHistoricalDataLoading(isLoading);
  config.setHistoricalDataError(isError);

  return config;
}

const INITIAL_ZOOM = 1.05;
const ZOOM_STEP = 0.05;

export class ObservableHistoricalAndLiquidityData {
  /*
   Used to get historical range for price chart
  */
  @observable
  protected _historicalRange: TimeDuration = "7d";

  @observable.ref
  protected _historicalData: TokenPairHistoricalPrice[] = [];

  @observable
  protected _historicalDataError: boolean = false;

  @observable
  protected _isHistoricalDataLoading: boolean = false;

  @observable
  protected _zoom: number = INITIAL_ZOOM;

  @observable
  protected _hoverPrice: number = 0;

  @observable
  protected _priceRange: [Dec, Dec] | null = null;

  @observable.ref
  protected _pool: Pool | null = null;

  protected _disposers: (() => void)[] = [];

  constructor(
    protected readonly chainGetter: ChainGetter,
    readonly chainId: string,
    readonly poolId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly queryRange: DeepReadonly<ObservableQueryLiquidityPerTickRange>,
    protected readonly queryCfmmClLink: DeepReadonly<ObservableQueryCfmmConcentratedPoolLinks>
  ) {
    makeObservable(this);

    // Init last hover price to current price in pool once loaded
    this._disposers.push(
      autorun(() => {
        if (this.lastChartData) this.setHoverPrice(this.lastChartData.close);
      })
    );
  }

  @computed
  get currentPrice(): Dec {
    if (!this.pool || this.pool.type !== "concentrated") return new Dec(0);
    const clPoolRaw = this.pool.raw as ConcentratedPoolRawResponse;
    const currentSqrtPrice = new BigDec(clPoolRaw.current_sqrt_price);

    return currentSqrtPrice
      .mul(currentSqrtPrice)
      .toDec()
      .mul(this.multiplicationQuoteOverBase);
  }

  @computed
  protected get queries() {
    const osmosisQueries = this.queriesStore.get(this.chainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  @computed
  get pool() {
    if (!this._pool) return null;

    return {
      ...this._pool,
      poolAssetDenoms: this._pool?.reserveCoins.map(
        (c) => c.currency.coinMinimalDenom
      ),
    };
  }

  @computed
  get historicalChartUnavailable(): boolean {
    return this._historicalDataError;
  }

  @computed
  get isHistoricalDataLoading(): boolean {
    return this._isHistoricalDataLoading;
  }

  get baseDenom(): string {
    return this.pool?.reserveCoins?.[0].denom ?? "";
  }

  get quoteDenom(): string {
    return this.pool?.reserveCoins?.[1].denom ?? "";
  }

  get baseCurrency(): Currency | undefined {
    return this.pool?.reserveCoins?.[0].currency;
  }

  get quoteCurrency(): Currency | undefined {
    return this.pool?.reserveCoins?.[1].currency;
  }

  @computed
  protected get multiplicationQuoteOverBase(): Dec {
    return DecUtils.getTenExponentN(
      (this.baseCurrency?.coinDecimals ?? 0) -
        (this.quoteCurrency?.coinDecimals ?? 0)
    );
  }

  /** Use pool current price as last/current chart price. */
  @computed
  get lastChartData(): TokenPairHistoricalPrice | null {
    const price = Number(this.currentPrice.toString() ?? 0);

    if (price === 0) return null;

    return {
      close: price,
      high: price,
      low: price,
      open: price,
      time: new Date().getTime(),
    };
  }

  @action
  setHistoricalRange = (range: TimeDuration) => {
    this._historicalRange = range;
  };

  get historicalRange(): TimeDuration {
    return this._historicalRange;
  }

  @computed
  get activeLiquidity(): ActiveLiquidityPerTickRange[] {
    return this.queryRange.activeLiquidity;
  }

  @action
  readonly setHoverPrice = (price: number) => {
    this._hoverPrice = price;
  };

  get hoverPrice(): number {
    return this._hoverPrice;
  }

  @computed
  get priceDecimal(): number {
    if (!this.lastChartData) return 2;
    if (this.lastChartData.close <= 0.001) return 5;
    if (this.lastChartData.close <= 0.01) return 4;
    if (this.lastChartData.close <= 0.1) return 3;
    if (this.lastChartData.close < 1) return 3;
    return 2;
  }

  get zoom(): number {
    return this._zoom;
  }

  @action
  readonly setZoom = (zoom: number) => {
    this._zoom = zoom;
  };

  @action
  readonly resetZoom = () => {
    this._zoom = INITIAL_ZOOM;
  };

  @action
  readonly zoomIn = () => {
    this._zoom = Math.max(1, this._zoom - ZOOM_STEP);
  };

  @action
  readonly zoomOut = () => {
    this._zoom = this._zoom + ZOOM_STEP;
  };

  @action
  readonly setPriceRange = (range: [Dec, Dec]) => {
    this._priceRange = range;
  };

  @computed
  get historicalChartData(): TokenPairHistoricalPrice[] {
    return this._historicalData;
  }

  get range(): [Dec, Dec] | null {
    return this._priceRange;
  }

  @computed
  get yRange(): [number, number] {
    const data = this.historicalChartData?.map(({ time, close }) => ({
      time,
      price: close,
    }));
    const zoom = this.zoom;
    const padding = 0.1;

    const prices = data.map((d) => d.price);

    const chartMin =
      this.historicalChartData?.length > 0
        ? Math.max(0, Math.min(...prices))
        : Number(this.currentPrice?.mul(new Dec(0.8)).toString() ?? 0);
    const chartMax =
      this.historicalChartData?.length > 0
        ? Math.max(...prices)
        : Number(this.currentPrice?.mul(new Dec(1.2)).toString() ?? 0);

    const absMax = this.range
      ? Math.max(Number(this.range[1].toString()), chartMax)
      : chartMax;
    const absMin = this.range
      ? Math.min(Number(this.range[0].toString()), chartMin)
      : chartMin;

    const delta = Math.abs(absMax - absMin);

    const minWithPadding = Math.max(0, absMin - delta * padding);
    const maxWithPadding = absMax + delta * padding;

    const zoomAdjustedMin = zoom > 1 ? absMin / zoom : absMin * zoom;
    const zoomAdjustedMax = absMax * zoom;

    let finalMin = minWithPadding;
    let finalMax = maxWithPadding;

    if (zoomAdjustedMin < minWithPadding) finalMin = zoomAdjustedMin;
    if (zoomAdjustedMax > maxWithPadding) finalMax = zoomAdjustedMax;

    return [finalMin, finalMax];
  }

  @computed
  get depthChartData(): { price: number; depth: number }[] {
    const data = this.activeLiquidity;
    const [min, max] = this.yRange;

    if (min === max) return [];

    const depths: { price: number; depth: number }[] = [];

    for (let price = min; price <= max; price += (max - min) / 20) {
      if (this.multiplicationQuoteOverBase.isZero()) continue;

      const spotPriceToConvert = new Dec(price).quo(
        this.multiplicationQuoteOverBase
      );

      depths.push({
        price,
        depth: getLiqFrom(
          priceToTick(
            spotPriceToConvert.gt(maxSpotPrice)
              ? maxSpotPrice
              : spotPriceToConvert.lt(minSpotPrice)
              ? minSpotPrice
              : spotPriceToConvert
          ),
          data
        ),
      });
    }

    return depths;
  }

  @computed
  get xRange(): [number, number] {
    if (!this.depthChartData.length) return [0, 0];

    return [0, Math.max(...this.depthChartData.map((d) => d.depth)) * 1.2];
  }

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }

  @action
  readonly setHistoricalData = (data: TokenPairHistoricalPrice[]) => {
    this._historicalData = data;
  };

  /** What exactly happened isn't important, just that an error occured */
  @action
  readonly setHistoricalDataError = (error: boolean) => {
    this._historicalDataError = error;
  };

  @action
  readonly setIsHistoricalDataLoading = (isLoading: boolean) => {
    this._isHistoricalDataLoading = isLoading;
  };

  @action
  readonly setPool = (pool: Pool) => {
    this._pool = pool;
  };
}

function getLiqFrom(target: Int, list: ActiveLiquidityPerTickRange[]): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lowerTick.lte(target) && list[i].upperTick.gte(target)) {
      return Number(list[i].liquidityAmount.toString());
    }
  }
  return 0;
}
