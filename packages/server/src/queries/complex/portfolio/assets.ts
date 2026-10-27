import { AssetList, Chain, MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import { Dec, Int, RatePretty } from "@osmosis-labs/unit";
import { sort } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  captureErrorAndReturn,
  captureIfError,
  DEFAULT_LRU_OPTIONS,
} from "../../../utils";
import {
  queryTransmuterAssetConfigs,
  queryTransmuterCorruptedDenoms,
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
  /** Total held across every category, in minimal units. */
  amount: string;
  /** Fiat value of `amount` from sidecar; "0" when sidecar couldn't price it. */
  fiatValue: string;
};

export type PortfolioAssets = {
  all: Allocation[];
  assets: Allocation[];
  available: Allocation[];
  totalCap: PricePretty;
  /** A held coin that should have a price couldn't be priced, so `totalCap` is unknown. */
  totalCapUnknown: boolean;
  /** Variants grouped with a canonical asset. Only those passing
   *  `filterConvertibleAssetVariants` with `getAlloyStatuses` convert 1:1. */
  assetVariantCandidates: AssetVariant[];
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

  // Variants grouped with a canonical asset. Which of them actually convert
  // depends on each alloy's transmuter status, fetched separately
  // (`getAlloyStatuses`) so contract queries never hold up the portfolio.
  const assetVariantCandidates = checkAssetVariants(
    userBalanceDenoms,
    assetLists
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
    assetVariantCandidates,
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
    categories["total-assets"]?.account_coins_result?.map(
      ({ coin, cap_value }) => ({
        denom: coin.denom,
        coinDenom: assetListAssets.find(
          (asset) => asset.coinMinimalDenom === coin.denom
        )?.symbol,
        amount: coin.amount,
        fiatValue: cap_value,
      })
    ) ?? []
  );
}

export interface AlloyStatus {
  isActive: boolean;
  /** Normalization factor by minimal denom, for every asset the alloy's
   *  transmuter holds plus the alloyed denom itself. */
  normalizationFactors: Record<string, string>;
  /** Members the transmuter won't take in (see `queryTransmuterCorruptedDenoms`). */
  corruptedDenoms: string[];
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
    // A transmuter frozen within this window still shows Convert until the
    // entry expires, and the client's own one-minute stale time stacks on
    // top, so up to about two minutes. The row's fee simulation then fails
    // and disables it, so nothing is broadcast. Accepted to keep contract
    // queries off most loads.
    ttl: 1000 * 60, // 1 minute
    key: `alloy-status-${contractAddress}`,
    getFreshValue: async ({ metadata }) => {
      const result = await Promise.all([
        queryTransmuterIsActive({ contractAddress, chainList }),
        queryTransmuterAssetConfigs({ contractAddress, chainList }),
        queryTransmuterCorruptedDenoms({ contractAddress, chainList }),
      ])
        .then(([isActive, assetConfigs, corruptedDenoms]) => {
          // Checked here so a malformed response fails closed and is cached
          // like an outage, instead of throwing later in the filter.
          const active = isActive?.data?.is_active;
          const configs = assetConfigs?.data?.asset_configs;
          const corrupted = corruptedDenoms?.data?.corrupted_denoms;
          if (
            typeof active !== "boolean" ||
            !Array.isArray(configs) ||
            !configs.every(
              ({ normalization_factor }) =>
                typeof normalization_factor === "string" &&
                /^\d+$/.test(normalization_factor)
            ) ||
            !Array.isArray(corrupted) ||
            !corrupted.every((denom) => typeof denom === "string")
          )
            throw new Error(
              `Unexpected transmuter status response from ${contractAddress}`
            );
          return {
            isActive: active,
            normalizationFactors: Object.fromEntries(
              configs.map(({ denom, normalization_factor }) => [
                denom,
                normalization_factor,
              ])
            ),
            corruptedDenoms: corrupted,
          };
        })
        .catch((e): AlloyStatus => {
          // Fail closed, but briefly: caching the failure keeps a node outage
          // from adding the full request timeout to every lookup.
          metadata.ttl = 1000 * 30; // 30 seconds
          return captureErrorAndReturn(e, INACTIVE_ALLOY_STATUS);
        });
      return result;
    },
  });
}

