import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, QueriesSetBase } from "@keplr-wallet/stores";
import { autorun } from "mobx";
import { DeepReadonly } from "utility-types";

import { ObservableQueryFilteredPools } from "../queries-external/filtered-pools/filtered-pools";
import {
  ObservableQueryAccountsPositions,
  ObservableQueryAccountsUnbondingPositions,
  ObservableQueryLiquiditiesNetInDirection,
  ObservableQueryLiquiditiesPerTickRange,
  ObservableQueryLiquidityPositionsById,
} from "./concentrated-liquidity";
import { ObservableQueryEpochs } from "./epochs";
import { FallbackStore } from "./fallback-query-store";
import { ObservableQueryGauges } from "./incentives";
import {
  ObservableQueryAccountLocked,
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
  ObservableSyntheticLockupsByLockId,
} from "./lockup";
import {
  ObservableQueryEpochProvisions,
  ObservableQueryMintParmas,
} from "./mint";
import { ObservableQueryPoolCreationFee } from "./pool-creation-fee";
import {
  ObservableQueryIncentivizedPools,
  ObservableQueryLockableDurations,
  ObservableQueryPoolsGaugeIds,
} from "./pool-incentives";
import { ObservableQueryDistrInfo } from "./pool-incentives/distr-info";
import { ObservableQueryGammPoolShare } from "./pool-share";
import {
  ObservableQueryCfmmToConcentratedLiquidityPoolLinks,
  ObservableQueryNumPools,
  ObservableQueryPoolGetter,
  ObservableQueryPools,
} from "./pools";
import {
  ObservableQueryAccountsSuperfluidDelegatedClPositions,
  ObservableQueryAccountsSuperfluidUndelegatingClPositions,
  ObservableQuerySuperfluidAssetMultiplier,
  ObservableQuerySuperfluidDelegations,
  ObservableQuerySuperfluidOsmoEquivalent,
  ObservableQuerySuperfluidParams,
  ObservableQuerySuperfluidPools,
  ObservableQuerySuperfluidUndelegations,
} from "./superfluid-pools";
import { ObservableQueryNodeInfo } from "./tendermint/node-info";

export interface OsmosisQueries {
  osmosis?: OsmosisQueriesImpl;
}

export const OsmosisQueries = {
  use(
    osmosisChainId: string,
    isTestnet = false
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
                chainGetter,
                isTestnet
              )
            : undefined,
      };
    };
  },
};

/** Root queries store for all Osmosis queries. */
export class OsmosisQueriesImpl {
  // concentrated liquidity
  public readonly queryLiquiditiesInNetDirection: DeepReadonly<ObservableQueryLiquiditiesNetInDirection>;
  public readonly queryLiquiditiesPerTickRange: DeepReadonly<ObservableQueryLiquiditiesPerTickRange>;
  public readonly queryLiquidityPositionsById: DeepReadonly<ObservableQueryLiquidityPositionsById>;
  public readonly queryAccountsPositions: DeepReadonly<ObservableQueryAccountsPositions>;
  public readonly queryAccountsUnbondingPositions: DeepReadonly<ObservableQueryAccountsUnbondingPositions>;

  protected _queryPools: DeepReadonly<ObservableQueryPoolGetter>;
  public readonly queryGammNumPools: DeepReadonly<ObservableQueryNumPools>;
  public readonly queryCfmmToConcentratedLiquidityPoolLinks: DeepReadonly<ObservableQueryCfmmToConcentratedLiquidityPoolLinks>;
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
  public readonly queryGauge: DeepReadonly<ObservableQueryGauges>;
  public readonly queryPoolsGaugeIds: DeepReadonly<ObservableQueryPoolsGaugeIds>;

  public readonly queryPoolCreationFee: DeepReadonly<ObservableQueryPoolCreationFee>;

