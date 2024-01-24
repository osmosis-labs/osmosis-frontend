import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";

import { AssetLists } from "~/config/generated/asset-lists";
import { SortDirection } from "~/utils/sort";

import { queryBalances } from "../../cosmos";
import { Asset, AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { calcAssetValue } from "./price";

/** Basic user info if the user holds a balance. */
export type MaybeUserAssetInfo = Partial<{
  amount: CoinPretty;
  usdValue: PricePretty;
}>;

export async function getUserAssetInfo<TAsset extends Asset>({
  assetList = AssetLists,
  asset,
  userOsmoAddress,
}: {
  assetList?: AssetList[];
  asset: TAsset;
  userOsmoAddress?: string;
}): Promise<TAsset & MaybeUserAssetInfo> {
  if (!userOsmoAddress) return asset;

  const userAssets = await mapGetUserAssetInfos({
    assetList,
    assets: [asset],
    userOsmoAddress,
    includeUnlisted: true,
  });
  return userAssets[0];
}

/** Maps user asset balance data given a list of assets of a given type and a potential user Osmosis address.
 *  If no assets provided, they will be fetched and passed the given search params.
 *  If no search param is provided and `sortFiatValueDirection` is defined, it will sort by user fiat value.  */
export async function mapGetUserAssetInfos<TAsset extends Asset>({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
  userOsmoAddress?: string;
  sortFiatValueDirection?: SortDirection;
} & AssetFilter = {}): Promise<(TAsset & MaybeUserAssetInfo)[]> {
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
    .filter((a): a is Promise<TAsset & MaybeUserAssetInfo> => !!a);

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
