import { computed, makeObservable } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { TokenHistoricalPrice } from "./types";
import { IPriceStore } from "src/price";
import { Dec, PricePretty } from "@keplr-wallet/unit";

const AvailableRangeValues = [
  5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800,
] as const;
type Tf = typeof AvailableRangeValues[number];

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
    protected readonly tf: Tf = 60
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
    tokenHistoricalBaseUrl = "https://api-osmosis.imperator.co"
  ) {
    super((symbolAndTf: string) => {
      const [symbol, tf] = symbolAndTf.split(",");

      return new ObservableQueryTokenHistoricalChart(
        kvStore,
        tokenHistoricalBaseUrl,
        priceStore,
        symbol,
        Number(tf) as Tf
      );
    });
  }

  get(symbol: string, tf: Tf = 60) {
    return super.get(`${symbol},${tf}`) as ObservableQueryTokenHistoricalChart;
  }
}
