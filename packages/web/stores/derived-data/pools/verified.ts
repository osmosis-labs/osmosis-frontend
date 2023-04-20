import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import {
  ObservableQueryPool,
  OsmosisQueries,
  PoolGetter,
} from "@osmosis-labs/stores";
import { computedFn } from "mobx-utils";

import { IS_FRONTIER } from "~/config";
import { ObservableAssets } from "~/stores/assets";

/** Fetches all pools and filter by approved assets from the assets store */
export class ObservableVerifiedPoolsStore
  implements PoolGetter<ObservableQueryPool>
{
  protected _pools = new Map<string, ObservableQueryPool>();

  constructor(
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    readonly chainId: string,
    protected readonly assetStore: ObservableAssets
  ) {}

  getPool(id: string): ObservableQueryPool | undefined {
    return this._pools.get(id);
  }

  poolExists(id: string) {
    return this._pools.has(id);
  }

  paginate() {
    this.queriesStore.get(this.chainId).osmosis?.queryGammPools.paginate();
  }

  fetchRemainingPools() {
    this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.fetchRemainingPools();
  }

  getAllPools = computedFn((showUnverified?: boolean) => {
    const allPools = this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.getAllPools();

    // Add all approved assets to a map for faster lookup.
    const approvedAssets = new Map<string, boolean>();
    const filterByApprovedAssets = !IS_FRONTIER && !showUnverified;

    /**
     * Avoid unneeded calculation: skip adding approved assets if it's Frontier or we want to force show unverified.
     * Frontier will display all pools.
     *  */
    if (filterByApprovedAssets) {
      [
        ...this.assetStore.ibcBalances,
        ...this.assetStore.nativeBalances,
      ].forEach((asset) => {
        approvedAssets.set(asset.balance.denom, true);
      });
    }

    for (const pool of allPools ?? []) {
      const existingPool = this._pools.get(pool.id);

      /**
       * If the pool has any asset that is not approved, then skip it.
       * This verification is only needed on the main site.
       * */
      if (
        filterByApprovedAssets &&
        !pool.poolAssets.every((asset) =>
          Boolean(approvedAssets.get(asset.amount.denom))
        )
      ) {
        continue;
      }

      if (!existingPool) {
        this._pools.set(pool.id, pool);
      }
    }

    return Array.from(this._pools.values());
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
