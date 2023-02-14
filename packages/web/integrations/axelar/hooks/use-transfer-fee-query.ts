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
  axelarTokenMinDenom: string,
  amountMinDenom: string,
  memoedCurrency: AppCurrency,
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
        new CoinPretty(memoedCurrency, amountMinDenom).toCoin().amount
      );
      if (!isNaN(amount)) {
        setIsLoading(true);
        api
          .getTransferFee(sourceChain, destChain, axelarTokenMinDenom, amount)
          .then((resp) => {
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
    [api, sourceChain, destChain, axelarTokenMinDenom, memoedCurrency]
  );

  const debouncedTransferFeeQuery = useCallback(
    debounce(queryTransferFee, inputDebounceMs),
    [queryTransferFee, inputDebounceMs]
  );

  useEffect(() => {
    debouncedTransferFeeQuery(amountMinDenom);
  }, [debouncedTransferFeeQuery, amountMinDenom]);

  const transferFeeRet = useMemo(
    () =>
      transferFee !== null
        ? new CoinPretty(memoedCurrency, transferFee)
        : undefined,
    [memoedCurrency, transferFee]
  );

  return {
    transferFee: transferFeeRet,
    isLoading,
  };
}
