import { ChainGetter, QueriesSetBase } from "@osmosis-labs/keplr-stores";
import type { KVStore } from "@osmosis-labs/utils";
import { DeepReadonly } from "utility-types";

import {
  ObservableQueryPoolGetter,
  ObservableQueryPools as ObservableQueryFilteredPools,
} from "../queries-external/pools";
import {
  ObservableQueryAccountsPositions,
  ObservableQueryLiquidityPositionsById,
} from "./concentrated-liquidity";
import {
  ObservableQueryAccountLocked,
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
} from "./lockup";
import { ObservableQueryPoolShare } from "./pool-share";
import { ObservableQueryNumPools } from "./pools";
import { ObservableQueryAccountsSuperfluidDelegatedClPositions } from "./superfluid-pools";

export interface OsmosisQueries {
  osmosis?: OsmosisQueriesImpl;
}

export const OsmosisQueries = {
  use(
    osmosisChainId: string,
    webApiBaseUrl: string,
    poolIdBlacklist: string[] = [],
    transmuterCodeIds: string[] = [],
    alloyedCodeIds: string[] = [],
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
                webApiBaseUrl,
                poolIdBlacklist,
                transmuterCodeIds,
                alloyedCodeIds,
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
  public readonly queryLiquidityPositionsById: DeepReadonly<ObservableQueryLiquidityPositionsById>;
  public readonly queryAccountsPositions: DeepReadonly<ObservableQueryAccountsPositions>;

  public readonly queryPools: DeepReadonly<ObservableQueryPoolGetter>;
  public readonly queryGammNumPools: DeepReadonly<ObservableQueryNumPools>;
  public readonly queryGammPoolShare: DeepReadonly<ObservableQueryPoolShare>;

  public readonly queryLockedCoins: DeepReadonly<ObservableQueryAccountLockedCoins>;
  public readonly queryUnlockingCoins: DeepReadonly<ObservableQueryAccountUnlockingCoins>;
  public readonly queryAccountLocked: DeepReadonly<ObservableQueryAccountLocked>;

  public readonly queryAccountsSuperfluidDelegatedPositions: DeepReadonly<ObservableQueryAccountsSuperfluidDelegatedClPositions>;

  constructor(
    queries: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    webApiBaseUrl: string,
    poolIdBlacklist: string[] = [],
    transmuterCodeIds: string[] = [],
    alloyedCodeIds: string[] = [],
    isTestnet = false
  ) {
    this.queryLockedCoins = new ObservableQueryAccountLockedCoins(
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

    this.queryLiquidityPositionsById =
      new ObservableQueryLiquidityPositionsById(kvStore, chainId, chainGetter);

    this.queryAccountsPositions = new ObservableQueryAccountsPositions(
      kvStore,
      chainId,
      this.queryLiquidityPositionsById,
      chainGetter
    );

    this.queryPools = new ObservableQueryFilteredPools(
      kvStore,
      chainId,
      webApiBaseUrl,
      chainGetter,
      this.queryGammNumPools,
      poolIdBlacklist,
      transmuterCodeIds,
      alloyedCodeIds,
      isTestnet
    );

    this.queryGammPoolShare = new ObservableQueryPoolShare(
      this.queryPools,
      queries.queryBalances,
      this.queryAccountLocked,
      this.queryLockedCoins,
      this.queryUnlockingCoins,
      this.queryAccountsPositions
    );

    this.queryAccountsSuperfluidDelegatedPositions =
      new ObservableQueryAccountsSuperfluidDelegatedClPositions(
        kvStore,
        chainId,
        chainGetter
      );
  }
}
