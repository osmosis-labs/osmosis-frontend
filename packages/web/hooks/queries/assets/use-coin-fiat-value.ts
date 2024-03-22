import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { useMemo } from "react";

import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";

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
