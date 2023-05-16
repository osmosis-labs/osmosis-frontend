import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { IMPERATOR_HISTORICAL_DATA_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PriceRange, TokenPairHistoricalPrice } from "./types";

const AvailableRangeValues = ["7d", "1mo", "1y"] as const;
type Tf = PriceRange;

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
    /**
     * Range of historical data
     * Available values: ["7d", "1mo", "1y"]
     */
    protected readonly tf: Tf
  ) {
    super(
      kvStore,
      baseURL,
      `/pairs/v1/historical/${poolId}/chart?asset_in=${baseDenom}&asset_out=${quoteDenom}&range=${tf}&asset_type=symbol`
    );
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return (
      this.poolId !== "" &&
      AvailableRangeValues.includes(this.tf) &&
      this.tf != null &&
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
    tokenHistoricalBaseUrl = IMPERATOR_HISTORICAL_DATA_BASEURL
  ) {
    super((symbolTfBaseAndQuote: string) => {
      const [poolId, tf, baseDenom, quoteDenom] =
        symbolTfBaseAndQuote.split(",");

      return new ObservableQueryTokenPairHistoricalChart(
        kvStore,
        tokenHistoricalBaseUrl,
        priceStore,
        poolId,
        baseDenom,
        quoteDenom,
        String(tf) as Tf
      );
    });
  }

  get(poolId: string, tf?: Tf, baseDenom = "", quoteDenom = "") {
    return super.get(
      `${poolId},${tf},${baseDenom},${quoteDenom}`
    ) as ObservableQueryTokenPairHistoricalChart;
  }
}
