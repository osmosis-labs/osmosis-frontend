import { AssetList, Chain, MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import { Dec, RatePretty } from "@osmosis-labs/unit";
import { sort } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { captureIfError, DEFAULT_LRU_OPTIONS } from "../../../utils";
import {
  queryTransmuterAssetConfigs,
  queryTransmuterIsActive,
} from "../../contracts";
import {
  type AccountCoinsResult,
  Categories,
  type Category,
  queryPortfolioAssets,
} from "../../sidecar";
import { getAsset, isHoldingValueUnknown } from "../assets";
import { DEFAULT_VS_CURRENCY } from "../assets/config";

export interface Allocation {
  key: string;
  percentage: RatePretty;
  fiatValue: PricePretty;
  /** True when the value includes a coin SQS couldn't price (held, but valued at zero). */
  fiatValueUnknown?: boolean;
  asset?: CoinPretty;
}

export interface AssetVariant {
  name: string;
  amount: CoinPretty;
  fiatValue: PricePretty;
  canonicalAsset: MinimalAsset;
}

/** SQS values a coin it can't price at zero. For an asset that should have a price,
 *  that zero is unknown, not zero. */
function isUnpricedCoin(
  assetLists: AssetList[],
  { coin, cap_value }: AccountCoinsResult
): boolean {
  return (
    new Dec(cap_value).isZero() &&
    isHoldingValueUnknown({
      assetLists,
      coinMinimalDenom: coin.denom,
      amount: coin.amount,
    })
  );
}

/** A category total is unknown when SQS couldn't price a coin in it that should have a
 *  price. `is_best_effort` isn't used: SQS also sets it for coins expected to have no
 *  price (e.g. sunset assets), which would leave many wallets' totals unknown. */
function isCategoryValueUnknown(
  assetLists: AssetList[],
  category: Category
): boolean {
  return Boolean(
    category.account_coins_result?.some((coin) =>
      isUnpricedCoin(assetLists, coin)
    )
  );
}

export function getAllocations(
  categories: Categories,
  assetLists: AssetList[]
): Allocation[] {
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

  const allocations: { key: string; fiatValue: Dec; category: Category }[] = [
    {
      key: "available",
      fiatValue: userBalancesCap,
      category: categories["user-balances"],
    },
    {
      key: "staked",
      fiatValue: stakedCap,
      category: categories["staked"],
    },
    {
      key: "unstaking",
      fiatValue: unstakingCap,
      category: categories["unstaking"],
    },
    {
      key: "unclaimedRewards",
      fiatValue: unclaimedRewardsCap,
      category: categories["unclaimed-rewards"],
    },
    {
      key: "pooled",
      fiatValue: pooledCap,
      category: categories["pooled"],
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
      ...(isCategoryValueUnknown(assetLists, allocation.category) && {
        fiatValueUnknown: true,
      }),
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
      coin: asset.coin,
      fiatValue: new Dec(asset.cap_value),
      fiatValueUnknown: isUnpricedCoin(assetLists, asset),
    })
  );

  const sortedAccountCoinsResults = sort(
    account_coins_result || [],
    "fiatValue",
    "desc"
  );

  const topCoinsResults = sortedAccountCoinsResults.slice(0, allocationLimit);

  const assets: Allocation[] = topCoinsResults
    .map((asset) => {
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
          : new RatePretty(asset.fiatValue.quo(totalCap)),
        fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, asset.fiatValue),
        ...(asset.fiatValueUnknown && { fiatValueUnknown: true }),
        asset: new CoinPretty(assetFromAssetLists, asset.coin.amount),
      };
    })
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null);

  const otherAssets = sortedAccountCoinsResults.slice(allocationLimit);

  const otherAmount = otherAssets.reduce(
    (sum: Dec, asset) => sum.add(asset.fiatValue),
    new Dec(0)
  );

  const otherPercentage = totalCap.isZero()
    ? new RatePretty(0)
    : new RatePretty(otherAmount).quo(totalCap);

  const other: Allocation = {
    key: "Other",
    percentage: otherPercentage,
    fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, otherAmount),
    ...(otherAssets.some((asset) => asset.fiatValueUnknown) && {
      fiatValueUnknown: true,
    }),
  };

  return [...assets, other];
}

export type HeldAsset = {
  /** Minimal denom, e.g. `ibc/HASH`. */
  denom: string;
  /** Display symbol from the asset list, when the asset is listed. */
  coinDenom?: string;
};

export type PortfolioAssets = {
  all: Allocation[];
  assets: Allocation[];
  available: Allocation[];
  totalCap: PricePretty;
  /** A held coin that should have a price couldn't be priced, so `totalCap` is unknown. */
  totalCapUnknown: boolean;
  assetVariants: AssetVariant[];
  /**
   * Assets the user holds across all categories (bank balances, staked,
   * unstaking, in-locks, unclaimed rewards, and pooled — GAMM shares and
   * CL positions are broken down to underlying denoms by sidecar).
   */
  heldAssets: HeldAsset[];
};

/**
 * Gets portfolio assets for the given address
 * and includes a breakdown of the assets by category.
 */
