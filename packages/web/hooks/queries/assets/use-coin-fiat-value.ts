import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";

export function useCoinFiatValue(
  coin?: CoinPretty,
  vsCurrency = DEFAULT_VS_CURRENCY
): { fiatValue: PricePretty | undefined; isLoading: boolean } {
  const { price, isLoading } = useCoinPrice(coin);

  return {
    fiatValue: useMemo(() => {
      if (!coin || !price) {
        return undefined;
      }

      const value = coin.toDec().mul(price.toDec());
      return new PricePretty(vsCurrency, value);
    }, [coin, price, vsCurrency]),
    isLoading,
  };
}
