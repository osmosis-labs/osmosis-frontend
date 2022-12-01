import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";

const AvailableRangeValues = [5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800];

/** Queries Imperator token history data chart. */
export class ObservableQueryTokenHistoricalChart extends ObservableQueryExternalBase<any> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore,
    protected readonly symbol: string,
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    protected readonly tf: number = 60
  ) {
    super(kvStore, baseURL, `/tokens/v2/historical/${symbol}/chart?tf=${tf}`);

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return (
      this.symbol !== "" &&
      AvailableRangeValues.includes(this.tf) &&
      this.tf != null &&
      this.symbol != null
    );
  }

  readonly getChart = computedFn(() => {
    if (!this.response) return undefined;

    return this.response.data;
  });
}

export class ObservableQueryTokensHistoricalChart extends HasMapStore<ObservableQueryTokenHistoricalChart> {
  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    tokenHistoricalBaseUrl = "https://api-osmosis.imperator.co"
  ) {
    super((symbolAndTf: string) => {
      const [symbol, tf] = symbolAndTf.split(",");

      return new ObservableQueryTokenHistoricalChart(
        kvStore,
        tokenHistoricalBaseUrl,
        priceStore,
        symbol,
        Number(tf)
      );
    });
  }

  get(symbol: string, tf = 60) {
    return super.get(`${symbol},${tf}`) as ObservableQueryTokenHistoricalChart;
  }
}
