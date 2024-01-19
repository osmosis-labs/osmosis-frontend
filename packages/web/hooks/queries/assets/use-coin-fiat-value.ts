import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { api } from "~/utils/trpc";

export function useCoinFiatValue(
  coin?: CoinPretty,
  vsCurrency = DEFAULT_VS_CURRENCY
): PricePretty | undefined {
  const { data: price } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: coin?.currency?.coinMinimalDenom ?? "",
    },
    {
      enabled: Boolean(coin?.currency),
    }
  );

  return useMemo(() => {
    if (!coin || !price) {
      return undefined;
    }

    const value = coin.toDec().mul(price.toDec());
    return new PricePretty(vsCurrency, value);
  }, [coin, price, vsCurrency]);
}
