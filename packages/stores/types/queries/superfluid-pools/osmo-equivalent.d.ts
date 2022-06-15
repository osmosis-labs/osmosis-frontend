import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableQuerySuperfluidParams } from "../superfluid-pools/params";
import { ObservableQuerySuperfluidAssetMultiplier } from "../superfluid-pools/asset-multiplier";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { ObservableQueryPools } from "../pools";
export declare class ObservableQuerySuperfluidOsmoEquivalent {
    protected readonly chainId: string;
    protected readonly chainGetter: ChainGetter;
    protected readonly _querySuperfluidParams: ObservableQuerySuperfluidParams;
    protected readonly _querySuperfluidAssetMultiplier: ObservableQuerySuperfluidAssetMultiplier;
    protected readonly _queryPools: ObservableQueryPools;
    constructor(chainId: string, chainGetter: ChainGetter, _querySuperfluidParams: ObservableQuerySuperfluidParams, _querySuperfluidAssetMultiplier: ObservableQuerySuperfluidAssetMultiplier, _queryPools: ObservableQueryPools);
    readonly calculateOsmoEquivalent: (coinPretty: CoinPretty) => CoinPretty;
    readonly calculateOsmoEquivalentMultiplier: (currency: AppCurrency) => Dec;
    /**
     * Estimate the multiplication value to compute the superfluid's APR. We assume that arbitrage trading is going well, not the exact value on the current chain, and estimate only by looking at the pool weight.
     */
    readonly estimatePoolAPROsmoEquivalentMultiplier: (poolId: string) => Dec;
}
