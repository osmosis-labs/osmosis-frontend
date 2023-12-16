import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";
import { Search, search } from "~/utils/search";
import { SortDirection } from "~/utils/sort";

import { queryBalances } from "../../cosmos";
import { queryTokenMarketCaps } from "../../indexer";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getAssetData, getAssetMarketCapRank } from "./info";
import {
  calcAssetValue,
  CommonHistoricalPriceTimeFrame,
  getAssetPrice,
  getCommonTimeFrameAssetHistoricalPrice,
} from "./price";

/** An asset with minimal data that conforms to `Currency` type. */
export type Asset = {
  coinDenom: string;
  coinName: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinGeckoId: string | undefined;
  coinImageUrl: string;
  isVerified: boolean;
};

type AssetFilter = Partial<{
  search: Search;
}>;

/** Search is performed on the raw asset list data, instead of `Asset` type. */
const searchableAssetListAssetKeys = ["symbol", "base", "name", "display"];
/** Get an individual asset explicitly by it's denom (any type) */
export async function getAsset({
  assetList = AssetLists,
  anyDenom,
}: {
  assetList?: AssetList[];
  anyDenom: string;
}): Promise<Asset | undefined> {
  const assets = await getAssets({ assetList, findMinDenomOrSymbol: anyDenom });
  return assets[0];
}

const minimalAssetsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
/** Cached function that returns minimal asset information. Return values can double as the `Currency` type.
 *  Search was added to this function since members of the asset list type are search before mapped
 *  into minimal assets. See `searchableAssetListAssetKeys` for the keys that are searched.
 *
 *  Please avoid changing this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export async function getAssets({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  /** Explicitly match the base or symbol denom. */
  findMinDenomOrSymbol?: string;
} & AssetFilter): Promise<Asset[]> {
  const makeMinimalAssets = (assetList: AssetList[]) => {
    // Create new array with just assets
    const coinMinimalDenomSet = new Set<string>();

    const listedAssets = assetList
      .flatMap(({ assets }) => assets)
      .filter(
        (asset) =>
          asset.keywords && !asset.keywords.includes("osmosis-unlisted")
      );

    let assetListAssets = listedAssets.filter((asset) => {
      if (params.findMinDenomOrSymbol) {
        return (
          params.findMinDenomOrSymbol.toUpperCase() ===
            asset.base.toUpperCase() ||
          params.findMinDenomOrSymbol.toUpperCase() ===
            asset.symbol.toUpperCase()
        );
      }

      // Ensure denoms are unique on Osmosis chain
      // In the case the asset list has the same asset twice
      if (coinMinimalDenomSet.has(asset.base)) {
        return false;
      } else {
        coinMinimalDenomSet.add(asset.base);
        return true;
      }
    });

    // Search raw asset list before reducing type to minimal Asset type
    if (params.search) {
      assetListAssets = search(
        assetListAssets,
        searchableAssetListAssetKeys,
        params.search
      );
    }

    // Transform into a more compact object
    return assetListAssets.map(makeMinimalAsset);
  };

  // if it's the default asset list, cache it
  if (assetList === AssetLists) {
    return cachified({
      cache: minimalAssetsCache,
      key: JSON.stringify(params),
      getFreshValue: () => makeMinimalAssets(assetList),
    });
  }

  // otherwise process the given novel asset list
  return makeMinimalAssets(assetList);
}

/** Basic user info if the user holds a balance. */
export type MaybeUserAssetInfo = Partial<{
  amount: CoinPretty;
  usdValue: PricePretty;
}>;

export async function getUserAssetInfo<TAsset extends Asset>({
  assetList = AssetLists,
  asset,
  userOsmoAddress,
}: {
  assetList?: AssetList[];
  asset: TAsset;
  userOsmoAddress?: string;
}): Promise<TAsset & MaybeUserAssetInfo> {
  if (!userOsmoAddress) return asset;

  const userAssets = await mapGetUserAssetInfos({
    assetList,
    assets: [asset],
    userOsmoAddress,
  });
  return userAssets[0];
}

