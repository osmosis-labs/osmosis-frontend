import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
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

// mulPrice multiplies the amount of a coin by its price to get the final value.
// It returns the final value as a PricePretty object.
// Returns undefined if either the amount or price is undefined.
export function mulPrice(
  amount: CoinPretty | undefined,
  price: PricePretty | undefined,
  vsCurrency: FiatCurrency
) {
  if (!amount || !price) {
    return undefined;
  }

  const value = amount.toDec().mul(price.toDec());
  return new PricePretty(vsCurrency, value);
}
