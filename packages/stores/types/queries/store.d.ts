import { ObservableQueryPools, ObservableQueryNumPools } from "./pools";
import { ChainGetter, QueriesSetBase } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryGammPoolShare } from "./pool-share";
import { ObservableQueryIncentivizedPools, ObservableQueryLockableDurations } from "./pool-incentives";
import { ObservableQueryEpochs } from "./epochs";
import { ObservableQueryAccountLockedCoins, ObservableQueryAccountUnlockingCoins, ObservableQueryAccountLocked, ObservableSyntheticLockupsByLockId } from "./lockup";
import { ObservableQueryEpochProvisions, ObservableQueryMintParmas } from "./mint";
import { ObservableQueryDistrInfo } from "./pool-incentives/distr-info";
import { ObservableQueryGuage } from "./incentives";
import { ObservableQueryPoolCreationFee } from "./pool-creation-fee";
import { ObservableQuerySuperfluidDelegations, ObservableQuerySuperfluidPools, ObservableQuerySuperfluidUndelegations, ObservableQuerySuperfluidAssetMultiplier, ObservableQuerySuperfluidOsmoEquivalent, ObservableQuerySuperfluidParams } from "./superfluid-pools";
export interface OsmosisQueries {
    osmosis?: OsmosisQueriesImpl;
}
export declare const OsmosisQueries: {
    use(osmosisChainId: string): (queriesSetBase: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) => OsmosisQueries;
};
/** Root queries store for all Osmosis queries. */
export declare class OsmosisQueriesImpl {
    readonly queryGammPools: DeepReadonly<ObservableQueryPools>;
    readonly queryGammNumPools: DeepReadonly<ObservableQueryNumPools>;
    readonly queryGammPoolShare: DeepReadonly<ObservableQueryGammPoolShare>;
    readonly queryLockedCoins: DeepReadonly<ObservableQueryAccountLockedCoins>;
    readonly querySyntheticLockupsByLockId: DeepReadonly<ObservableSyntheticLockupsByLockId>;
    readonly queryUnlockingCoins: DeepReadonly<ObservableQueryAccountUnlockingCoins>;
    readonly queryAccountLocked: DeepReadonly<ObservableQueryAccountLocked>;
    readonly queryMintParams: DeepReadonly<ObservableQueryMintParmas>;
    readonly queryEpochProvisions: DeepReadonly<ObservableQueryEpochProvisions>;
    readonly queryEpochs: DeepReadonly<ObservableQueryEpochs>;
    readonly queryLockableDurations: DeepReadonly<ObservableQueryLockableDurations>;
    readonly queryDistrInfo: DeepReadonly<ObservableQueryDistrInfo>;
    readonly queryIncentivizedPools: DeepReadonly<ObservableQueryIncentivizedPools>;
    readonly queryGauge: DeepReadonly<ObservableQueryGuage>;
    readonly queryPoolCreationFee: DeepReadonly<ObservableQueryPoolCreationFee>;
    readonly querySuperfluidPools: DeepReadonly<ObservableQuerySuperfluidPools>;
    readonly querySuperfluidDelegations: DeepReadonly<ObservableQuerySuperfluidDelegations>;
    readonly querySuperfluidUndelegations: DeepReadonly<ObservableQuerySuperfluidUndelegations>;
    readonly querySuperfluidParams: DeepReadonly<ObservableQuerySuperfluidParams>;
    readonly querySuperfluidAssetMultiplier: DeepReadonly<ObservableQuerySuperfluidAssetMultiplier>;
    readonly querySuperfluidOsmoEquivalent: DeepReadonly<ObservableQuerySuperfluidOsmoEquivalent>;
    constructor(queries: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
}
