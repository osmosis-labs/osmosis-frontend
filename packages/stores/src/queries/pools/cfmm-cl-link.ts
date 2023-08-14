import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableQueryNodeInfo } from "../tendermint/node-info";
import { MigrationRecords } from "./types";

export class ObservableQueryCfmmConcentratedPoolLinks extends ObservableChainQuery<MigrationRecords> {
  // BACKWARDS COMPATIBLE QUERIES FOR PRE V17:
  // TODO: can be safely removed after migration to v17, est Aug 22 '23
  protected backCompatQueryCfmmToCL: ObservableQueryCfmmToConcentratedLiquidityPoolLinks;
  protected backCompatQueryClToCfmm: ObservableQueryConcentratedLiquidityToCfmmPoolLinks;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryNodeInfo: ObservableQueryNodeInfo
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/gamm/v1beta1/cfmm_concentrated_pool_links"
    );

    this.backCompatQueryCfmmToCL =
      new ObservableQueryCfmmToConcentratedLiquidityPoolLinks(
        kvStore,
        chainId,
        chainGetter
      );

    this.backCompatQueryClToCfmm =
      new ObservableQueryConcentratedLiquidityToCfmmPoolLinks(
        kvStore,
        chainId,
        chainGetter
      );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.queryNodeInfo.response);
  }

  @computed
  protected get isV17() {
    if (this.queryNodeInfo.isDevelopmentEnv) return true;

    return (this.queryNodeInfo.nodeVersion ?? 0) >= 17;
  }

  /** Link to concentrated liquidity pool from the given balancer/cfmm pool ID.
   *  Returns `undefined` if not loaded, `false`, if nonexistent, or the CL pool ID if it exists. */
  readonly getLinkedConcentratedPoolId = computedFn(
    (cfmmPooLId): string | false | undefined => {
      if (!this.isV17) {
        return this.backCompatQueryCfmmToCL.get(cfmmPooLId)
          .concentratedLiquidityPoolId;
      }

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
      if (!this.isV17) {
        return this.backCompatQueryClToCfmm.get(clPoolId).cfmmPoolId;
      }

      if (!this.response) return;

      return (
        this.response?.data.migration_records.balancer_to_concentrated_pool_links.find(
          (record) => record.cl_pool_id === clPoolId
        )?.balancer_pool_id ?? false
      );
    }
  );
}

// BACKWARDS COMPATIBLE QUERIES FOR V17:

export class ObservableQueryCfmmToConcentratedLiquidityPoolLink extends ObservableChainQuery<{
  concentrated_pool_id: string;
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly cfmmPoolId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/gamm/v1beta1/concentrated_pool_id_link_from_cfmm/${cfmmPoolId}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.cfmmPoolId);
  }

  /** Returns the ID of the linked concentrated liquidity pool if it exists, `false` if there's no link, or `undefined` if the request is in flight. */
  @computed
  get concentratedLiquidityPoolId() {
    // link doesn't exist
    if (this.response?.status === 400) {
      return false;
    }

    return this.response?.data.concentrated_pool_id;
  }
}

export class ObservableQueryCfmmToConcentratedLiquidityPoolLinks extends ObservableChainQueryMap<{
  concentrated_pool_id: string;
}> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (cfmmPoolId: string) => {
      return new ObservableQueryCfmmToConcentratedLiquidityPoolLink(
        kvStore,
        chainId,
        chainGetter,
        cfmmPoolId
      );
    });
  }

  get(cfmmPoolId: string): ObservableQueryCfmmToConcentratedLiquidityPoolLink {
    return super.get(
      cfmmPoolId
    ) as ObservableQueryCfmmToConcentratedLiquidityPoolLink;
  }
}

export class ObservableQueryConcentratedLiquidityToCfmmPoolLink extends ObservableChainQuery<{
  cfmm_pool_id: string;
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly clPoolId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/concentratedliquidity/v1beta1/cfmm_pool_id_link_from_concentrated/${clPoolId}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.clPoolId);
  }

  /** Returns the ID of the linked concentrated liquidity pool if it exists, `false` if there's no link, or `undefined` if the request is in flight. */
  @computed
  get cfmmPoolId() {
    // link doesn't exist
    if (this.response?.status === 400) {
      return false;
    }

    return this.response?.data.cfmm_pool_id;
  }
}

export class ObservableQueryConcentratedLiquidityToCfmmPoolLinks extends ObservableChainQueryMap<{
  cfmm_pool_id: string;
}> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (clPoolId: string) => {
      return new ObservableQueryConcentratedLiquidityToCfmmPoolLink(
        kvStore,
        chainId,
        chainGetter,
        clPoolId
      );
    });
  }

  get(clPoolId: string): ObservableQueryConcentratedLiquidityToCfmmPoolLink {
    return super.get(
      clPoolId
    ) as ObservableQueryConcentratedLiquidityToCfmmPoolLink;
  }
}
