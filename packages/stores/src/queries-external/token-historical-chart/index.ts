import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { TokenHistoricalPrice } from "./types";

/**
 * Time frame represents the amount of minutes per bar, basically price every
 * `tf` minutes. E.g. 5 - Price every 5 minutes, 1440 - price every day, etc.
 *
 * For example, if you want to get the 1 day chart, you should set `tf` to 1440.
 * This will return 365 bars of data for each year. Each year has 525600 minutes,
 * so 525600 / 1440 = 365 bars.
 *
 * 5     - 5 minutes
 * 15    - 15 minutes
 * 30    - 30 minutes
 * 60    - 1 hour also known as '1H' in chart
 * 120   - 2 hours
 * 240   - 4 hours
 * 720   - 12 hours
 * 1440  - 1 day AKA also known as '1D' in chart
 * 10080 - 1 week AKA also known as '1W' in chart
 * 43800 - 1 month AKA also known as '30D' in chart
 */
const AvailableRangeValues = [
  5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800,
] as const;
export type TimeFrame = (typeof AvailableRangeValues)[number];

/** Queries Imperator token history data chart. */
export class ObservableQueryTokenHistoricalChart extends ObservableQueryExternalBase<
  TokenHistoricalPrice[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore,
    protected readonly symbol: string,
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    protected readonly tf: TimeFrame = 60
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

  @computed
  get getRawChartPrices(): TokenHistoricalPrice[] {
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

  @computed
  get getChartPrices(): PricePretty[] | undefined {
    const fiat = this.priceStore.getFiatCurrency("usd");

    if (!this.response || !fiat) return undefined;

    try {
      return this.response.data.map(
        ({ close }) => new PricePretty(fiat, new Dec(close))
      );
    } catch {
      return undefined;
    }
  }
}

export class ObservableQueryTokensHistoricalChart extends HasMapStore<ObservableQueryTokenHistoricalChart> {
  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
    timeseriesBaseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL
  ) {
    super((symbolAndTf: string) => {
      const [symbol, tf] = symbolAndTf.split(",");

      return new ObservableQueryTokenHistoricalChart(
        kvStore,
        timeseriesBaseUrl,
        priceStore,
        symbol,
        Number(tf) as TimeFrame
      );
    });
  }

  get(symbol: string, tf: TimeFrame = 60) {
    if (!symbol) {
      console.warn("ObservableQueryTokensHistoricalChart: symbol is empty.");
    }
    return super.get(
      `${symbol ?? ""},${tf}`
    ) as ObservableQueryTokenHistoricalChart;
  }
}
