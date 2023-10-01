import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { ObservableQueryExternalBase } from "../base";
import { QuasarVault } from "./types";

export const QUASAR_API_BASEURL = "https://api.quasar.fi";

/** Queries Quasar api to get all vaults that belongs to a cl pool. */
export class ObservableQueryQuasarVaultByPoolId extends ObservableQueryExternalBase<
  QuasarVault[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly poolId: string
  ) {
    super(kvStore, baseURL, `/vaults/by_pool/${poolId}`);

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.poolId);
  }

  @computed
  get vaults(): QuasarVault[] {
    if (!this.response || this.error) return [];
    return this.response.data;
  }
}

export class ObservableQueryQuasarVaultsByPoolsId extends HasMapStore<ObservableQueryQuasarVaultByPoolId> {
  constructor(kvStore: KVStore, indexerBaseUrl = QUASAR_API_BASEURL) {
    super(
      (poolId) =>
        new ObservableQueryQuasarVaultByPoolId(kvStore, indexerBaseUrl, poolId)
    );
  }

  get(poolId: string) {
    return super.get(poolId) as ObservableQueryQuasarVaultByPoolId;
  }
}
