import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import { aggregateCoinsByDenom } from "@osmosis-labs/utils";

import { captureErrorAndReturn, captureIfError } from "../../../utils/error";
import { SortDirection } from "../../../utils/sort";
import { queryBalances } from "../../cosmos";
import { queryAccountLockedCoins } from "../../osmosis/lockup/account-locked-coins";
import { getUserUnderlyingCoinsFromClPositions } from "../concentrated-liquidity";
import { getGammShareUnderlyingCoins } from "../pools/share";
import { getUserTotalDelegatedCoin } from "../staking/user";
import { Asset, AssetFilter, calcSumCoinsValue, getAsset, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { calcAssetValue } from "./price";

/** Available if the user holds a balance. */
export type MaybeUserAssetCoin = Partial<{
  amount: CoinPretty;
  usdValue: PricePretty;
}>;

/** Given an asset, appends the user's balance if applicable. */
export async function getAssetWithUserBalance<TAsset extends Asset>({
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
    userOsmoAddress,
    includePreview: true,
  });
  return userAssets[0];
}

/** Maps user coin data given a list of assets of a given type and a potential user Osmosis address.
 *  If no assets provided, they will be fetched and passed the given search params.
 *  If no search param is provided and `sortFiatValueDirection` is defined, it will sort by user fiat value.  */
export async function mapGetAssetsWithUserBalances<TAsset extends Asset>(
  params: {
    assetLists: AssetList[];
    chainList: Chain[];
    assets?: TAsset[];
    userOsmoAddress?: string;
    sortFiatValueDirection?: SortDirection;
  } & AssetFilter
): Promise<(TAsset & MaybeUserAssetCoin)[]> {
  const { userOsmoAddress, search, sortFiatValueDirection } = params;
  let { assets } = params;
  if (!assets) assets = getAssets({ ...params }) as TAsset[];
  if (!userOsmoAddress) return assets;

  const { balances } = await queryBalances({
    ...params,
    bech32Address: userOsmoAddress,
  });

  const eventualUserAssets = assets
    .map(async (asset) => {
      const balance = balances.find((a) => a.denom === asset.coinMinimalDenom);

      // not a user asset
      if (!balance) return asset;

      // is user asset, include user data
      const usdValue = await calcAssetValue({
        ...params,
        anyDenom: asset.coinMinimalDenom,
        amount: balance.amount,
      }).catch((e) => captureErrorAndReturn(e, undefined));

      return {
        ...asset,
        amount: new CoinPretty(asset, balance.amount),
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
  ]);

  const { underlyingGammShareCoins, available } = coins[0];
  const bankCoins = [...underlyingGammShareCoins, ...available];
  const clCoins = coins[1];
  const lockedCoins = coins[2];
  const delegatedCoin = coins[3];

  const allCoins = [...bankCoins, ...clCoins, ...lockedCoins, delegatedCoin];

  const [aggregatedValue] = await Promise.all([
    calcSumCoinsValue({ ...params, coins: allCoins }),
  ]);

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
