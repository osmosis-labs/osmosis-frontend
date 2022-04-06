import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { SuperfluidAllAssets } from "./types";
import { computedFn } from "mobx-utils";

export class ObservableQuerySuperfluidPools extends ObservableChainQuery<SuperfluidAllAssets> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/superfluid/v1beta1/all_assets"
    );
  }

  readonly isSuperfluidPool = computedFn((poolId: string): boolean => {
    if (!this.response) {
      return false;
    }

    for (const asset of this.response.data.assets) {
      if (
        asset.asset_type === "SuperfluidAssetTypeLPShare" &&
        asset.denom === `gamm/pool/${poolId}`
      ) {
        return true;
      }
    }

    return false;
  });
}
