import { CoinGeckoPriceStore, ChainGetter } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryPools } from "../queries";
import { IntermediateRoute, IPriceStore } from "./types";
/**
 * PoolFallbackPriceStore permits the some currencies that are not listed on CoinGecko
 * to use the spot price of the pool as the intermediate.
 */
export declare class PoolFallbackPriceStore extends CoinGeckoPriceStore implements IPriceStore {
    protected readonly osmosisChainId: string;
    protected readonly chainGetter: ChainGetter;
    protected readonly queryPool: ObservableQueryPools;
    protected _intermidiateRoutes: IntermediateRoute[];
    constructor(osmosisChainId: string, chainGetter: ChainGetter, kvStore: KVStore, supportedVsCurrencies: {
        [vsCurrency: string]: FiatCurrency;
    }, defaultVsCurrency: string, queryPool: ObservableQueryPools, intermidiateRoutes: IntermediateRoute[]);
    get intermediateRoutesMap(): Map<string, IntermediateRoute>;
    getPrice(coinId: string, vsCurrency?: string): number | undefined;
    getPricePretty(coin: CoinPretty, vsCurrency?: string, decimals?: number): string;
}
