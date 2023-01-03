import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { AppCurrency } from "@keplr-wallet/types";
import { ObservableTradeTokenInConfig } from "@osmosis-labs/stores";
import { useStore } from "../../stores";

/** If not in modal (pool), bidirectionally sets/gets window query params to/from `from=DENOM&to=DENOM` and sets in trade config object. */
export function useTokenSwapQueryParams(
  tradeConfig: ObservableTradeTokenInConfig,
  currencies: AppCurrency[],
  isInModal = false
) {
  const router = useRouter();
  const firstQueryEffectChecker = useRef(false);
  const setFromQueryParams = useRef(false);
  const {
    chainStore: { osmosis },
    queriesStore,
  } = useStore();
  const queryGammPools = queriesStore.get(osmosis.chainId).osmosis!
    .queryGammPools;

  useEffect(() => {
    if (isInModal || !tradeConfig) {
      return;
    }
    if (
      router.query.from &&
      router.query.to &&
      router.query.from !== router.query.to
    ) {
      const fromCurrency =
        currencies.find(
          (currency) => currency.coinDenom === router.query.from
        ) ||
        tradeConfig.sendableCurrencies.find(
          (currency) => currency.coinDenom === router.query.from
        );
      const toCurrency =
        currencies.find((currency) => currency.coinDenom === router.query.to) ||
        tradeConfig.sendableCurrencies.find(
          (currency) => currency.coinDenom === router.query.to
        );
      if (fromCurrency) {
        tradeConfig.setSendCurrency(fromCurrency);
      }
      if (toCurrency) {
        tradeConfig.setOutCurrency(toCurrency);
      }
    }
    setFromQueryParams.current = true;
  }, [router.query.from, router.query.to, tradeConfig?.sendableCurrencies]);

  useEffect(() => {
    if (isInModal || !tradeConfig) {
      return;
    }

    // Update current in and out currency to query string.
    // The first effect should be ignored because the query string set when visiting the web page for the first time must be processed.
    if (firstQueryEffectChecker.current) {
      queryGammPools
        .waitResponse() // wait for gamm pools to load
        .then(() => {
          if (
            tradeConfig.sendCurrency.coinDenom !== "UNKNOWN" &&
            tradeConfig.outCurrency.coinDenom !== "UNKNOWN" &&
            (tradeConfig.sendCurrency.coinDenom !== router.query.from ||
              tradeConfig.outCurrency.coinDenom !== router.query.to) &&
            setFromQueryParams.current
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
    } else {
      firstQueryEffectChecker.current = true;
    }
  }, [tradeConfig?.sendCurrency, tradeConfig?.outCurrency]);
}
