import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { ObservableTradeTokenInConfig } from "@osmosis-labs/stores";
import { CoinBalance } from "../../stores/assets";
import { useStore } from "../../stores";

/** Bidirectionally sets/gets window query params to/from `from=DENOM&to=DENOM` and sets in trade config object. */
export function useTokenSwapQueryParams(
  tradeConfig: ObservableTradeTokenInConfig,
  balances: CoinBalance[],
  isInModal = false
) {
  const router = useRouter();
  const firstQueryEffectChecker = useRef(false);
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
        balances.find(
          (tokenBalance) =>
            tokenBalance.balance.currency.coinDenom === router.query.from
        )?.balance.currency ||
        tradeConfig.sendableCurrencies.find(
          (currency) => currency.coinMinimalDenom === router.query.from
        );
      const toCurrency =
        balances.find(
          (tokenBalance) =>
            tokenBalance.balance.currency.coinDenom === router.query.to
        )?.balance.currency ||
        tradeConfig.sendableCurrencies.find(
          (currency) => currency.coinMinimalDenom === router.query.to
        );
      if (fromCurrency) {
        tradeConfig.setSendCurrency(fromCurrency);
      }
      if (toCurrency) {
        tradeConfig.setOutCurrency(toCurrency);
      }
    }
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
    } else {
      firstQueryEffectChecker.current = true;
    }
  }, [tradeConfig?.sendCurrency, tradeConfig?.outCurrency]);
}
