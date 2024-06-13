import { CoinPretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { captureIfError, DEFAULT_LRU_OPTIONS } from "../../../utils";
import { queryTransmuterTotalPoolLiquidity } from "../../contracts";
import { Asset, getAsset } from "../assets";

const transmuterTotalPoolLiquidityCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export async function getCachedTransmuterTotalPoolLiquidity(
  contractAddress: string,
  chainList: Chain[],
  assetLists: AssetList[]
) {
  return await cachified({
    cache: transmuterTotalPoolLiquidityCache,
    ttl: 1000 * 30, // 30 seconds
    key: `transmuter-total-pool-liquidity-${contractAddress}`,
    getFreshValue: async (): Promise<
      Array<{
        asset: Asset;
        coin: CoinPretty;
      }>
    > => {
      const assets: Array<{
        asset: Asset;
        coin: CoinPretty;
      }> = [];

      const { total_pool_liquidity } = await queryTransmuterTotalPoolLiquidity({
        contractAddress,
        chainList,
      });

      for (const coin of total_pool_liquidity) {
        const asset = captureIfError(() =>
          getAsset({ assetLists, anyDenom: coin.denom })
        );

        if (asset) {
          assets.push({
            asset,
            coin: new CoinPretty(asset, coin.amount),
          });
        }
      }

      return assets;
    },
  });
}
