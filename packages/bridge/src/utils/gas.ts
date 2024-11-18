import { Chain, queryGeneratedChains } from "@osmosis-labs/server";
import { AssetList, Chain as OsmosisTypesChain } from "@osmosis-labs/types";
import cachified, { Cache } from "cachified";

import { BridgeAsset } from "../interface";

/**
 * Gets gas asset from asset list or chain list, attempting to match the coinMinimalDenom or chainSuggestionDenom.
 * @returns gas bridge asset, or undefined if not found.
 */
export async function getGasAsset({
  fromChainId,
  denom,
  assetLists,
  chainList,
  cache,
}: {
  fromChainId: string;
  denom: string;
  assetLists: AssetList[];
  chainList: OsmosisTypesChain[];
  cache: Cache;
}): Promise<BridgeAsset | undefined> {
  // try to get asset list fee asset first, or otherwise the chain fee currency
  const assetListAsset = assetLists
    .flatMap(({ assets }) => assets)
    .find(
      (asset) => asset.coinMinimalDenom.toLowerCase() === denom.toLowerCase()
    );

  if (assetListAsset) {
    return {
      address: assetListAsset.coinMinimalDenom,
      denom: assetListAsset.symbol,
      decimals: assetListAsset.decimals,
      coinGeckoId: assetListAsset.coingeckoId,
    };
  }

  const chains = await getChains({ cache: cache, chainList });
  const chain = chains.find((c) => c.chain_id === fromChainId);
  const feeCurrency = chain?.feeCurrencies.find(
    ({ chainSuggestionDenom }) =>
      chainSuggestionDenom.toLowerCase() === denom.toLowerCase()
  );

  if (feeCurrency) {
    return {
      address: feeCurrency.chainSuggestionDenom,
      denom: feeCurrency.coinDenom,
      decimals: feeCurrency.coinDecimals,
      coinGeckoId: feeCurrency.coinGeckoId,
    };
  }
}

/** Fetches generated chains from Osmosis assetlists repo. */
export function getChains({
  cache,
  chainList,
}: {
  cache: Cache;
  chainList: OsmosisTypesChain[];
}): Promise<Chain[]> {
  return cachified({
    cache,
    key: "queryGeneratedChains" + chainList[0].chain_id,
    ttl: 60 * 60 * 24, // 1 day
    getFreshValue: () =>
      queryGeneratedChains({ zoneChainId: chainList[0].chain_id }),
  });
}
