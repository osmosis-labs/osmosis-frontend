import { useState, useEffect, useMemo, useCallback } from "react";
import { Environment, AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import debounce from "debounce";
import { CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";

/** Fetches a new Transfer fee quote when either chain, the amount, or the currency changes.
 *  `amountMinDenom` is from user input, assumes `=== ""` for no input, and therefore no query.
 */
export function useTransferFeeQuery(
  sourceChain: string,
  destChain: string,
  tokenMinDenom: string,
  amountMinDenom: string,
  currency: AppCurrency,
  environment = Environment.MAINNET,
  inputDebounceMs = 2000
): { transferFee?: CoinPretty; isLoading: boolean } {
  const [transferFee, setTransferFee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const api = useMemo(() => new AxelarQueryAPI({ environment }), [environment]);

  const queryTransferFee = useCallback(
    (amountMinDenom: string) => {
      if (amountMinDenom === "") {
        return;
      }

      const amount = Number(
        new CoinPretty(currency, amountMinDenom).toCoin().amount
      );
      if (!isNaN(amount)) {
        console.log("get transfer fee", { amountMinDenom });
        setIsLoading(true);
        api
          .getTransferFee(sourceChain, destChain, tokenMinDenom, amount)
          .then((resp) => {
            console.log("successful transfer fee query", resp.fee?.amount);
            if (resp.fee && resp.fee.amount !== transferFee) {
              setTransferFee(resp.fee.amount);
            }
          })
          .catch((e) => {
            console.error("useTransferFeeQuery", e);
          })
          .finally(() => setIsLoading(false));
      } else {
        throw new Error("Requested fee amount is not a number.");
      }
    },
    [api, sourceChain, destChain, tokenMinDenom, currency]
  );

  const debouncedTransferFeeQuery = useCallback(
    debounce(queryTransferFee, inputDebounceMs),
    [queryTransferFee, inputDebounceMs]
  );

  useEffect(() => {
    debouncedTransferFeeQuery(amountMinDenom);
  }, [debouncedTransferFeeQuery, amountMinDenom]);

  return {
    transferFee:
      transferFee !== null ? new CoinPretty(currency, transferFee) : undefined,
    isLoading,
  };
}
