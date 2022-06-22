import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery, QueryResponse } from "@keplr-wallet/stores";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { IPriceStore } from "../../price";
import { ObservableQueryNumPools } from "./num-pools";
import { ObservableQueryPool } from "./pool";
import { Pools } from "./types";
export declare class ObservableQueryPools extends ObservableChainQuery<Pools> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, queryNumPools: ObservableQueryNumPools, limit?: number);
    protected setResponse(response: Readonly<QueryResponse<Pools>>): void;
    /** Returns `undefined` if the pool does not exist or the data has not loaded. */
    readonly getPool: (id: string) => ObservableQueryPool | undefined;
    /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
    readonly poolExists: (id: string) => boolean | undefined;
    readonly computeAllTotalValueLocked: (priceStore: IPriceStore) => PricePretty;
    readonly getAllPools: () => ObservableQueryPool[];
}