const INACTIVE_ALLOY_STATUS: AlloyStatus = {
  isActive: false,
  normalizationFactors: {},
  corruptedDenoms: [],
};

/** How many alloys' statuses are fetched at once: each costs three contract
 *  queries, and public REST endpoints throttle bursts. */
const ALLOY_STATUS_CONCURRENCY = 3;

/** Transmuter contracts minting the alloys these variants convert into. */
export function getAlloyContractAddresses(variants: AssetVariant[]): string[] {
  return [
    ...new Set(
      variants
        .filter(({ canonicalAsset }) => canonicalAsset?.isAlloyed)
        .map(({ canonicalAsset }) =>
          getAlloyContractAddress(canonicalAsset.coinMinimalDenom)
        )
        .filter((address): address is string => Boolean(address))
    ),
  ].sort();
}

/** Status of each alloy transmuter, a few at a time. A failed lookup comes
 *  back inactive (cached briefly), so its variants aren't offered.
 *
 *  Only contracts minting an alloy in the asset list are queried: the
 *  procedure is also served by our API, so caller-chosen addresses must not
 *  turn into contract queries from our servers. */
export async function getAlloyStatuses({
  contractAddresses,
  assetLists,
  chainList,
}: {
  contractAddresses: string[];
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<Record<string, AlloyStatus>> {
  const knownAlloyContracts = new Set(
    assetLists
      .flatMap(({ assets }) => assets)
      .filter(({ isAlloyed }) => isAlloyed)
      .map(({ coinMinimalDenom }) => getAlloyContractAddress(coinMinimalDenom))
      .filter((address): address is string => Boolean(address))
  );
  const statuses: Record<string, AlloyStatus> = {};
  const queue = [...new Set(contractAddresses)].filter((address) =>
    knownAlloyContracts.has(address)
  );
  await Promise.all(
    Array.from({ length: ALLOY_STATUS_CONCURRENCY }, async () => {
      for (let address = queue.shift(); address; address = queue.shift()) {
        statuses[address] = await getCachedAlloyStatus(address, chainList);
      }
    })
  );
  return statuses;
}

/**
 * Keeps only variants that convert 1:1: the canonical asset is an alloy, its
 * transmuter is active (a frozen one rejects swaps), and the variant is one of
 * its members. `variantGroupKey` alone also groups legacy consolidations and
 * bridged assets that aren't in any 1:1 pool, which could only convert
 * through a price-moving route. Also drops dust that would mint less than two
 * units of the alloy: the transmuter scales amounts by `outFactor / inFactor`,
 * rounding down, so e.g. 1 adydx (factor 10^6) into allDYDX (factor 1) yields
 * nothing and the quote fails, and a single unit out leaves no room for any
 * slippage allowance while costing more in gas than it is worth.
 *
 * Fails closed: an alloy without a status offers no conversion, and neither
 * does a corrupted member, which the transmuter won't take in.
 */
export function filterConvertibleAssetVariants(
  variants: AssetVariant[],
  statusByContract: Record<string, AlloyStatus>
): AssetVariant[] {
  return variants.filter(({ amount, canonicalAsset }) => {
    if (!canonicalAsset?.isAlloyed) return false;
    const address = getAlloyContractAddress(canonicalAsset.coinMinimalDenom);
    const status =
      address && Object.prototype.hasOwnProperty.call(statusByContract, address)
        ? statusByContract[address]
        : undefined;
    if (!status?.isActive) return false;
    if (status.corruptedDenoms.includes(amount.currency.coinMinimalDenom))
      return false;
    // Own keys only, so a denom like "constructor" can't read an inherited
    // property off the plain object.
    const factorOf = (denom: string) =>
      Object.prototype.hasOwnProperty.call(status.normalizationFactors, denom)
        ? status.normalizationFactors[denom]
        : undefined;
    const inFactor = factorOf(amount.currency.coinMinimalDenom);
    const outFactor = factorOf(canonicalAsset.coinMinimalDenom);
    if (!inFactor || !outFactor) return false;
    // At least two units out: amount * outFactor / inFactor >= 2.
    return new Int(amount.toCoin().amount)
      .mul(new Int(outFactor))
      .gte(new Int(inFactor).mul(new Int(2)));
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
