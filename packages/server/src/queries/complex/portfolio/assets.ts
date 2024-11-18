import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { AssetList, MinimalAsset } from "@osmosis-labs/types";
import { sort } from "@osmosis-labs/utils";

import { captureIfError } from "../../../utils";
import { Categories, queryPortfolioAssets } from "../../sidecar";
import { AccountCoinsResultDec } from "../../sidecar/portfolio-assets";
import { getAsset } from "../assets";
import { DEFAULT_VS_CURRENCY } from "../assets/config";

export interface Allocation {
  key: string;
  percentage: RatePretty;
  fiatValue: PricePretty;
  asset?: CoinPretty;
}

export interface AssetVariant {
  name: string;
  amount: CoinPretty;
  canonicalAsset: MinimalAsset;
}

export function getAllocations(categories: Categories): Allocation[] {
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

  const formattedAllocations: Allocation[] = sortedAllocation.map(
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

  const assets: Allocation[] = topCoinsResults
    .map((asset: AccountCoinsResultDec) => {
      const assetFromAssetLists = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: asset.coin.denom,
        })
      );

      if (!assetFromAssetLists) {
        return null;
      }

      return {
        key: assetFromAssetLists.coinDenom,
        percentage: totalCap.isZero()
          ? new RatePretty(0)
          : new RatePretty(asset.cap_value.quo(totalCap)),
        fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, asset.cap_value),
        asset: new CoinPretty(assetFromAssetLists, asset.coin.amount),
      };
    })
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null);

  const otherAssets = sortedAccountCoinsResults.slice(allocationLimit);

  const otherAmount = otherAssets.reduce(
    (sum: Dec, asset: AccountCoinsResultDec) => sum.add(asset.cap_value),
    new Dec(0)
  );

  const otherPercentage = totalCap.isZero()
    ? new RatePretty(0)
    : new RatePretty(otherAmount).quo(totalCap);

  const other: Allocation = {
    key: "Other",
    percentage: otherPercentage,
    fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, otherAmount),
  };

  return [...assets, other];
}

export type PortfolioAssets = {
  all: Allocation[];
  assets: Allocation[];
  available: Allocation[];
  totalCap: PricePretty;
  assetVariants: AssetVariant[];
};

/**
 * Gets portfolio assets for the given address
 * and includes a breakdown of the assets by category.
 */
export async function getPortfolioAssets({
  address,
  assetLists,
  allocationLimit = 5,
}: {
  address: string;
  assetLists: AssetList[];
  allocationLimit?: number;
}): Promise<PortfolioAssets> {
  const data = await queryPortfolioAssets({
    address,
  });

  const categories = data.categories;

  const allocations = getAllocations(categories);
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

  // Update userBalanceDenoms to be a list of objects with denom and amount
  const userBalanceDenoms =
    categories["user-balances"]?.account_coins_result?.map((result) => ({
      denom: result.coin.denom,
      amount: result.coin.amount, // Assuming amount is stored in result.coin.amount
    })) ?? [];

  // check for asset variants, alloys and canonical assets such as USDC
  const assetVariants = checkAssetVariants(userBalanceDenoms, assetLists);

  return {
    all: allocations,
    assets,
    available,
    totalCap,
    assetVariants,
  };
}

export function checkAssetVariants(
  userBalanceDenoms: { denom: string; amount: string }[],
  assetLists: AssetList[]
): AssetVariant[] {
  const assetListAssets = assetLists.flatMap((list) => list.assets);

  return userBalanceDenoms
    .map(({ denom, amount }) => {
      const asset = assetListAssets.find(
        (asset) => asset.coinMinimalDenom === denom
      );

      // check if it's a variant
      if (
        asset &&
        asset.variantGroupKey &&
        asset.coinMinimalDenom !== asset.variantGroupKey
      ) {
        const canonicalAsset = getAsset({
          assetLists,
          anyDenom: asset.variantGroupKey,
        });

        const userAsset = getAsset({
          assetLists,
          anyDenom: denom,
        });

        return {
          name: userAsset.coinName,
          amount: new CoinPretty(userAsset, amount),
          canonicalAsset: canonicalAsset,
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
