import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { ChartPrice, TokenHistoricalPrice } from "./types";
import { IPriceStore } from "src/price";
declare const AvailableRangeValues: readonly [5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800];
declare type Tf = typeof AvailableRangeValues[number];
/** Queries Imperator token history data chart. */
export declare class ObservableQueryTokenHistoricalChart extends ObservableQueryExternalBase<TokenHistoricalPrice[]> {
    protected readonly priceStore: IPriceStore;
    protected readonly symbol: string;
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    protected readonly tf: Tf;
    constructor(kvStore: KVStore, baseURL: string, priceStore: IPriceStore, symbol: string, 
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    tf?: Tf);
    protected canFetch(): boolean;
    readonly getChartPrices: () => ChartPrice[] | undefined;
}
export declare class ObservableQueryTokensHistoricalChart extends HasMapStore<ObservableQueryTokenHistoricalChart> {
    protected readonly priceStore: IPriceStore;
    constructor(kvStore: KVStore, priceStore: IPriceStore, tokenHistoricalBaseUrl?: string);
    get(symbol: string, tf?: Tf): ObservableQueryTokenHistoricalChart;
}
export {};
