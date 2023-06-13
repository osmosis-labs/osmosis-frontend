import type { Asset, AssetList } from "@chain-registry/types";
// eslint-disable-next-line import/no-extraneous-dependencies
import { assets as assetLists } from "chain-registry";

import { ChainInfos as chainInfos } from "../generate-chain-infos/source-chain-infos";
import { ChainInfos } from "../generated/chain-infos";
// eslint-disable-next-line import/no-extraneous-dependencies
import IBCAssetInfos from "../ibc-assets";

export type GeneratorAssetInfo = {
  isVerified?: boolean;
  coinMinimalDenom: string;
};

// Assets to be included in the wallet-assets list.
const initialAssetInfos: GeneratorAssetInfo[] = [
  ...IBCAssetInfos,
  // Add native Osmosis Assets as they are not included in IBCAssetInfos but are needed in the app.
  { coinMinimalDenom: "uosmo", isVerified: true },
  { coinMinimalDenom: "uion", isVerified: true },
];

export const hasMatchingMinimalDenom = (
  { denom_units }: Asset,
  coinMinimalDenom: string
) => {
  return denom_units.some(
    ({ aliases, denom }) =>
      denom.toLowerCase() === coinMinimalDenom.toLowerCase() ||
      aliases?.some(
        (alias) => alias.toLowerCase() === coinMinimalDenom.toLowerCase()
      )
  );
};

export function getAssetLists(assetInfos = initialAssetInfos): AssetList[] {
  /**
   * asset list will have the following structure;
   * {
   *  $schema?: string | undefined;
   *  chain_name: string;
   *  assets: Asset[];
   * }
   */
  let newAssetLists: AssetList[] = [];

  for (const list of assetLists) {
    const cloneList = { ...list };
    // Filter out assets that are not in assetInfos
    cloneList.assets = list.assets.filter((asset) =>
      assetInfos.some(({ coinMinimalDenom, isVerified }) => {
        const isFrontier = process.env.NEXT_PUBLIC_IS_FRONTIER === "true";

        // If we are not on frontier, only show verified assets
        if (!isFrontier && !isVerified) return false;
        return hasMatchingMinimalDenom(asset, coinMinimalDenom);
      })
    );

    cloneList.assets = cloneList.assets.map((asset) => {
      // Always try to use our coingecko id
      asset.coingecko_id =
        chainInfos
          .find(({ currencies }) =>
            currencies.some(({ coinMinimalDenom }) =>
              hasMatchingMinimalDenom(asset, coinMinimalDenom)
            )
          )
          ?.currencies.find(({ coinMinimalDenom }) =>
            hasMatchingMinimalDenom(asset, coinMinimalDenom)
          )?.coinGeckoId ?? asset.coingecko_id;

      if (asset.coingecko_id === "") {
        console.warn(
          `Warning: asset ${asset.name} does not have coingecko_id.`
        );
      }

      return asset;
    });

    const newChainName = ChainInfos.find(
      (chainInfo) =>
        chainInfo?.chainRegistryChainName?.toLowerCase() ===
          cloneList?.chain_name?.toLowerCase() ||
        chainInfo?.chainName?.toLowerCase() ===
          cloneList?.chain_name?.toLowerCase()
    )?.chainName;

    // Override the chain name with the one from chain-infos
    if (newChainName) {
      cloneList.chain_name = newChainName;
    }

    if (cloneList.assets.length > 0) {
      newAssetLists.push(cloneList);
    }
  }

  return newAssetLists;
}
