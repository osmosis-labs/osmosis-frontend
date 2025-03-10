import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import { mulPrice } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { usePrice } from "~/hooks/queries/assets/use-price";

export function useCoinFiatValue(
  coin?: CoinPretty,
  vsCurrency = DEFAULT_VS_CURRENCY
): { fiatValue: PricePretty | undefined; isLoading: boolean } {
  const { price, isLoading } = usePrice(coin?.currency);
  return {
    fiatValue: useMemo(
      () => mulPrice(coin, price, vsCurrency),
      [coin, price, vsCurrency]
    ),
    isLoading,
  };
}
