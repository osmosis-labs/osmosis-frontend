import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, Int } from "@keplr-wallet/unit";
import {
  ActiveLiquidityPerTickRange,
  maxSpotPrice,
  minSpotPrice,
  priceToTick,
} from "@osmosis-labs/math";
import {
  ObservableQueryCfmmConcentratedPoolLinks,
  ObservableQueryLiquidityPerTickRange,
  ObservableQueryTokensPairHistoricalChart,
  OsmosisQueries,
  PriceRange,
  TokenPairHistoricalPrice,
} from "@osmosis-labs/stores";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { DeepReadonly } from "utility-types";

const INITIAL_ZOOM = 1.05;
const ZOOM_STEP = 0.05;

// TODO: move to stores package

export class ObservableHistoricalAndLiquidityData {
  /*
   Used to get historical range for price chart
  */
  @observable
  protected _historicalRange: PriceRange = "7d";

  @observable
  protected _zoom: number = INITIAL_ZOOM;

  @observable
  protected _hoverPrice: number = 0;

  @observable
  protected _priceRange: [Dec, Dec] | null = null;

  protected _disposers: (() => void)[] = [];

  constructor(
    protected readonly chainGetter: ChainGetter,
    readonly chainId: string,
    readonly poolId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly queryRange: DeepReadonly<ObservableQueryLiquidityPerTickRange>,
    protected readonly queryCfmmClLink: DeepReadonly<ObservableQueryCfmmConcentratedPoolLinks>,
    protected readonly queryTokenPairHistoricalPrice: DeepReadonly<ObservableQueryTokensPairHistoricalChart>
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
    return this.pool.concentratedLiquidityPoolInfo?.currentPrice ?? new Dec(0);
  }

  @computed
  protected get queries() {
    const osmosisQueries = this.queriesStore.get(this.chainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  @computed
  get pool() {
    return this.queries.queryPools.getPool(this.poolId);
  }

  @computed
  get historicalChartUnavailable(): boolean {
    return (
      !this.queryTokenPairPrice.isFetching &&
      this.historicalChartData.length === 0
    );
  }

  get baseCurrency(): AppCurrency | undefined {
    const baseDenom = this.pool?.poolAssetDenoms[0];

    if (!baseDenom) return undefined;

    return this.chainGetter.getChain(this.chainId).findCurrency(baseDenom);
  }

  get quoteCurrency(): AppCurrency | undefined {
    const quoteDenom = this.pool?.poolAssetDenoms[1];

    if (!quoteDenom) return undefined;

    return this.chainGetter
      .getChain(this.chainId)
      .forceFindCurrency(quoteDenom);
  }

  @computed
  protected get multiplicationQuoteOverBase(): Dec {
    if (!this.pool || this.pool.type !== "concentrated") return new Dec(0);
    return (
      this.pool.concentratedLiquidityPoolInfo?.multiplicationQuoteOverBase ??
      new Dec(1)
    );
  }

  /** Use pool current price as last/current chart price. */
  @computed
  get lastChartData(): TokenPairHistoricalPrice | null {
    const price = Number(
      this.pool?.concentratedLiquidityPoolInfo?.currentPrice ?? 0
    );

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
  setHistoricalRange = (range: PriceRange) => {
    this._historicalRange = range;
  };

  get historicalRange(): PriceRange {
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
    return this.queryTokenPairPrice.getChartPrices;
  }

  @computed
  get queryTokenPairPrice() {
    const linkedCfmmPoolId = this.queryCfmmClLink.getLinkedCfmmPoolId(
      this.poolId
    );

    return this.queryTokenPairHistoricalPrice.get(
      typeof linkedCfmmPoolId === "string"
        ? linkedCfmmPoolId
        : linkedCfmmPoolId === false
        ? this.poolId
        : "", // prevent querying prices until link is resolved
      this.historicalRange,
      this.baseCurrency?.coinMinimalDenom,
      this.quoteCurrency?.coinMinimalDenom
    );
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
}

function getLiqFrom(target: Int, list: ActiveLiquidityPerTickRange[]): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lowerTick.lte(target) && list[i].upperTick.gte(target)) {
      return Number(list[i].liquidityAmount.toString());
    }
  }
  return 0;
}
