import { CoinPretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryAllocation } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { getAsset } from "../assets";

const allocationCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export interface GetAllocationResponse {
  all: {
    key: string;
    percentage: number;
    amount: number;
    asset?: CoinPretty;
  }[];
  assets: {
    key: string;
    percentage: number;
    amount: number;
    asset?: CoinPretty;
  }[];
  available: any;
}

async function getAll(categories: any) {
  const userBalancesCap = +categories["user-balances"].capitalization;
  const stakedCap = +categories["staked"].capitalization;
  const unstakingCap = +categories["unstaking"].capitalization;
  const unclaimedRewardsCap = +categories["unclaimed-rewards"].capitalization;
  const pooledCap = +categories["pooled"].capitalization;

  const totalCap =
    userBalancesCap +
    stakedCap +
    unstakingCap +
    unclaimedRewardsCap +
    pooledCap;

  return [
    {
      key: "Available",
      percentage: (userBalancesCap / totalCap) * 100,
      amount: userBalancesCap,
    },
    {
      key: "Staked",
      percentage: (stakedCap / totalCap) * 100,
      amount: stakedCap,
    },
    {
      key: "Unstaking",
      percentage: (unstakingCap / totalCap) * 100,
      amount: unstakingCap,
    },
    {
      key: "Unclaimed Rewards",
      percentage: (unclaimedRewardsCap / totalCap) * 100,
      amount: unclaimedRewardsCap,
    },
    {
      key: "Pooled",
      percentage: (pooledCap / totalCap) * 100,
      amount: pooledCap,
    },
  ];
}

async function getAssets(categories: any, assetLists: AssetList[]) {
  console.log("assetLists: ", assetLists);
  const totalAssets = categories["total-assets"];
  const totalCap = +totalAssets.capitalization;

  // Get top 5 assets by cap value
  const sortedAccountCoinsResults = totalAssets.account_coins_result.sort(
    (a: any, b: any) => +b.cap_value - +a.cap_value
  );

  const top5AccountCoinsResults = sortedAccountCoinsResults.slice(0, 5);

  const assets = top5AccountCoinsResults.map((asset: any, index: number) => {
    const assetFromAssetLists = getAsset({
      assetLists,
      anyDenom: asset.coin.denom,
    });

    return {
      key: assetFromAssetLists.coinDenom,
      percentage: (asset.cap_value / totalCap) * 100,
      amount: +asset.cap_value,
      color: COLORS[index % COLORS.length],
    };
  });

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: any) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other = {
    key: "Other",
    percentage: otherPercentage,
    amount: otherAmount,
    color: "bg-osmoverse-500",
  };

  return [...assets, other];
}

async function getAvailable(categories: any, assetLists: AssetList[]) {
  const userBalances = categories["user-balances"];
  const totalCap = +userBalances.capitalization;
  // Get top 5 assets by cap value

  const sortedAccountCoinsResults = userBalances.account_coins_result.sort(
    (a: any, b: any) => +b.cap_value - +a.cap_value
  );

  const top5AccountCoinsResults = sortedAccountCoinsResults.slice(0, 5);

  const assets = top5AccountCoinsResults.map((asset: any, index: number) => {
    const assetFromAssetLists = getAsset({
      assetLists,
      anyDenom: asset.coin.denom,
    });

    return {
      key: assetFromAssetLists.coinDenom,
      percentage: (asset.cap_value / totalCap) * 100,
      amount: +asset.cap_value,
    };
  });

  const otherAssets = sortedAccountCoinsResults.slice(5);
  const otherAmount = otherAssets.reduce(
    (sum: number, asset: any) => sum + +asset.cap_value,
    0
  );
  const otherPercentage = (otherAmount / totalCap) * 100;

  const other = {
    key: "Other",
    percentage: otherPercentage,
    amount: otherAmount,
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
  return await cachified({
    cache: allocationCache,
    ttl: 1000 * 60 * 0.25, // 15 seconds since a user can transact quickly
    key: `allocation-${address}`,
    getFreshValue: async () => {
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
    },
  });
}

// data
// {
//     "categories": {
//         "in-locks": {
//             "capitalization": "0.000000000000000000",
//             "is_best_effort": false
//         },
//         "pooled": {
//             "capitalization": "0.000000000000000000",
//             "is_best_effort": false
//         },
//         "staked": {
//             "capitalization": "92.292198354360542366",
//             "is_best_effort": false
//         },
//         "total-assets": {
//             "capitalization": "93.381587825321876982",
//             "account_coins_result": [
//                 {
//                     "coin": {
//                         "denom": "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
//                         "amount": "200395428"
//                     },
//                     "cap_value": "0.031323544729681016"
//                 },
//                 {
//                     "coin": {
//                         "denom": "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
//                         "amount": "315296168"
//                     },
//                     "cap_value": "0.040626642342571289"
//                 },
//                 {
//                     "coin": {
//                         "denom": "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
//                         "amount": "15746"
//                     },
//                     "cap_value": "0.010030111588576236"
//                 },
//                 {
//                     "coin": {
//                         "denom": "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
//                         "amount": "127891131120"
//                     },
//                     "cap_value": "0.007073272575664195"
//                 },
//                 {
//                     "coin": {
//                         "denom": "uosmo",
//                         "amount": "211159602"
//                     },
//                     "cap_value": "93.292534254085384246"
//                 }
//             ],
//             "is_best_effort": false
//         },
//         "unclaimed-rewards": {
//             "capitalization": "0.000000000000000000",
//             "is_best_effort": false
//         },
//         "unstaking": {
//             "capitalization": "0.000000000000000000",
//             "is_best_effort": false
//         },
//         "user-balances": {
//             "capitalization": "1.089389470961334615",
//             "account_coins_result": [
//                 {
//                     "coin": {
//                         "denom": "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
//                         "amount": "200395428"
//                     },
//                     "cap_value": "0.031323544729681016"
//                 },
//                 {
//                     "coin": {
//                         "denom": "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
//                         "amount": "315296168"
//                     },
//                     "cap_value": "0.040626642342571289"
//                 },
//                 {
//                     "coin": {
//                         "denom": "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
//                         "amount": "15746"
//                     },
//                     "cap_value": "0.010030111588576236"
//                 },
//                 {
//                     "coin": {
//                         "denom": "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
//                         "amount": "127891131120"
//                     },
//                     "cap_value": "0.007073272575664195"
//                 },
//                 {
//                     "coin": {
//                         "denom": "uosmo",
//                         "amount": "2264174"
//                     },
//                     "cap_value": "1.000335899724841879"
//                 }
//             ],
//             "is_best_effort": false
//         }
//     }
// }
