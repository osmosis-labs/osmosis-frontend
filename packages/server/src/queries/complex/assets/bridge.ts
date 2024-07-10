import {
  Asset as AssetListAsset,
  AssetList,
  MinimalAsset,
} from "@osmosis-labs/types";

/** A bridgeable asset. */
export type BridgeAsset = {
  transferMethods: AssetListAsset["transferMethods"];
  counterparty: AssetListAsset["counterparty"];
};

/** Appends bridge info to a given asset. If asset is not found in asset list, empty bridge info will be returned.
 *  @throws if a given asset is not found in asset list.
 */
export function getBridgeAsset<TAsset extends MinimalAsset>(
  assetLists: AssetList[],
  asset: TAsset
): TAsset & BridgeAsset {
  const assetListAsset = assetLists
    .flatMap(({ assets }) => assets)
    .find((a) => a.coinMinimalDenom === asset.coinMinimalDenom);

  if (!assetListAsset)
    throw new Error("Bridge asset not found in asset list: " + asset.coinDenom);

  return {
    ...asset,
    transferMethods: assetListAsset.transferMethods,
    counterparty: assetListAsset.counterparty,
  };
}
