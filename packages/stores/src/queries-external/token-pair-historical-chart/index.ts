import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PriceRange, TokenPairHistoricalPrice } from "./types";

const AvailableRangeValues = ["7d", "1mo", "1y"] as const;

/** Queries Imperator token history data chart. */
export class ObservableQueryTokenPairHistoricalChart extends ObservableQueryExternalBase<
  TokenPairHistoricalPrice[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore,
    protected readonly poolId: string,
    protected readonly baseDenom: string,
    protected readonly quoteDenom: string,
    protected readonly priceRange: PriceRange
  ) {
    super(
      kvStore,
      baseURL,
      `/pairs/v1/historical/${poolId}/chart?asset_in=${quoteDenom}&asset_out=${baseDenom}&range=${priceRange}&asset_type=symbol`
    );
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return (
      this.poolId !== "" &&
      AvailableRangeValues.includes(this.priceRange) &&
      this.priceRange != null &&
      this.baseDenom != null &&
      this.quoteDenom != null
    );
  }

  @computed
  get getChartPrices(): TokenPairHistoricalPrice[] {
    if (!this.response) return [];

    try {
      return this.response.data.map((data) => ({
        ...data,
        time: data.time * 1000,
      }));
    } catch {
      return [];
    }
  }
}

export class ObservableQueryTokensPairHistoricalChart extends HasMapStore<ObservableQueryTokenPairHistoricalChart> {
  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
    timeseriesBaseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL
  ) {
    super((symbolTfBaseAndQuote: string) => {
      const [poolId, tf, baseDenom, quoteDenom] =
        symbolTfBaseAndQuote.split(",");

      return new ObservableQueryTokenPairHistoricalChart(
        kvStore,
        timeseriesBaseUrl,
        priceStore,
        poolId,
        baseDenom,
        quoteDenom,
        String(tf) as PriceRange
      );
    });
  }

  get(
    poolId: string,
    priceRange?: PriceRange,
    baseDenom = "",
    quoteDenom = ""
  ) {
    return super.get(
      `${poolId},${priceRange},${baseDenom},${quoteDenom}`
    ) as ObservableQueryTokenPairHistoricalChart;
  }
}

export * from "./types";
