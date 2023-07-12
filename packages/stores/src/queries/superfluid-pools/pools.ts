import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { SuperfluidAllAssets } from "./types";

export class ObservableQuerySuperfluidPools extends ObservableChainQuery<SuperfluidAllAssets> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/superfluid/v1beta1/all_assets"
    );

    makeObservable(this);
  }

  readonly isSuperfluidPool = computedFn((poolId: string): boolean => {
    if (!this.response) {
      return false;
    }

    for (const asset of this.response.data.assets) {
      // superfluid share pool
      if (
        asset.asset_type === "SuperfluidAssetTypeLPShare" &&
        asset.denom === `gamm/pool/${poolId}`
      ) {
        return true;
      }

      // superfluid CL pool
      if (
        asset.asset_type === "SuperfluidAssetTypeConcentratedShare" &&
        asset.denom === `cl/pool/${poolId}`
      ) {
        return true;
      }
    }

    return false;
  });

  @computed
  get superfluidPoolIds(): string[] | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.assets.reduce(
      (superfluidPoolIds, superfluidAsset) => {
        if (superfluidAsset.asset_type === "SuperfluidAssetTypeLPShare") {
          const poolId = superfluidAsset.denom.split("/")[2];
          superfluidPoolIds.push(poolId);
        }
        return superfluidPoolIds;
      },
      [] as string[]
    );
  }
}
