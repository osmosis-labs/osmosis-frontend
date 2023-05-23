import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import {
  ObservableQueryPool,
  OsmosisQueries,
  PoolGetter,
} from "@osmosis-labs/stores";
import { computedFn } from "mobx-utils";

import { ObservableAssets } from "~/stores/assets";

/** Fetches all pools and filter by approved assets from the assets store */
export class ObservableVerifiedPoolsStore
  implements PoolGetter<ObservableQueryPool>
{
  protected _verifiedPools = new Map<string, ObservableQueryPool>();
  protected _allPools = new Map<string, ObservableQueryPool>();

  constructor(
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    readonly chainId: string,
    protected readonly assetStore: ObservableAssets
  ) {}

  getPool(id: string): ObservableQueryPool | undefined {
    return this._allPools.get(id) ?? this._verifiedPools.get(id);
  }

  poolExists(id: string) {
    return this._allPools.has(id) || this._verifiedPools.has(id);
  }

  paginate() {
    this.queriesStore.get(this.chainId).osmosis?.queryGammPools.paginate();
  }

  fetchRemainingPools() {
    this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.fetchRemainingPools();
  }

  getAllPools = computedFn((showUnverified = false) => {
    const allPools = this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.getAllPools();

    // Add all approved assets to a map for faster lookup.
    const approvedAssets = new Map<string, boolean>();
    const onlyDisplayApprovedAssets = !showUnverified;

    /**
     * Avoid unneeded calculation: skip adding approved assets if we want to show unverified.
     *  */
    if (onlyDisplayApprovedAssets) {
      [
        ...this.assetStore.ibcBalances,
        ...this.assetStore.nativeBalances,
      ].forEach((asset) => {
        approvedAssets.set(asset.balance.denom, true);
      });
    }

    const poolsMap = showUnverified ? this._allPools : this._verifiedPools;

    for (const pool of allPools ?? []) {
      const existingPool = poolsMap.get(pool.id);

      /**
       * If the pool has any asset that is not approved, then skip it.
       * */
      if (
        onlyDisplayApprovedAssets &&
        !pool.poolAssets.every((asset) =>
          Boolean(approvedAssets.get(asset.amount.denom))
        )
      ) {
        continue;
      }

      if (!existingPool) {
        poolsMap.set(pool.id, pool);
      }
    }

    return Array.from(poolsMap.values());
  });
}

export class ObservableVerifiedPoolsStoreMap extends HasMapStore<ObservableVerifiedPoolsStore> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly assetStore: ObservableAssets
  ) {
    super(
      (chainId: string) =>
        new ObservableVerifiedPoolsStore(queriesStore, chainId, assetStore)
    );
  }

  get(chainId: string): ObservableVerifiedPoolsStore {
    return super.get(chainId);
  }
}
