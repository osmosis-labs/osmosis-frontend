import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import Fuse from "fuse.js";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { queryBalances } from "../../cosmos";
import { Search, Sort } from "../parameter-types";
import { calcAssetValue } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";

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

/** An Asset with basic user info included if the user holds a balance. */
export type MaybeUserAsset = Asset &
  Partial<{
    amount: CoinPretty;
    usdValue: PricePretty;
  }>;

const searchableKeys = ["symbol", "base", "name", "display"];

const cache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Get an individual asset explicitly by it's denom (any type) */
export async function getAsset({
  anyDenom,
}: {
  anyDenom: string;
}): Promise<ReturnType<typeof makeMinimalAsset> | undefined> {
  const assets = await getAssets({ findMinDenomOrSymbol: anyDenom });
  return assets[0];
}

/** Cached function that returns minimal asset information. Return values can double as the `Currency` type.
 *  Please avoid adding to this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export async function getAssets({
  assetList = AssetLists,
  ...params
}: {
  sort?: Partial<Sort>;
  search?: Search;
  /** Explicitly match the base or symbol denom. */
  findMinDenomOrSymbol?: string;
  assetList?: AssetList[];
}) {
  return cachified({
    cache,
    getFreshValue: async () => {
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
          keys: searchableKeys,
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
    },
    key: JSON.stringify(params),
  });
}

/** Maps user asset balance data given a list of assets and an Osmosis address.
 *  If no assets provided, they will be fetched and passed the given sort and search params.
 *  If no sort and search param is provided, they will sort by user fiat value at the beginning of the array. */
export async function mapGetUserAssetData({
  userOsmoAddress,
  assets,
  sort,
  search,
}: {
  userOsmoAddress: string;
  assets?: Awaited<ReturnType<typeof getAssets>>;
  sort?: Partial<Sort>;
  search?: Search;
}): Promise<MaybeUserAsset[]> {
  if (!assets) assets = await getAssets({ search, sort });

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
    .filter((a): a is Promise<MaybeUserAsset> => !!a);

  const userAssets = await Promise.all(eventualUserAssets);

  // if no sorting path provided, sort by usdValue at head of list
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

export * from "./price";
