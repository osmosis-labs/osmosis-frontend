import { Asset as AssetListAsset, AssetList } from "@osmosis-labs/types";

import { Asset } from ".";

export type BridgeAsset = {
  transferMethods: AssetListAsset["transferMethods"];
  counterparty: AssetListAsset["counterparty"];
};

/** Appends bridge info to a given asset. If asset is not found in asset list, empty bridge info will be returned. */
export function getBridgeAsset<TAsset extends Asset>(
  assetLists: AssetList[],
  asset: TAsset
): TAsset & BridgeAsset {
  const assetListAsset = assetLists
    .flatMap(({ assets }) => assets)
    .find((a) => a.coinMinimalDenom === asset.coinMinimalDenom);

  return {
    ...asset,
    transferMethods: assetListAsset?.transferMethods ?? [],
    counterparty: assetListAsset?.counterparty ?? [],
  };
}
