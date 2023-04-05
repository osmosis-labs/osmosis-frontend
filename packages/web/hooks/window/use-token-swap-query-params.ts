import { AppCurrency } from "@keplr-wallet/types";
import { ObservableTradeTokenInConfig } from "@osmosis-labs/stores";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { useStore } from "~/stores";

/** If not in modal (pool), bidirectionally sets/gets window query params to/from `from=DENOM&to=DENOM` and sets in trade config object. */
export function useTokenSwapQueryParams(
  tradeConfig: ObservableTradeTokenInConfig,
  currencies: AppCurrency[],
  isInModal = false
) {
  const router = useRouter();
  const setFromQueryParams = useRef(false);
  const {
    chainStore: { osmosis },
    queriesStore,
  } = useStore();
  const queryGammPools = queriesStore.get(osmosis.chainId).osmosis!
    .queryGammPools;

  // Set query params to trade config.
  // Loads remaining pools to register remaining currencies if a currency isn't in Osmosis's chainInfo (populated from browser cache).
  // Blocks effect to set browser query params until currencies are loaded (from pools).
  useEffect(() => {
    if (isInModal || !tradeConfig || !Boolean(queryGammPools.response)) {
      return;
    }

    if (
      router.query.from &&
      router.query.to &&
      router.query.from !== router.query.to &&
      !setFromQueryParams.current
    ) {
      const fromCurrency =
        currencies.find(
          (currency) =>
            currency.coinDenom.toLowerCase() ===
            (router.query.from as string).toLowerCase()
        ) ||
        tradeConfig.sendableCurrencies.find(
          (currency) =>
            currency.coinDenom.toLowerCase() ===
            (router.query.from as string).toLowerCase()
        );
      const toCurrency =
        currencies.find(
          (currency) =>
            currency.coinDenom.toLowerCase() ===
            (router.query.to as string).toLowerCase()
        ) ||
        tradeConfig.sendableCurrencies.find(
          (currency) =>
            currency.coinDenom.toLowerCase() ===
            (router.query.to as string).toLowerCase()
        );

      if (!fromCurrency || !toCurrency) {
        queryGammPools.fetchRemainingPools();
        return;
      }

      if (fromCurrency) {
        tradeConfig.setSendCurrency(fromCurrency);
      }
      if (toCurrency) {
        tradeConfig.setOutCurrency(toCurrency);
      }
    }
    setFromQueryParams.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queryGammPools,
    queryGammPools.response,
    router.query.from,
    router.query.to,
    tradeConfig?.sendableCurrencies,
  ]);

  // Set browser query params from trade config.
  useEffect(() => {
    if (isInModal || !tradeConfig || !Boolean(queryGammPools.response)) {
      return;
    }

    // Update current in and out currency to query string.
    // The first effect should be ignored because the query string set when visiting the web page for the first time must be processed.
    if (setFromQueryParams.current) {
      queryGammPools
        .waitResponse() // wait for gamm pools to load
        .then(() => {
          if (
            tradeConfig.sendCurrency.coinDenom !== "UNKNOWN" &&
            tradeConfig.outCurrency.coinDenom !== "UNKNOWN" &&
            (tradeConfig.sendCurrency.coinDenom !== router.query.from ||
              tradeConfig.outCurrency.coinDenom !== router.query.to)
          ) {
            // If ibc registry not loaded (i.e. first load of app in browser), `sendCurrency` and `outCurrency` will return
            // first two assets in `sendableCurrencies` which will be inexhaustive. This will
            // loop through query params and set the config to the wrong, intially loaded assets.
            router.replace(
              `/?from=${tradeConfig.sendCurrency.coinDenom.split(" ")[0]}&to=${
                tradeConfig.outCurrency.coinDenom.split(" ")[0]
              }`
            );
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeConfig?.sendCurrency, tradeConfig?.outCurrency]);
}
