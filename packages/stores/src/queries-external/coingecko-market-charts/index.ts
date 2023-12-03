import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { COINGECKO_API_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type ResponseMarketChart = {
  /**
   * [timestamp, price]
   */
  prices: number[][];
  /**
   * [timestamp, price]
   */
  market_caps: number[][];
  /**
   * [timestamp, price]
   */
  total_volumes: number[][];
};

/** Queries CoinGecko API to obtain charts (price, market cap and total volumes) of a token, filtering by its "coingeckoid". */
export class ObservableQueryCoingeckoMarketChartCoin extends ObservableQueryExternalBase<ResponseMarketChart> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore,
    protected readonly coingeckoName: string,
    protected readonly currency: string,
    protected readonly from: number,
    protected readonly to: number
  ) {
    super(
      kvStore,
      baseURL,
      `/v3/coins/${coingeckoName}/market_chart/range?from=${from}&to=${to}&vs_currency=${currency}`
    );

    makeObservable(this);
  }

  /**
   * Returns the asset's prices, based on constructor parameters.
   */
  @computed
  get getRawChartPrices() {
    try {
      if (!this.response || !this.response.data.prices) return [];

      return this.response.data.prices.map(([time, close]) => ({
        close,
        time,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Returns the asset's market caps, based on constructor parameters.
   */
  @computed
  get marketCaps() {
    try {
      if (!this.response || !this.response.data.market_caps) return [];

      return this.response.data.market_caps.map(([time, close]) => ({
        close,
        time,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Returns the asset's total volumes, based on constructor parameters.
   */
  @computed
  get totalVolumes() {
    try {
      if (!this.response || !this.response.data.total_volumes) return [];

      return this.response.data.total_volumes.map(([time, close]) => ({
        close,
        time,
      }));
    } catch {
      return [];
    }
  }
}

export class ObservableQueryCoingeckoMarketChartCoins extends HasMapStore<ObservableQueryCoingeckoMarketChartCoin> {
  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
    timeseriesBaseUrl = COINGECKO_API_DEFAULT_BASEURL
  ) {
    super((params: string) => {
      const currency = this.priceStore.getFiatCurrency("usd");
      const [coingeckoId, from, to] = params.split(",");

      return new ObservableQueryCoingeckoMarketChartCoin(
        kvStore,
        timeseriesBaseUrl,
        priceStore,
        coingeckoId,
        currency?.currency ?? "usd",
        Number(from),
        Number(to)
      );
    });
  }

  /**
   * @param coingeckoId
   * @param from timestamp of starting date range (UNIX TIMESTAMP)
   * @param to timestamp of ending date range (UNIX TIMESTAMP)
   * @returns
   */
  get(coingeckoId: string, from = 0, to = 0) {
    if (to === 0) {
      console.warn(
        "ObservableQueryCoingeckoMarketChartCoins: invalid 'from' params, it's equal to zero"
      );
    }

    if (from === 0) {
      console.warn(
        "ObservableQueryCoingeckoMarketChartCoins: invalid 'from' params, it's equal to zero"
      );
    }

    if (from > to) {
      console.warn(
        "ObservableQueryCoingeckoMarketChartCoins: invalid 'from' params, it can't be greater then 'to'"
      );
    }

    if (!coingeckoId) {
      console.warn(
        "ObservableQueryCoingeckoMarketChartCoins: coingeckoId is empty."
      );
    }

    return super.get(
      `${coingeckoId ?? ""},${from},${to}`
    ) as ObservableQueryCoingeckoMarketChartCoin;
  }
}
