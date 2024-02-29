import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";

import { AssetLists } from "~/config/generated/asset-lists";
import { aggregateCoinsByDenom } from "~/utils/coin";
import { SortDirection } from "~/utils/sort";

import { queryBalances } from "../../cosmos";
import { queryAccountLockedCoins } from "../../osmosis/lockup/account-locked-coins";
import { getUserUnderlyingCoinsFromClPositions } from "../concentrated-liquidity";
import { getGammShareUnderlyingCoins } from "../pools/share";
import { getUserTotalDelegatedCoin } from "../staking/user";
import {
  Asset,
  AssetFilter,
  calcCoinValue,
  calcSumCoinsValue,
  getAsset,
  getAssets,
} from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { calcAssetValue } from "./price";

/** Available if the user holds a balance. */
export type MaybeUserAssetCoin = Partial<{
  amount: CoinPretty;
  usdValue: PricePretty;
}>;

export async function getUserAssetCoin<TAsset extends Asset>({
  assetList = AssetLists,
  asset,
  userOsmoAddress,
}: {
  assetList?: AssetList[];
  asset: TAsset;
  userOsmoAddress?: string;
}): Promise<TAsset & MaybeUserAssetCoin> {
  if (!userOsmoAddress) return asset;

  const userAssets = await mapGetUserAssetCoins({
    assetList,
    assets: [asset],
    userOsmoAddress,
    includePreview: true,
  });
  return userAssets[0];
}

/** Maps user coin data given a list of assets of a given type and a potential user Osmosis address.
 *  If no assets provided, they will be fetched and passed the given search params.
 *  If no search param is provided and `sortFiatValueDirection` is defined, it will sort by user fiat value.  */
export async function mapGetUserAssetCoins<TAsset extends Asset>({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
  userOsmoAddress?: string;
  sortFiatValueDirection?: SortDirection;
} & AssetFilter = {}): Promise<(TAsset & MaybeUserAssetCoin)[]> {
  const { userOsmoAddress, search, sortFiatValueDirection } = params;
  let { assets } = params;
  if (!assets) assets = (await getAssets(params)) as TAsset[];
  if (!userOsmoAddress) return assets;

  const { balances } = await queryBalances({ bech32Address: userOsmoAddress });

  const eventualUserAssets = assets
    .map(async (asset) => {
      const balance = balances.find((a) => a.denom === asset.coinMinimalDenom);

      // not a user asset
      if (!balance) return asset;

      // is user asset, include user data
      const usdValue = await calcAssetValue({
        anyDenom: asset.coinMinimalDenom,
        amount: balance.amount,
      }).catch(() => {
        console.error(asset.coinMinimalDenom, "likely missing price config");
        return undefined;
      });

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

/** Lists of all of a user's underlying coins that are listed in asset list, along with their total fiat values.
 *  Broken down by delegated/staked, pooled (CL and GAMM shares), and available assets (not CL assets).
 *  Includes assets from bank module, GAMM shares and CL positions aggregated by denom.*/
export async function getUserAssetsBreakdown(address: {
  userOsmoAddress: string;
}): Promise<{
  delegated: CoinPretty;
  delegatedValue: PricePretty;

  pooled: CoinPretty[];
  pooledValue: PricePretty;

  available: CoinPretty[];
  availableValue: PricePretty;

  aggregated: CoinPretty[];
  aggregatedValue: PricePretty;
}> {
  // Use Promise.all to send concurrent requests.
  const coins = await Promise.all([
    getUserCoinsFromBank(address),
    getUserUnderlyingCoinsFromClPositions(address),
    getUserShareUnderlyingCoinsFromLocks(address),
    getUserTotalDelegatedCoin(address),
  ]);

  const { underlyingGammShareCoins, available } = coins[0];
  const bankCoins = [...underlyingGammShareCoins, ...available];
  const clCoins = coins[1];
  const lockedCoins = coins[2];
  const delegatedCoin = coins[3];

  const pooledCoins = [...underlyingGammShareCoins, ...clCoins, ...lockedCoins];
  const allCoins = [...bankCoins, ...clCoins, ...lockedCoins, delegatedCoin];

  const delegatedValue = await calcCoinValue(delegatedCoin);
  const pooledValue = await calcSumCoinsValue(pooledCoins);
  const availableValue = await calcSumCoinsValue(available);
  const aggregatedValue = await calcSumCoinsValue(allCoins);

  return {
    delegated: delegatedCoin, // Should be OSMO
    delegatedValue: new PricePretty(DEFAULT_VS_CURRENCY, delegatedValue ?? 0),

    pooled: aggregateCoinsByDenom(pooledCoins),
    pooledValue: new PricePretty(DEFAULT_VS_CURRENCY, pooledValue ?? 0),

    available: aggregateCoinsByDenom(available),
    availableValue: new PricePretty(DEFAULT_VS_CURRENCY, availableValue ?? 0),

    aggregated: aggregateCoinsByDenom(allCoins),
    aggregatedValue: new PricePretty(DEFAULT_VS_CURRENCY, aggregatedValue ?? 0),
  };
}

/** Lists all of a user's underlying assets in bank module.
 *  Only includes assets in asset list.
 *  Returns breakdown by underlying assets in GAMM pools as well as available assets. */
export async function getUserCoinsFromBank({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}): Promise<{
  underlyingGammShareCoins: CoinPretty[];
  available: CoinPretty[];
}> {
  // get bank balances
  const { balances } = await queryBalances({ bech32Address: userOsmoAddress });

  const eventualShareCoins: Promise<CoinPretty[] | undefined>[] = [];
  const eventualAvailableCoins: Promise<CoinPretty | undefined>[] = [];

  // Get available listed assets and GAMM shares
  balances.forEach(({ denom, amount }) => {
    if (denom.includes("gamm")) {
      eventualShareCoins.push(
        getGammShareUnderlyingCoins({
          denom,
          amount,
        }).catch(() => undefined)
      );
    } else {
      eventualAvailableCoins.push(
        getAsset({ anyDenom: denom })
          .then((asset) => new CoinPretty(asset, amount))
          .catch(() => undefined)
      );
    }
  });

  const shareCoins = (await Promise.all(eventualShareCoins))
    .filter((coins) => !!coins)
    .flat() as CoinPretty[];
  const availableCoins = (await Promise.all(eventualAvailableCoins)).filter(
    (coins) => !!coins
  ) as CoinPretty[];

  return {
    underlyingGammShareCoins: aggregateCoinsByDenom(shareCoins),
    available: aggregateCoinsByDenom(availableCoins),
  };
}

/** Lists all of a user's assets contained within locks.
 *  NOTE: only considers locked GAMM shares. */
export async function getUserShareUnderlyingCoinsFromLocks({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}): Promise<CoinPretty[]> {
  const lockedCoins = await queryAccountLockedCoins({
    bech32Address: userOsmoAddress,
  });

  const eventualUserLockedAssets = lockedCoins.coins.map(async (coin) => {
    if (coin.denom.includes("gamm")) {
      return await getGammShareUnderlyingCoins(coin).catch(() => undefined);
    }
  });

  return (await Promise.all(eventualUserLockedAssets))
    .filter((a): a is CoinPretty[] => !!a)
    .flat();
}
