import type { Asset, AssetList } from "@chain-registry/types";
// eslint-disable-next-line import/no-extraneous-dependencies
import { assets as assetLists } from "chain-registry";

import { ChainInfos } from "../chain-infos";
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

    const newChainName = ChainInfos.find(
      (chainInfo) => chainInfo.chainRegistryChainName === cloneList.chain_name
    )?.chainName;

    if (newChainName) {
      // Override the chain name with the one from chain-infos
      cloneList.chain_name = newChainName;
    }

    if (cloneList.assets.length > 0) {
      newAssetLists.push(cloneList);
    }
  }

  return newAssetLists;
}
