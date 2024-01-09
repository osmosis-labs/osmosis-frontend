import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { queryTokenMarketCaps } from "../../imperator";
import { Asset, AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getAssetData, getAssetMarketCapRank } from "./info";
import { getAssetPrice } from "./price";

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  marketCapRank: number;
  currentPrice: PricePretty;
  priceChange24h: RatePretty;
}>;

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getAssetMarketInfo<TAsset extends Asset>({
  asset,
}: {
  asset: TAsset;
}): Promise<TAsset & AssetMarketInfo> {
  return cachified({
    cache: marketInfoCache,
    key: asset.coinDenom + asset.coinMinimalDenom,
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const currentPrice = await getAssetPrice({ asset }).catch(() => {
        // if not found, return undefined
        return;
      });
      const marketCap = (
        await queryTokenMarketCaps().catch(() => {
          // if not found, return undefined
          return undefined;
        })
      )?.find((mCap) => mCap.symbol === asset.coinDenom)?.market_cap;
      const priceChange24h = (await getAssetData(asset))?.price_24h_change;
      const marketCapRank = await getAssetMarketCapRank(asset);

      return {
        ...asset,
        currentPrice: currentPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, currentPrice)
          : undefined,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        marketCapRank,
        priceChange24h: priceChange24h
          ? new RatePretty(new Dec(priceChange24h).quo(new Dec(100)))
          : undefined,
      };
    },
  });
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetAssetMarketInfos<TAsset extends Asset>({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
} & AssetFilter = {}): Promise<(TAsset & AssetMarketInfo)[]> {
  let { assets } = params;
  if (!assets) assets = (await getAssets(params)) as TAsset[];

  return await Promise.all(
    assets.map((asset) => getAssetMarketInfo({ asset }))
  );
}
