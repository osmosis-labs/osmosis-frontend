import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";
import { TokenHistoricalPrice } from "./types";
declare const AvailableRangeValues: readonly [5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800];
declare type Tf = typeof AvailableRangeValues[number];
/** Queries Imperator token history data chart. */
export declare class ObservableQueryTokenHistoricalData extends ObservableQueryExternalBase<TokenHistoricalPrice[]> {
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
    readonly getChart: () => TokenHistoricalPrice[] | undefined;
}
export declare class ObservableQueryTokensHistoricalData extends HasMapStore<ObservableQueryTokenHistoricalData> {
    constructor(kvStore: KVStore, priceStore: IPriceStore, tokenHistoricalBaseUrl?: string);
    get(symbol: string): ObservableQueryTokenHistoricalData;
}
export {};
