import { ObservableQuery } from "@keplr-wallet/stores";
import { ObservableTradeTokenInConfig } from "@osmosis-labs/stores";
import { useMemo } from "react";

import { useBackgroundRefresh } from "~/hooks";
import { useStore } from "~/stores";

/** Ensures the user has up to date data for swapping; pools and price data.
 *
 *  - If the user is looking at a quote, refresh the pools data very frequently.
 *  - Otherwise, just refresh the pools and price data less frequently.
 */
export function useFreshSwapData(
  tradeTokenInConfig: ObservableTradeTokenInConfig
) {
  const { chainStore, queriesStore, priceStore } = useStore();

  const queriesOsmosis = queriesStore.get(chainStore.osmosis.chainId).osmosis!;
  const queryPools = queriesOsmosis.queryGammPools;

  // stores to otherwise refresh
  const stores: ObservableQuery[] = useMemo(
    () => [queryPools, priceStore],
    [queryPools, priceStore]
  );

  const isLookingAtQuote =
    tradeTokenInConfig.isQuoteLoading ||
    !tradeTokenInConfig.expectedSwapResult.amount.toDec().isZero();

  console.log({ isLookingAtQuote });

  useBackgroundRefresh(stores, {
    active: isLookingAtQuote ? 30 * 1000 : undefined,
  });
}
