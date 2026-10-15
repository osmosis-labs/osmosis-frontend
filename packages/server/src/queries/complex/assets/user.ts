import { AssetList, Chain, MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import {
  aggregateCoinsByDenom,
  isNil,
  SortDirection,
} from "@osmosis-labs/utils";

import { captureErrorAndReturn, captureIfError } from "../../../utils/error";
import { queryBalances } from "../../cosmos";
import { queryAccountLockedCoins } from "../../osmosis/lockup/account-locked-coins";
import { getUserUnderlyingCoinsFromClPositions } from "../concentrated-liquidity";
import { getPool } from "../pools";
import { getGammShareUnderlyingCoins } from "../pools/share";
import {
  getUserTotalDelegatedCoin,
  getUserTotalUndelegations,
} from "../staking/user";
import { AssetFilter, getAsset, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getAssetMarketActivity } from "./market";
import { calcAssetValue } from "./price";

/** Available if the user holds a balance. */
export type MaybeUserAssetCoin = Partial<{
  amount: CoinPretty;
  usdValue: PricePretty;
}>;

/** Given an asset, appends the user's balance if applicable. */
export async function getAssetWithUserBalance<TAsset extends MinimalAsset>({
  assetLists,
  chainList,
  asset,
  userOsmoAddress,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  asset: TAsset;
  userOsmoAddress?: string;
}): Promise<TAsset & MaybeUserAssetCoin> {
  if (!userOsmoAddress) return asset;

  const userAssets = await mapGetAssetsWithUserBalances({
    assetLists,
    chainList,
    assets: [asset],
    userOsmoAddress: userOsmoAddress,
    includePreview: true,
    priceSource: "sidecar",
  });
  return userAssets[0];
}

/** Maps user coin data given a list of assets of a given type and a potential user Osmosis address.
 *  If no assets provided, they will be fetched and passed the given search params.
 *  If no search param is provided and `sortFiatValueDirection` is defined, it will sort by user fiat value.  */
export async function mapGetAssetsWithUserBalances<
  TAsset extends MinimalAsset & { liquidity?: number | PricePretty },
>({
  poolId,
  priceSource = "market",
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  assets?: TAsset[];
  userOsmoAddress?: string;
  sortFiatValueDirection?: SortDirection;
  /** Lists use market snapshots; explicit single-asset reads may use SQS. */
  priceSource?: "market" | "sidecar";
  /**
   * If poolId is provided, only include assets that are part of the pool.
   */
  poolId?: string;
} & AssetFilter): Promise<(TAsset & MaybeUserAssetCoin)[]> {
  const { userOsmoAddress, search, sortFiatValueDirection } = params;
  let { assets } = params;
  if (!assets) assets = getAssets(params) as TAsset[];

  const marketPrices = new Map<string, PricePretty>();
  assets = await Promise.all(
    assets.map(async (asset) => {
      const marketActivity = await getAssetMarketActivity({
        coinMinimalDenom: asset.coinMinimalDenom,
      }).catch((e) => captureErrorAndReturn(e, undefined));
      if (marketActivity?.price?.toDec().isPositive()) {
        marketPrices.set(asset.coinMinimalDenom, marketActivity.price);
      }

      return {
        ...asset,
        liquidity: marketActivity?.liquidity,
      };
    })
  );

  // If poolId is provided, only include assets that are part of the pool.
  if (assets && !isNil(poolId)) {
    const { reserveCoins } = await getPool({
      assetLists: params.assetLists,
      chainList: params.chainList,
      poolId,
    });
    assets = assets.filter((asset) =>
      reserveCoins.some(
        (coin) => coin.currency.coinMinimalDenom === asset.coinMinimalDenom
      )
    ) as TAsset[];
  }

  if (!userOsmoAddress) return assets;

  const { balances } = await queryBalances({
    chainList: params.chainList,
    bech32Address: userOsmoAddress,
  });

  const eventualUserAssets = assets
    .map(async (asset) => {
      const balance = balances.find((a) => a.denom === asset.coinMinimalDenom);

      // not a user asset
      if (!balance) return asset;

      const amount = new CoinPretty(asset, balance.amount);
      const marketPrice = marketPrices.get(asset.coinMinimalDenom);
      const usdValue =
        priceSource === "sidecar" && amount.toDec().isPositive()
          ? await calcAssetValue({
              ...params,
              anyDenom: asset.coinMinimalDenom,
              amount: balance.amount,
            }).catch((e) => captureErrorAndReturn(e, undefined))
          : marketPrice?.toDec().mul(amount.toDec());

      return {
        ...asset,
        amount,
        usdValue: usdValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, usdValue)
          : undefined,
      };
    })
    .filter((a): a is Promise<TAsset & MaybeUserAssetCoin> => !!a);

  const userAssets = await Promise.all(eventualUserAssets);

  // if no search provided, sort by usdValue at head of list by default
  if (!search && sortFiatValueDirection) {
    userAssets.sort((a, b) => {
      if (!Boolean(a.usdValue) && !Boolean(b.usdValue)) return 0;
      if (Boolean(a.usdValue) && !Boolean(b.usdValue)) return -1;
      if (!Boolean(a.usdValue) && Boolean(b.usdValue)) return 1;
      if (!a.isVerified && b.isVerified) return 1;

      // sort by USD value respecting given sort direction
      if (sortFiatValueDirection === "desc") {
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

/** Returns total fiat value of all assets held by a user.
 *  Includes assets from bank module, GAMM shares and CL positions aggregated by denom.*/
export async function getUserAssetsTotal(params: {
  assetLists: AssetList[];
  chainList: Chain[];
  userOsmoAddress: string;
}): Promise<{ value: PricePretty; coins: CoinPretty[] }> {
  // Use Promise.all to send concurrent requests.
  const coins = await Promise.all([
    getUserCoinsFromBank(params),
    getUserUnderlyingCoinsFromClPositions(params),
    getUserShareUnderlyingCoinsFromLocks(params),
    getUserTotalDelegatedCoin(params),
    getUserTotalUndelegations(params),
  ]);

  const { underlyingGammShareCoins, available } = coins[0];
  const bankCoins = [...underlyingGammShareCoins, ...available];
  const clCoins = coins[1];
  const lockedCoins = coins[2];
  const delegatedCoin = coins[3];
  const undelegatingCoin = coins[4];

  const allCoins = [
    ...bankCoins,
    ...clCoins,
    ...lockedCoins,
    delegatedCoin,
    undelegatingCoin,
  ];

  // Totals include every holding, but must not route-search every holding.
  const values = await Promise.all(
    aggregateCoinsByDenom(allCoins).map(async (coin) => {
      const activity = await getAssetMarketActivity(coin.currency).catch((e) =>
        captureErrorAndReturn(e, undefined)
      );
      return activity?.price?.toDec().isPositive()
        ? activity.price.toDec().mul(coin.toDec())
        : new Dec(0);
    })
  );
  const aggregatedValue = values.reduce(
    (sum, value) => sum.add(value),
    new Dec(0)
  );

  return {
    value: new PricePretty(DEFAULT_VS_CURRENCY, aggregatedValue),
    coins: allCoins,
  };
}

/** Lists all of a user's underlying assets in bank module.
 *  Only includes assets in asset list.
 *  Returns breakdown by underlying assets in GAMM pools as well as available assets. */
export async function getUserCoinsFromBank(params: {
  assetLists: AssetList[];
  chainList: Chain[];
  userOsmoAddress: string;
}): Promise<{
  underlyingGammShareCoins: CoinPretty[];
  available: CoinPretty[];
}> {
  // get bank balances
  const { balances } = await queryBalances({
    ...params,
    bech32Address: params.userOsmoAddress,
  });

  const eventualShareCoins: Promise<CoinPretty[] | undefined>[] = [];
  const availableCoins: CoinPretty[] = [];

  // Get available listed assets and GAMM shares
  balances.forEach(({ denom, amount }) => {
    if (denom.includes("gamm")) {
      eventualShareCoins.push(
        getGammShareUnderlyingCoins({
          ...params,
          denom,
          amount,
        }).catch((e) => captureErrorAndReturn(e, undefined))
      );
    } else {
      const asset = captureIfError(() =>
        getAsset({ ...params, anyDenom: denom })
      );
      if (asset) availableCoins.push(new CoinPretty(asset, amount));
    }
  });

  const shareCoins = (await Promise.all(eventualShareCoins))
    .filter((coins) => !!coins)
    .flat() as CoinPretty[];

  return {
    underlyingGammShareCoins: aggregateCoinsByDenom(shareCoins),
    available: aggregateCoinsByDenom(availableCoins),
  };
}

/** Lists all of a user's assets contained within locks. Locked or unlocking.
 *  NOTE: only considers locked GAMM shares. */
export async function getUserShareUnderlyingCoinsFromLocks(params: {
  assetLists: AssetList[];
  chainList: Chain[];
  userOsmoAddress: string;
}): Promise<CoinPretty[]> {
  const lockedCoins = await queryAccountLockedCoins({
    ...params,
    bech32Address: params.userOsmoAddress,
  });

  const eventualUserLockedAssets = lockedCoins.coins.map(async (coin) => {
    if (coin.denom.includes("gamm")) {
      return await getGammShareUnderlyingCoins({ ...params, ...coin }).catch(
        (e) => captureErrorAndReturn(e, [])
      );
    }
    return [];
  });

  return (await Promise.all(eventualUserLockedAssets)).flat();
}