export async function getPortfolioAssets({
  address,
  assetLists,
  chainList,
  allocationLimit = 5,
}: {
  address: string;
  assetLists: AssetList[];
  chainList: Chain[];
  allocationLimit?: number;
}): Promise<PortfolioAssets> {
  const data = await queryPortfolioAssets({
    address,
  });

  const categories = data.categories;

  const allocations = getAllocations(categories, assetLists);
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
      fiatValue: result.cap_value,
    })) ?? [];

  // check for asset variants, alloys and canonical assets such as USDC
  const assetVariants = await filterConvertibleAssetVariants(
    checkAssetVariants(userBalanceDenoms, assetLists),
    (contractAddress) => getCachedAlloyStatus(contractAddress, chainList)
  );

  const heldAssets = getHeldAssets(categories, assetLists);

  return {
    all: allocations,
    assets,
    available,
    totalCap,
    totalCapUnknown: isCategoryValueUnknown(
      assetLists,
      categories["total-assets"]
    ),
    assetVariants,
    heldAssets,
  };
}

/**
 * Extracts the assets the user holds from the total-assets category, which
 * sidecar composes from every category (bank balances, staked, unstaking,
 * in-locks, unclaimed rewards, and pooled) in underlying denoms, and pairs
 * each denom with its asset list display symbol when listed.
 */
export function getHeldAssets(
  categories: Categories,
  assetLists: AssetList[]
): HeldAsset[] {
  const assetListAssets = assetLists.flatMap((list) => list.assets);

  return (
    categories["total-assets"]?.account_coins_result?.map(({ coin }) => ({
      denom: coin.denom,
      coinDenom: assetListAssets.find(
        (asset) => asset.coinMinimalDenom === coin.denom
      )?.symbol,
    })) ?? []
  );
}

export interface AlloyStatus {
  isActive: boolean;
  /** Minimal denoms the alloy's transmuter holds 1:1. */
  memberDenoms: string[];
}

const ALLOYED_DENOM_REGEX = /^factory\/(osmo1[a-z0-9]+)\/alloyed\/[^/]+$/;

/** The transmuter contract that mints an alloyed denom, which is the denom's
 *  tokenfactory creator. */
export function getAlloyContractAddress(
  alloyedDenom: string
): string | undefined {
  return ALLOYED_DENOM_REGEX.exec(alloyedDenom)?.[1];
}

const alloyStatusCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

function getCachedAlloyStatus(
  contractAddress: string,
  chainList: Chain[]
): Promise<AlloyStatus> {
  return cachified({
    cache: alloyStatusCache,
    ttl: 1000 * 60, // 1 minute
    key: `alloy-status-${contractAddress}`,
    getFreshValue: async () => {
      const [isActive, assetConfigs] = await Promise.all([
        queryTransmuterIsActive({ contractAddress, chainList }),
        queryTransmuterAssetConfigs({ contractAddress, chainList }),
      ]);
      return {
        isActive: isActive.data.is_active,
        memberDenoms: assetConfigs.data.asset_configs.map(({ denom }) => denom),
      };
    },
  });
}

/**
 * Keeps only variants that convert 1:1: the canonical asset is an alloy, its
 * transmuter is active (a frozen one rejects swaps), and the variant is one of
 * its members. `variantGroupKey` alone also groups legacy consolidations and
 * bridged assets that aren't in any 1:1 pool, which could only convert
 * through a price-moving route.
 *
 * Fails closed: an alloy whose status can't be fetched offers no conversion.
 */
export async function filterConvertibleAssetVariants(
  variants: AssetVariant[],
  getAlloyStatus: (contractAddress: string) => Promise<AlloyStatus>
): Promise<AssetVariant[]> {
  const contractAddresses = new Set(
    variants
      .filter(({ canonicalAsset }) => canonicalAsset?.isAlloyed)
      .map(({ canonicalAsset }) =>
        getAlloyContractAddress(canonicalAsset.coinMinimalDenom)
      )
      .filter((address): address is string => Boolean(address))
  );

  const statusByContract = new Map(
    await Promise.all(
      [...contractAddresses].map(
        async (address) =>
          [
            address,
            await getAlloyStatus(address).catch((error) => {
              console.error(`Failed to get alloy status for ${address}`, error);
              return undefined;
            }),
          ] as const
      )
    )
  );

  return variants.filter(({ amount, canonicalAsset }) => {
    if (!canonicalAsset?.isAlloyed) return false;
    const address = getAlloyContractAddress(canonicalAsset.coinMinimalDenom);
    const status = address ? statusByContract.get(address) : undefined;
    return Boolean(
      status?.isActive &&
      status.memberDenoms.includes(amount.currency.coinMinimalDenom)
    );
  });
}

export function checkAssetVariants(
  userBalanceDenoms: { denom: string; amount: string; fiatValue: string }[],
  assetLists: AssetList[]
): AssetVariant[] {
  const assetListAssets = assetLists.flatMap((list) => list.assets);

  return userBalanceDenoms
    .map(({ denom, amount, fiatValue }) => {
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
          fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(fiatValue)),
          canonicalAsset: canonicalAsset,
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
