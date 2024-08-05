import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import { sort } from "@osmosis-labs/utils";

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

export function getAll(categories: Categories): FormattedAllocation[] {
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

export function calculatePercentAndFiatValues(
  categories: Categories,
  assetLists: AssetList[],
  category: "total-assets" | "user-balances",
  allocationLimit: number
) {
  const totalAssets = categories[category];
  const totalCap = new Dec(totalAssets.capitalization);

  const sortedAccountCoinsResults = sort(
    totalAssets?.account_coins_result || [],
    "cap_value",
    "asc"
  );

  const topCoinsResults = sortedAccountCoinsResults.slice(0, allocationLimit);

  const assets: FormattedAllocation[] = topCoinsResults.map(
    (asset: AccountCoinsResult) => {
      const assetFromAssetLists = getAsset({
        assetLists,
        anyDenom: asset.coin.denom,
      });

      return {
        key: assetFromAssetLists.coinDenom,
        percentage: new RatePretty(new Dec(asset.cap_value).quo(totalCap)),
        fiatValue: new PricePretty(
          DEFAULT_VS_CURRENCY,
          new Dec(asset.cap_value)
        ),
      };
    }
  );

  const otherAssets = sortedAccountCoinsResults.slice(allocationLimit);

  const otherAmount = otherAssets.reduce(
    (sum: Dec, asset: AccountCoinsResult) => sum.add(new Dec(asset.cap_value)),
    new Dec(0)
  );

  const otherPercentage = new RatePretty(otherAmount).quo(totalCap);

  const other: FormattedAllocation = {
    key: "Other",
    percentage: otherPercentage,
    fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, otherAmount),
  };

  return [...assets, other];
}

export async function getAllocation({
  address,
  assetLists,
  allocationLimit = 5,
}: {
  address: string;
  assetLists: AssetList[];
  allocationLimit?: number;
}): Promise<GetAllocationResponse> {
  const data = await queryAllocation({
    address,
  });

  const categories = data.categories;

  const all = getAll(categories);
  const assets = calculatePercentAndFiatValues(
    categories,
    assetLists,
    "total-assets",
    allocationLimit
  );

  const available = calculatePercentAndFiatValues(
    categories,
    assetLists,
    "user-balances",
    allocationLimit
  );

  return {
    all,
    assets,
    available,
  };
}
