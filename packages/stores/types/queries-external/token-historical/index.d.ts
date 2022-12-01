import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";
/** Queries Imperator token history data chart. */
export declare class ObservableQueryTokenHistoricalChart extends ObservableQueryExternalBase<any> {
    protected readonly priceStore: IPriceStore;
    protected readonly symbol: string;
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    protected readonly tf: number;
    constructor(kvStore: KVStore, baseURL: string, priceStore: IPriceStore, symbol: string, 
    /**
     * Range of historical data represented by minutes
     * Available values: 5,15,30,60,120,240,720,1440,10080,43800
     */
    tf?: number);
    protected canFetch(): boolean;
    readonly getChart: () => any;
}
export declare class ObservableQueryTokensHistoricalChart extends HasMapStore<ObservableQueryTokenHistoricalChart> {
    constructor(kvStore: KVStore, priceStore: IPriceStore, tokenHistoricalBaseUrl?: string);
    get(symbol: string, tf?: number): ObservableQueryTokenHistoricalChart;
}
