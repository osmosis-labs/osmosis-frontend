import { CoinPretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";

import { queryAllocation } from "../../../queries/data-services";
import { Categories } from "../../../queries/data-services";
import { AccountCoinsResult } from "../../../queries/data-services";
import { getAsset } from "../assets";

interface FormattedAllocation {
  key: string;
  percentage: number;
  fiatValue: number;
  asset?: CoinPretty;
}

export interface GetAllocationResponse {
  all: FormattedAllocation[];
  assets: FormattedAllocation[];
  available: FormattedAllocation[];
}

function getAll(categories: Categories): FormattedAllocation[] {
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
      key: "available",
      percentage: (userBalancesCap / totalCap) * 100,
      fiatValue: userBalancesCap,
    },
    {
      key: "staked",
      percentage: (stakedCap / totalCap) * 100,
      fiatValue: stakedCap,
    },
    {
      key: "unstaking",
      percentage: (unstakingCap / totalCap) * 100,
      fiatValue: unstakingCap,
    },
    {
      key: "unclaimedRewards",
      percentage: (unclaimedRewardsCap / totalCap) * 100,
      fiatValue: unclaimedRewardsCap,
    },
    {
      key: "pooled",
      percentage: (pooledCap / totalCap) * 100,
      fiatValue: pooledCap,
    },
  ];
}

async function getAssets(categories: Categories, assetLists: AssetList[]) {
  const totalAssets = categories["total-assets"];
  const totalCap = +totalAssets.capitalization;

  // Get top 5 assets by cap value
  const sortedAccountCoinsResults =
    totalAssets?.account_coins_result?.sort(
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
      fiatValue: +asset.cap_value,
    };
  });

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: AccountCoinsResult) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other: FormattedAllocation = {
    key: "Other",
    percentage: otherPercentage,
    fiatValue: otherAmount,
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
      fiatValue: +asset.cap_value,
    };
  });

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: AccountCoinsResult) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other: FormattedAllocation = {
    key: "Other",
    percentage: otherPercentage,
    fiatValue: otherAmount,
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
}
