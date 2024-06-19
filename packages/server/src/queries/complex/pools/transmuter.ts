import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
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

      

      normalized_pool_liquidity = total_pool_liquidity.map((asset) => {
        const coin = captureIfError(() =>
          getAsset({ assetLists, anyDenom: asset.denom })
        );

        if (coin) {
          return {
            denom: coin.denom,
            amount: new Dec(asset.amount).mul(new Dec(coin.coinDecimals)).toString(),
          };
        }


        return {
            denom: string;
            amount: string;
        }
      }

      for (const coin of total_pool_liquidity) {
        const asset = captureIfError(() =>
          getAsset({ assetLists, anyDenom: coin.denom })
        );

        if (asset) {

        }
      }

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
