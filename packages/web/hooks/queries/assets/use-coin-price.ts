import { CoinPretty } from "@keplr-wallet/unit";

import { api } from "~/utils/trpc";

export function useCoinPrice(coin?: CoinPretty) {
  const { data: price, ...otherUtils } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: coin?.currency?.coinMinimalDenom ?? "",
    },
    {
      enabled: Boolean(coin?.currency),
      cacheTime: 1000 * 30, // 30 seconds
      staleTime: 1000 * 30, // 30 seconds
    }
  );

  return {
    price,
    ...otherUtils,
  };
}