  public readonly querySuperfluidPools: DeepReadonly<ObservableQuerySuperfluidPools>;
  public readonly querySuperfluidDelegations: DeepReadonly<ObservableQuerySuperfluidDelegations>;
  public readonly querySuperfluidUndelegations: DeepReadonly<ObservableQuerySuperfluidUndelegations>;
  public readonly querySuperfluidParams: DeepReadonly<ObservableQuerySuperfluidParams>;
  public readonly querySuperfluidAssetMultiplier: DeepReadonly<ObservableQuerySuperfluidAssetMultiplier>;
  public readonly querySuperfluidOsmoEquivalent: DeepReadonly<ObservableQuerySuperfluidOsmoEquivalent>;
  public readonly queryAccountsSuperfluidDelegatedPositions: DeepReadonly<ObservableQueryAccountsSuperfluidDelegatedClPositions>;
  public readonly queryAccountsSuperfluidUndelegatingPositions: DeepReadonly<ObservableQueryAccountsSuperfluidUndelegatingClPositions>;

  public readonly queryNodeInfo: DeepReadonly<ObservableQueryNodeInfo>;

  get queryPools(): ObservableQueryPoolGetter {
    return this._queryPools;
  }

  constructor(
    queries: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    isTestnet = false
  ) {
    this.queryNodeInfo = new ObservableQueryNodeInfo(
      kvStore,
      chainId,
      chainGetter
    );

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

    this.queryLiquiditiesInNetDirection =
      new ObservableQueryLiquiditiesNetInDirection(
        kvStore,
        chainId,
        chainGetter
      );

    this.queryLiquiditiesPerTickRange =
      new ObservableQueryLiquiditiesPerTickRange(kvStore, chainId, chainGetter);

    this.queryLiquidityPositionsById =
      new ObservableQueryLiquidityPositionsById(kvStore, chainId, chainGetter);

    this.queryAccountsPositions = new ObservableQueryAccountsPositions(
      kvStore,
      chainId,
      this.queryLiquidityPositionsById,
      chainGetter
    );

    this.queryAccountsUnbondingPositions =
      new ObservableQueryAccountsUnbondingPositions(
        kvStore,
        chainId,
        chainGetter
      );

    /** Contains a reference to the currently responsive pool store. */
    const poolsQueryFallbacks = new FallbackStore(
      isTestnet
        ? [
            new ObservableQueryPools(
              kvStore,
              chainId,
              chainGetter,
              this.queryLiquiditiesInNetDirection,
              queries.queryBalances,
              this.queryNodeInfo,
              this.queryGammNumPools
            ),
          ]
        : [
            new ObservableQueryFilteredPools(
              kvStore,
              chainId,
              chainGetter,
              this.queryGammNumPools,
              this.queryLiquiditiesInNetDirection,
              queries.queryBalances
            ),
            new ObservableQueryPools(
              kvStore,
              chainId,
              chainGetter,
              this.queryLiquiditiesInNetDirection,
              queries.queryBalances,
              this.queryNodeInfo,
              this.queryGammNumPools
            ),
          ]
    );
    this._queryPools = poolsQueryFallbacks.responsiveStore;
    // hot swap the pools query store any time the fallback store changes
    autorun(() => {
      this._queryPools = poolsQueryFallbacks.responsiveStore;
    });

    this.queryCfmmToConcentratedLiquidityPoolLinks =
      new ObservableQueryCfmmToConcentratedLiquidityPoolLinks(
        kvStore,
        chainId,
        chainGetter
      );

    this.queryGammPoolShare = new ObservableQueryGammPoolShare(
      this._queryPools,
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
    this.queryGauge = new ObservableQueryGauges(kvStore, chainId, chainGetter);
    this.queryIncentivizedPools = new ObservableQueryIncentivizedPools(
      kvStore,
      chainId,
      chainGetter,
      this.queryLockableDurations,
      this.queryDistrInfo,
      this._queryPools,
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
        this._queryPools
      );

    this.queryAccountsSuperfluidDelegatedPositions =
      new ObservableQueryAccountsSuperfluidDelegatedClPositions(
        kvStore,
        chainId,
        chainGetter
      );
    this.queryAccountsSuperfluidUndelegatingPositions =
      new ObservableQueryAccountsSuperfluidUndelegatingClPositions(
        kvStore,
        chainId,
        chainGetter
      );
  }
}
