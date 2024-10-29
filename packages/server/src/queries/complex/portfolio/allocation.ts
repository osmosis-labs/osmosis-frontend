import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { Asset, AssetList } from "@osmosis-labs/types";
import { sort } from "@osmosis-labs/utils";

import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";
import { queryAllocation } from "../../../queries/data-services";
import { Categories } from "../../../queries/data-services";
import { AccountCoinsResultDec } from "../../../queries/sidecar/allocation";
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
  totalCap: PricePretty;
  /** Indicates there are variants that can be converted to canonical form. */
  hasVariants: boolean;
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

  const allocations: { key: string; fiatValue: Dec }[] = [
    {
      key: "available",
      fiatValue: userBalancesCap,
    },
    {
      key: "staked",
      fiatValue: stakedCap,
    },
    {
      key: "unstaking",
      fiatValue: unstakingCap,
    },
    {
      key: "unclaimedRewards",
      fiatValue: unclaimedRewardsCap,
    },
    {
      key: "pooled",
      fiatValue: pooledCap,
    },
  ];

  const sortedAllocation = sort(allocations, "fiatValue", "desc");

  const formattedAllocations: FormattedAllocation[] = sortedAllocation.map(
    (allocation) => ({
      key: allocation.key,
      percentage: totalCap.isZero()
        ? new RatePretty(0)
        : new RatePretty(allocation.fiatValue.quo(totalCap)),
      fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, allocation.fiatValue),
    })
  );

  return formattedAllocations;
}

export function calculatePercentAndFiatValues(
  categories: Categories,
  assetLists: AssetList[],
  category: "total-assets" | "user-balances",
  allocationLimit = 5
) {
  const totalAssets = categories[category];
  const totalCap = new Dec(totalAssets.capitalization);

  const account_coins_result = (totalAssets?.account_coins_result || []).map(
    (asset) => ({
      ...asset,
      cap_value: new Dec(asset.cap_value),
    })
  );

  const sortedAccountCoinsResults = sort(
    account_coins_result || [],
    "cap_value",
    "desc"
  );

  const topCoinsResults = sortedAccountCoinsResults.slice(0, allocationLimit);

  const assets: FormattedAllocation[] = topCoinsResults.map(
    (asset: AccountCoinsResultDec) => {
      const assetFromAssetLists = getAsset({
        assetLists,
        anyDenom: asset.coin.denom,
      });

      return {
        key: assetFromAssetLists.coinDenom,
        percentage: totalCap.isZero()
          ? new RatePretty(0)
          : new RatePretty(asset.cap_value.quo(totalCap)),
        fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, asset.cap_value),
      };
    }
  );

  const otherAssets = sortedAccountCoinsResults.slice(allocationLimit);

  const otherAmount = otherAssets.reduce(
    (sum: Dec, asset: AccountCoinsResultDec) => sum.add(asset.cap_value),
    new Dec(0)
  );

  const otherPercentage = totalCap.isZero()
    ? new RatePretty(0)
    : new RatePretty(otherAmount).quo(totalCap);

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

  const totalCap = new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(categories["total-assets"].capitalization)
  );

  const userBalanceDenoms =
    categories["user-balances"]?.account_coins_result?.map(
      (result) => result.coin.denom
    ) ?? [];

  // check for asset variants, alloys and canonical assets such as USDC
  const hasVariants = checkHasAssetVariants(
    userBalanceDenoms,
    assetLists.flatMap((list) => list.assets)
  );

  return {
    all,
    assets,
    available,
    totalCap,
    hasVariants,
  };
}

export function checkHasAssetVariants(
  userCoinMinimalDenoms: string[],
  assetListAssets: Asset[]
): boolean {
  const assetMap = new Map(
    assetListAssets.map((asset) => [asset.coinMinimalDenom, asset])
  );

  return userCoinMinimalDenoms.some((coinMinimalDenom) => {
    const matchingAsset = assetMap.get(coinMinimalDenom);

    return (
      matchingAsset &&
      matchingAsset.coinMinimalDenom !== matchingAsset.variantGroupKey
    );
  });
}
