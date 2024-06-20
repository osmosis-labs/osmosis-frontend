import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
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
        percentage: RatePretty;
      }>
    > => {
      const poolLiquidityAssets: Array<{
        asset: Asset;
        coin: CoinPretty;
        percentage: RatePretty;
      }> = [];

      const {
        data: { total_pool_liquidity = [] },
      } = await queryTransmuterTotalPoolLiquidity({
        contractAddress,
        chainList,
      });

      const totalLiquidity = total_pool_liquidity.reduce((acc, coin) => {
        const asset = captureIfError(() =>
          getAsset({ assetLists, anyDenom: coin.denom })
        );

        if (asset) {
          const amount = new Dec(coin.amount);

          return acc.add(
            amount.quo(DecUtils.getTenExponentN(asset.coinDecimals))
          );
        }

        return acc;
      }, new Dec(0));

      for (const coin of total_pool_liquidity) {
        const asset = captureIfError(() =>
          getAsset({ assetLists, anyDenom: coin.denom })
        );

        if (asset) {
          const coinPretty = new CoinPretty(asset, coin.amount);

          const amount = new Dec(coin.amount).quo(
            DecUtils.getTenExponentN(asset.coinDecimals)
          );

          poolLiquidityAssets.push({
            asset,
            coin: coinPretty,
            percentage: new RatePretty(amount.quo(totalLiquidity)),
          });
        }
      }

      return poolLiquidityAssets;
    },
  });
}
