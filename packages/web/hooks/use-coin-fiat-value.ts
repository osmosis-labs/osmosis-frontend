import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/config";
import { CoingeckoVsCurrencies } from "~/server/queries/coingecko";
import { getAssetPrice } from "~/server/queries/complex/assets";

export function useCoinFiatValue(
  coin?: CoinPretty,
  vsCurrency = "usd" as CoingeckoVsCurrencies
): PricePretty | undefined {
  const { data: price } = useQuery(
    ["getAssetPrice"],
    () => getAssetPrice({ asset: coin!.currency!, currency: vsCurrency }),
    { enabled: Boolean(coin?.currency) }
  );

  return useMemo(() => {
    const value = price && coin ? coin.toDec().mul(price) : undefined;

    return new PricePretty(DEFAULT_VS_CURRENCY, value ?? 0).ready(
      Boolean(value)
    );
  }, [price, coin]);
}
