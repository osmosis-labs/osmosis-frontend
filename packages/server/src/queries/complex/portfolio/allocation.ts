import { CoinPretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryAllocation } from "../../../queries/data-services";
import { Categories } from "../../../queries/data-services";
import { AccountCoinsResult } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { getAsset } from "../assets";

const allocationCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

interface FormattedAllocation {
  key: string;
  percentage: number;
  amount: number;
  asset?: CoinPretty;
}

export interface GetAllocationResponse {
  all: FormattedAllocation[];
  assets: FormattedAllocation[];
  available: FormattedAllocation[];
}

async function getAll(categories: Categories) {
  const userBalancesCap = +categories["user-balances"].capitalization;
  const stakedCap = +categories["staked"].capitalization;
  const unstakingCap = +categories["unstaking"].capitalization;
  const unclaimedRewardsCap = +categories["unclaimed-rewards"].capitalization;
  const pooledCap = +categories["pooled"].capitalization;

  const totalCap =
    userBalancesCap +
    stakedCap +
    unstakingCap +
    unclaimedRewardsCap +
    pooledCap;

  return [
    {
      key: "Available",
      percentage: (userBalancesCap / totalCap) * 100,
      amount: userBalancesCap,
    },
    {
      key: "Staked",
      percentage: (stakedCap / totalCap) * 100,
      amount: stakedCap,
    },
    {
      key: "Unstaking",
      percentage: (unstakingCap / totalCap) * 100,
      amount: unstakingCap,
    },
    {
      key: "Unclaimed Rewards",
      percentage: (unclaimedRewardsCap / totalCap) * 100,
      amount: unclaimedRewardsCap,
    },
    {
      key: "Pooled",
      percentage: (pooledCap / totalCap) * 100,
      amount: pooledCap,
    },
  ];
}

async function getAssets(categories: Categories, assetLists: AssetList[]) {
  console.log("assetLists: ", assetLists);
  const totalAssets = categories["total-assets"];
  const totalCap = +totalAssets.capitalization;

  // Get top 5 assets by cap value
  const sortedAccountCoinsResults =
    totalAssets?.account_coins_result?.sort(
      (a: AccountCoinsResult, b: AccountCoinsResult) =>
        +b.cap_value - +a.cap_value
    ) || [];

  const top5AccountCoinsResults = sortedAccountCoinsResults.slice(0, 5);

  const assets = top5AccountCoinsResults.map(
    (asset: AccountCoinsResult, index: number) => {
      const assetFromAssetLists = getAsset({
        assetLists,
        anyDenom: asset.coin.denom,
      });

      return {
        key: assetFromAssetLists.coinDenom,
        percentage: (+asset.cap_value / totalCap) * 100,
        amount: +asset.cap_value,
      };
    }
  );

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: AccountCoinsResult) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other = {
    key: "Other",
    percentage: otherPercentage,
    amount: otherAmount,
    color: "bg-osmoverse-500",
  };

  return [...assets, other];
}

async function getAvailable(categories: Categories, assetLists: AssetList[]) {
  const userBalances = categories["user-balances"];
  const totalCap = +userBalances.capitalization;
  // Get top 5 assets by cap value

  const sortedAccountCoinsResults =
    userBalances?.account_coins_result?.sort(
      (a: AccountCoinsResult, b: AccountCoinsResult) =>
        +b.cap_value - +a.cap_value
    ) || [];

  const top5AccountCoinsResults = sortedAccountCoinsResults.slice(0, 5);

  const assets = top5AccountCoinsResults.map((asset: AccountCoinsResult) => {
    const assetFromAssetLists = getAsset({
      assetLists,
      anyDenom: asset.coin.denom,
    });

    return {
      key: assetFromAssetLists.coinDenom,
      percentage: (+asset.cap_value / totalCap) * 100,
      amount: +asset.cap_value,
    };
  });

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: AccountCoinsResult) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other = {
    key: "Other",
    percentage: otherPercentage,
    amount: otherAmount,
  };

  return [...assets, other];
}

export async function getAllocation({
  address,
  assetLists,
}: {
  address: string;
  assetLists: AssetList[];
}): Promise<GetAllocationResponse> {
  return await cachified({
    cache: allocationCache,
    ttl: 1000 * 60 * 0.25, // 15 seconds since a user can transact quickly
    key: `allocation-${address}`,
    getFreshValue: async () => {
      const data = await queryAllocation({
        address,
      });

      const categories = data.categories;

      const all = await getAll(categories);
      const assets = await getAssets(categories, assetLists);
      const available = await getAvailable(categories, assetLists);

      return {
        all,
        assets,
        available,
      };
    },
  });
}