/** Maps user asset balance data given a list of assets of a given type and a potential user Osmosis address.
 *  If no assets provided, they will be fetched and passed the given search params.
 *  If no search param is provided and `sortFiatValueDirection` is defined, it will sort by user fiat value.  */
export async function mapGetUserAssetInfos<TAsset extends Asset>({
  assetList = AssetLists,
  assets,
  userOsmoAddress,
  search,
  sortFiatValueDirection,
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
  userOsmoAddress?: string;
  sortFiatValueDirection?: SortDirection;
} & AssetFilter): Promise<(TAsset & MaybeUserAssetInfo)[]> {
  if (!userOsmoAddress) return assets as (TAsset & MaybeUserAssetInfo)[];
  if (!assets) assets = (await getAssets({ assetList, search })) as TAsset[];

  const { balances } = await queryBalances(userOsmoAddress);

  const eventualUserAssets = assets
    .map(async (asset) => {
      const balance = balances.find((a) => a.denom === asset.coinMinimalDenom);

      // not a user asset
      if (!balance) return asset;

      // is user asset, include user data
      const usdValue = await calcAssetValue({
        anyDenom: asset.coinMinimalDenom,
        amount: balance.amount,
      }).catch(() => {
        console.error(asset.coinMinimalDenom, "likely missing price config");
      });

      return {
        ...asset,
        amount: new CoinPretty(asset, balance.amount),
        usdValue: usdValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, usdValue)
          : undefined,
      };
    })
    .filter((a): a is Promise<TAsset & MaybeUserAssetInfo> => !!a);

  const userAssets = await Promise.all(eventualUserAssets);

  // if no search provided, sort by usdValue at head of list by default
  if (!search && sortFiatValueDirection) {
    userAssets.sort((a, b) => {
      if (!Boolean(a.usdValue) && !Boolean(b.usdValue)) return 0;
      if (Boolean(a.usdValue) && !Boolean(b.usdValue)) return -1;
      if (!Boolean(a.usdValue) && Boolean(b.usdValue)) return 1;

      if (sortFiatValueDirection === "desc") {
        const n = Number(
          b.usdValue!.toDec().sub(a.usdValue!.toDec()).toString()
        );
        if (isNaN(n)) return 0;
        else return n;
      } else {
        const n = Number(
          a.usdValue!.toDec().sub(b.usdValue!.toDec()).toString()
        );
        if (isNaN(n)) return 0;
        else return n;
      }
    });
  }

  return userAssets;
}

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  marketCapRank: number;
  currentPrice: PricePretty;
  priceChange24h: RatePretty;
  recentPriceCloses: number[];
}>;

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetAssetMarketInfos<TAsset extends Asset>({
  assetList = AssetLists,
  assets,
  search,
  historicalPriceTimeFrame,
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
  historicalPriceTimeFrame?: CommonHistoricalPriceTimeFrame;
} & AssetFilter): Promise<(TAsset & AssetMarketInfo)[]> {
  if (!assets) assets = (await getAssets({ assetList, search })) as TAsset[];

  return await Promise.all(
    assets.map((asset) =>
      getAssetMarketInfo({ asset, historicalPriceTimeFrame })
    )
  );
}

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getAssetMarketInfo<TAsset extends Asset>({
  asset,
  historicalPriceTimeFrame,
}: {
  asset: TAsset;
  historicalPriceTimeFrame?: CommonHistoricalPriceTimeFrame;
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
      const recentPriceCloses = historicalPriceTimeFrame
        ? await getCommonTimeFrameAssetHistoricalPrice({
            coinDenom: asset.coinDenom,
            timeFrame: historicalPriceTimeFrame,
          })
            ?.then((prices) => prices.map((price) => price.close))
            .catch(() => {
              // if not found, return undefined

              return undefined;
            })
        : undefined;

      return {
        ...asset,
        currentPrice: currentPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, currentPrice)
          : undefined,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        marketCapRank: await getAssetMarketCapRank({
          coinDenom: asset.coinDenom,
        }),
        priceChange24h: priceChange24h
          ? new RatePretty(new Dec(priceChange24h).quo(new Dec(100)))
          : undefined,
        recentPriceCloses,
      };
    },
  });
}

export * from "./price";
