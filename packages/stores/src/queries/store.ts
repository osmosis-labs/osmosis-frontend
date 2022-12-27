import { ChainGetter, QueriesSetBase } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryFilteredPools } from "../queries-external/filtered-pools/filtered-pools";
import { ObservableQueryNumPools } from "./pools";
import { ObservableQueryGammPoolShare } from "./pool-share";
import {
  ObservableQueryIncentivizedPools,
  ObservableQueryLockableDurations,
  ObservableQueryPoolsGaugeIds,
} from "./pool-incentives";
import { ObservableQueryEpochs } from "./epochs";
import {
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
  ObservableQueryAccountLocked,
  ObservableSyntheticLockupsByLockId,
} from "./lockup";
import {
  ObservableQueryEpochProvisions,
  ObservableQueryMintParmas,
} from "./mint";
import { ObservableQueryDistrInfo } from "./pool-incentives/distr-info";
import { ObservableQueryGuage } from "./incentives";
import { ObservableQueryPoolCreationFee } from "./pool-creation-fee";
import {
  ObservableQuerySuperfluidDelegations,
  ObservableQuerySuperfluidPools,
  ObservableQuerySuperfluidUndelegations,
  ObservableQuerySuperfluidAssetMultiplier,
  ObservableQuerySuperfluidOsmoEquivalent,
  ObservableQuerySuperfluidParams,
} from "./superfluid-pools";

export interface OsmosisQueries {
  osmosis?: OsmosisQueriesImpl;
}

export const OsmosisQueries = {
  use(
    osmosisChainId: string
  ): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => OsmosisQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        osmosis:
          chainId === osmosisChainId
            ? new OsmosisQueriesImpl(
                queriesSetBase,
                kvStore,
                chainId,
                chainGetter
              )
            : undefined,
      };
    };
  },
};

/** Root queries store for all Osmosis queries. */
export class OsmosisQueriesImpl {
  public readonly queryGammPools: DeepReadonly<ObservableQueryFilteredPools>;
  public readonly queryGammNumPools: DeepReadonly<ObservableQueryNumPools>;
  public readonly queryGammPoolShare: DeepReadonly<ObservableQueryGammPoolShare>;

  public readonly queryLockedCoins: DeepReadonly<ObservableQueryAccountLockedCoins>;
  public readonly querySyntheticLockupsByLockId: DeepReadonly<ObservableSyntheticLockupsByLockId>;
  public readonly queryUnlockingCoins: DeepReadonly<ObservableQueryAccountUnlockingCoins>;
  public readonly queryAccountLocked: DeepReadonly<ObservableQueryAccountLocked>;

  public readonly queryMintParams: DeepReadonly<ObservableQueryMintParmas>;
  public readonly queryEpochProvisions: DeepReadonly<ObservableQueryEpochProvisions>;

  public readonly queryEpochs: DeepReadonly<ObservableQueryEpochs>;

  public readonly queryLockableDurations: DeepReadonly<ObservableQueryLockableDurations>;
  public readonly queryDistrInfo: DeepReadonly<ObservableQueryDistrInfo>;
  public readonly queryIncentivizedPools: DeepReadonly<ObservableQueryIncentivizedPools>;
  public readonly queryGauge: DeepReadonly<ObservableQueryGuage>;
  public readonly queryPoolsGaugeIds: DeepReadonly<ObservableQueryPoolsGaugeIds>;

  public readonly queryPoolCreationFee: DeepReadonly<ObservableQueryPoolCreationFee>;

  public readonly querySuperfluidPools: DeepReadonly<ObservableQuerySuperfluidPools>;
  public readonly querySuperfluidDelegations: DeepReadonly<ObservableQuerySuperfluidDelegations>;
  public readonly querySuperfluidUndelegations: DeepReadonly<ObservableQuerySuperfluidUndelegations>;
  public readonly querySuperfluidParams: DeepReadonly<ObservableQuerySuperfluidParams>;
  public readonly querySuperfluidAssetMultiplier: DeepReadonly<ObservableQuerySuperfluidAssetMultiplier>;
  public readonly querySuperfluidOsmoEquivalent: DeepReadonly<ObservableQuerySuperfluidOsmoEquivalent>;

  constructor(
    queries: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryLockedCoins = new ObservableQueryAccountLockedCoins(
      kvStore,
      chainId,
      chainGetter
    );
    this.querySyntheticLockupsByLockId = new ObservableSyntheticLockupsByLockId(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryUnlockingCoins = new ObservableQueryAccountUnlockingCoins(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryAccountLocked = new ObservableQueryAccountLocked(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryGammNumPools = new ObservableQueryNumPools(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryGammPools = new ObservableQueryFilteredPools(
      kvStore,
      chainId,
      chainGetter,
      this.queryGammNumPools
    );

    this.queryGammPoolShare = new ObservableQueryGammPoolShare(
      this.queryGammPools,
      queries.queryBalances,
      this.queryAccountLocked,
      this.queryLockedCoins,
      this.queryUnlockingCoins
    );

    this.queryMintParams = new ObservableQueryMintParmas(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryEpochProvisions = new ObservableQueryEpochProvisions(
      kvStore,
      chainId,
      chainGetter,
      this.queryMintParams
    );

    this.queryEpochs = new ObservableQueryEpochs(kvStore, chainId, chainGetter);

    this.queryLockableDurations = new ObservableQueryLockableDurations(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDistrInfo = new ObservableQueryDistrInfo(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryGauge = new ObservableQueryGuage(kvStore, chainId, chainGetter);
    this.queryIncentivizedPools = new ObservableQueryIncentivizedPools(
      kvStore,
      chainId,
      chainGetter,
      this.queryLockableDurations,
      this.queryDistrInfo,
      this.queryGammPools,
      this.queryMintParams,
      this.queryEpochProvisions,
      this.queryEpochs,
      this.queryGauge
    );
    this.queryPoolsGaugeIds = new ObservableQueryPoolsGaugeIds(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryPoolCreationFee = new ObservableQueryPoolCreationFee(
      kvStore,
      chainId,
      chainGetter
    );

    this.querySuperfluidPools = new ObservableQuerySuperfluidPools(
      kvStore,
      chainId,
      chainGetter
    );
    this.querySuperfluidDelegations = new ObservableQuerySuperfluidDelegations(
      kvStore,
      chainId,
      chainGetter
    );
    this.querySuperfluidUndelegations =
      new ObservableQuerySuperfluidUndelegations(kvStore, chainId, chainGetter);
    this.querySuperfluidParams = new ObservableQuerySuperfluidParams(
      kvStore,
      chainId,
      chainGetter
    );
    this.querySuperfluidAssetMultiplier =
      new ObservableQuerySuperfluidAssetMultiplier(
        kvStore,
        chainId,
        chainGetter
      );
    this.querySuperfluidOsmoEquivalent =
      new ObservableQuerySuperfluidOsmoEquivalent(
        chainId,
        chainGetter,
        this.querySuperfluidParams,
        this.querySuperfluidAssetMultiplier,
        this.queryGammPools
      );
  }
}
