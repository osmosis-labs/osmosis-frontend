import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { MigrationRecords } from "./types";

export class ObservableQueryCfmmConcentratedPoolLinks extends ObservableChainQuery<MigrationRecords> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/gamm/v1beta1/cfmm_concentrated_pool_links"
    );

    makeObservable(this);
  }

  /** Link to concentrated liquidity pool from the given balancer/cfmm pool ID.
   *  Returns `undefined` if not loaded, `false`, if nonexistent, or the CL pool ID if it exists. */
  readonly getLinkedConcentratedPoolId = computedFn(
    (cfmmPooLId): string | false | undefined => {
      if (!this.response) return;

      return (
        this.response.data.migration_records.balancer_to_concentrated_pool_links.find(
          (record) => record.balancer_pool_id === cfmmPooLId
        )?.cl_pool_id ?? false
      );
    }
  );

  /**
   * Link to CFMM pool from the given CL pool ID.
   * Returns `undefined` if not loaded, `false`, if nonexistent, or the CFMM pool ID if it exists. */
  readonly getLinkedCfmmPoolId = computedFn(
    (clPoolId): string | false | undefined => {
      if (!this.response) return;

      return (
        this.response?.data.migration_records.balancer_to_concentrated_pool_links.find(
          (record) => record.cl_pool_id === clPoolId
        )?.balancer_pool_id ?? false
      );
    }
  );
}
