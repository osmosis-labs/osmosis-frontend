import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { TradeTokenInConfig } from "@osmosis-labs/stores";
import { CoinBalance } from "../../stores/assets";

/** Bidirectionally sets/gets window query params to/from `from=DENOM&to=DENOM` and sets in trade config object. */
export function useTokenQueryParams(
  tradeConfig: TradeTokenInConfig,
  balances: CoinBalance[],
  isInModal = false
) {
  const router = useRouter();
  const firstQueryEffectChecker = useRef(false);

  useEffect(() => {
    if (isInModal || !tradeConfig) {
      return;
    }

    if (
      router.query.from &&
      router.query.to &&
      tradeConfig.sendableCurrencies.length !== 0
    ) {
      const fromTokenBalance = balances.find(
        (tokenBalance) =>
          tokenBalance.balance.currency.coinDenom === router.query.from
      );
      const toTokenBalance = balances.find(
        (tokenBalance) =>
          tokenBalance.balance.currency.coinDenom === router.query.to
      );
      if (fromTokenBalance) {
        tradeConfig.setSendCurrency(fromTokenBalance.balance.currency);
      }
      if (toTokenBalance) {
        tradeConfig.setOutCurrency(toTokenBalance.balance.currency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.from, router.query.to, tradeConfig?.sendableCurrencies]);

  useEffect(() => {
    if (isInModal || !tradeConfig) {
      return;
    }

    // Update current in and out currency to query string.
    // The first effect should be ignored because the query string set when visiting the web page for the first time must be processed.
    if (firstQueryEffectChecker.current) {
      firstQueryEffectChecker.current = false;
      return;
    }

    if (
      tradeConfig.sendCurrency.coinDenom !== "UNKNOWN" &&
      tradeConfig.outCurrency.coinDenom !== "UNKNOWN" &&
      tradeConfig.sendableCurrencies.length !== 0 &&
      (tradeConfig.sendCurrency.coinDenom !== router.query.from ||
        tradeConfig.outCurrency.coinDenom !== router.query.to)
    ) {
      router.replace(
        `/?from=${tradeConfig.sendCurrency.coinDenom}&to=${tradeConfig.outCurrency.coinDenom}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tradeConfig?.sendCurrency,
    tradeConfig?.outCurrency,
    tradeConfig?.sendableCurrencies,
  ]);
}
