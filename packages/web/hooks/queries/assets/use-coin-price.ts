import { CoinPretty } from "@keplr-wallet/unit";

import { api } from "~/utils/trpc";

export function useCoinPrice(coin?: CoinPretty) {
  const { data: price, ...otherUtils } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: coin?.currency?.coinMinimalDenom ?? "",
    },
    {
      enabled: Boolean(coin?.currency),
      cacheTime: 1000 * 3, // 3 second
      staleTime: 1000 * 3, // 3 second
    }
  );

  return {
    price,
    ...otherUtils,
  };
}
