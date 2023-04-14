import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { computedFn } from "mobx-utils";
import { ObservableAssets } from "src/assets";

import {
  ObservableQueryPool,
  OsmosisQueries,
  PoolGetterWithoutQuery,
} from "../../queries";

/** Fetches all pools and filter by approved assets from the assets store */
export class AssetFilteredPoolsStore implements PoolGetterWithoutQuery {
  protected _pools = new Map<string, ObservableQueryPool>();

  constructor(
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    readonly chainId: string,
    protected readonly assetStore: ObservableAssets,
    protected readonly isFrontier: boolean
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

  getAllPools = computedFn(() => {
    const allPools = this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.getAllPools();

    // Add all approved assets to a map for faster lookup.
    const approvedAssets = new Map<string, boolean>();

    /**
     * Avoid unneeded calculation: skip adding approved assets if it's Frontier.
     * Frontier will display all pools.
     *  */
    if (!this.isFrontier) {
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
        !this.isFrontier &&
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

export class ObservableAssetFilteredPoolsStore extends HasMapStore<AssetFilteredPoolsStore> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly assetStore: ObservableAssets,
    protected readonly isFrontier: boolean
  ) {
    super(
      (chainId: string) =>
        new AssetFilteredPoolsStore(
          queriesStore,
          chainId,
          assetStore,
          isFrontier
        )
    );
  }

  get(chainId: string): AssetFilteredPoolsStore {
    return super.get(chainId);
  }
}
