import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { TokenData } from "./types";
import { RatePretty } from "@keplr-wallet/unit";
/** Queries Imperator token history data chart. */
export declare class ObservableQueryTokenData extends ObservableQueryExternalBase<TokenData[]> {
    protected readonly symbol: string;
    constructor(kvStore: KVStore, baseURL: string, symbol: string);
    protected canFetch(): boolean;
    readonly get24hrChange: () => RatePretty | undefined;
}
export declare class ObservableQueryTokensData extends HasMapStore<ObservableQueryTokenData> {
    constructor(kvStore: KVStore, tokenDataBaseUrl?: string);
    get(symbol: string): ObservableQueryTokenData;
}
