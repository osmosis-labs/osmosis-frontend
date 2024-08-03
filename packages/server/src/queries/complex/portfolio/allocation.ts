import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";

import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";
import { queryAllocation } from "../../../queries/data-services";
import { Categories } from "../../../queries/data-services";
import { AccountCoinsResult } from "../../../queries/data-services";
import { getAsset } from "../assets";

interface FormattedAllocation {
  key: string;
  percentage: RatePretty;
  fiatValue: PricePretty;
  asset?: CoinPretty;
}

export interface GetAllocationResponse {
  all: FormattedAllocation[];
  assets: FormattedAllocation[];
  available: FormattedAllocation[];
}

function getAll(categories: Categories): FormattedAllocation[] {
  const userBalancesCap = new Dec(categories["user-balances"].capitalization);
  const stakedCap = new Dec(categories["staked"].capitalization);
  const unstakingCap = new Dec(categories["unstaking"].capitalization);
  const unclaimedRewardsCap = new Dec(
    categories["unclaimed-rewards"].capitalization
  );
  const pooledCap = new Dec(categories["pooled"].capitalization);

  const totalCap = userBalancesCap
    .add(stakedCap)
    .add(unstakingCap)
    .add(unclaimedRewardsCap)
    .add(pooledCap);

  return [
    {
      key: "available",
      percentage: new RatePretty(userBalancesCap.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, userBalancesCap),
    },
    {
      key: "staked",
      percentage: new RatePretty(stakedCap.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, stakedCap),
    },
    {
      key: "unstaking",
      percentage: new RatePretty(unstakingCap.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, unstakingCap),
    },
    {
      key: "unclaimedRewards",
      percentage: new RatePretty(unclaimedRewardsCap.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, unclaimedRewardsCap),
    },
    {
      key: "pooled",
      percentage: new RatePretty(pooledCap.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, pooledCap),
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
