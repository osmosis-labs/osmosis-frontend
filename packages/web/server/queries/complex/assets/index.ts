import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import Fuse from "fuse.js";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { queryBalances } from "../../cosmos";
import { queryTokenData, queryTokenMarketCaps } from "../../indexer";
import { Search, Sort } from "../parameter-types";
import { DEFAULT_VS_CURRENCY } from "./config";
import { calcAssetValue, getAssetPrice } from "./price";

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
  sort: Sort;
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
 *  Please avoid adding to this function unless absolutely necessary.
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

    let assets = listedAssets.filter((asset) => {
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

    // Search
    if (params.search) {
      const fuse = new Fuse(assets, {
        keys: searchableAssetListAssetKeys,
        // Set the threshold to 0.2 to allow a small amount of fuzzy search
        threshold: 0.2,
      });
      assets = fuse
        .search(params.search.query)
        .map(({ item }) => item)
        .slice(0, params.search.limit);
    }

    // Transform into a more compact object
    const minimalAssets = assets.map(makeMinimalAsset);

    // Sort
    if (params.sort && params.sort.keyPath && !params.search) {
      const keyPath = params.sort.keyPath;
      minimalAssets.sort((a, b) => {
        if (keyPath === "coinDenom") {
          return a.coinDenom.localeCompare(b.coinDenom);
        } else if (keyPath === "coinMinimalDenom") {
          return a.coinMinimalDenom.localeCompare(b.coinMinimalDenom);
        } else {
          return 0;
        }
      });
    }

    return minimalAssets;
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

/** Maps user asset balance data given a list of assets of a given type and an Osmosis address.
 *  If no assets provided, they will be fetched and passed the given sort and search params.
 *  If no sort and search param is provided, they will sort by user fiat value at the beginning of the array.
 *  Fuzzy search can be applied to the members of the `Asset` type.
 *  Sort can be applied to any members of the `Asset` and return type. */
export async function mapGetUserAssetInfos<TAsset extends Asset>({
  assetList = AssetLists,
  assets,
  userOsmoAddress,
  sort,
  search,
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
  userOsmoAddress: string;
} & AssetFilter): Promise<(TAsset & MaybeUserAssetInfo)[]> {
  if (!assets)
    assets = (await getAssets({ assetList, search, sort })) as TAsset[];

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

  // if no sorting path and search provided, sort by usdValue at head of list
  // otherwise sort by provided path with user asset info still included
  if (!sort?.keyPath && !search) {
    const sortDir = sort?.direction ?? "desc";

    userAssets.sort((a, b) => {
      if (!Boolean(a.usdValue) && !Boolean(b.usdValue)) return 0;
      if (Boolean(a.usdValue) && !Boolean(b.usdValue)) return -1;
      if (!Boolean(a.usdValue) && Boolean(b.usdValue)) return 1;
      if (sortDir === "desc") {
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
  currentPrice: PricePretty;
  priceChange24h: RatePretty;
}>;

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given sort and search params.
 *  Default sort, if no `sort` is provided, is by market cap. If an asset doesn't have a market cap it is at the end of the array.
 *  Fuzzy search can be applied to the members of the `Asset` type.
 *  Sort can be applied to any members of the `Asset` and return type. */
export async function mapGetAssetMarketInfos<TAsset extends Asset>({
  assetList = AssetLists,
  assets,
  sort,
  search,
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
} & AssetFilter): Promise<(TAsset & AssetMarketInfo)[]> {
  if (!assets)
    assets = (await getAssets({ assetList, sort, search })) as TAsset[];

  return await Promise.all(assets.map(getAssetMarketInfo));
}

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getAssetMarketInfo<TAsset extends Asset>(
  asset: TAsset
): Promise<TAsset & AssetMarketInfo> {
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
          return;
        })
      )?.find((mCap) => mCap.symbol === asset.coinDenom)?.market_cap;
      const priceChange24h = (
        await queryTokenData(asset).catch(() => {
          // if not found, return undefined
          return;
        })
      )?.price_24h_change;

      return {
        ...asset,
        currentPrice: currentPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, currentPrice)
          : undefined,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        priceChange24h: priceChange24h
          ? new RatePretty(priceChange24h)
          : undefined,
      };
    },
  });
}

export * from "./price";
