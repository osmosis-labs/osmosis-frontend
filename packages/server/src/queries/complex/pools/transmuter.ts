import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import { AssetList, Chain, MinimalAsset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { captureIfError, DEFAULT_LRU_OPTIONS } from "../../../utils";
import { queryTransmuterTotalPoolLiquidity } from "../../contracts";
import { getAsset } from "../assets";

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
        asset: MinimalAsset;
        coin: CoinPretty;
        percentage: RatePretty;
      }>
    > => {
      const poolLiquidityAssets: Array<{
        asset: MinimalAsset;
        coin: CoinPretty;
        percentage: RatePretty;
      }> = [];

      const {
        data: { total_pool_liquidity = [] },
      } = await queryTransmuterTotalPoolLiquidity({
        contractAddress,
        chainList,
      });

      const totalLiquidity = total_pool_liquidity.reduce((acc, asset) => {
        return acc.add(new Dec(asset.amount));
      }, new Dec(0));

      for (const coin of total_pool_liquidity) {
        const asset = captureIfError(() =>
          getAsset({ assetLists, anyDenom: coin.denom })
        );

        if (asset) {
          poolLiquidityAssets.push({
            asset,
            coin: new CoinPretty(asset, coin.amount),
            percentage: new RatePretty(
              new Dec(parseInt(coin.amount, 10)).quo(totalLiquidity)
            ),
          });
        }
      }

      return poolLiquidityAssets;
    },
  });
}
