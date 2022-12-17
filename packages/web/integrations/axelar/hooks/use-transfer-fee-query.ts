import { useState, useEffect } from "react";
import { Environment, AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
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

  useEffect(() => {
    const queryTransferFee = async () => {
      const api = new AxelarQueryAPI({
        environment,
      });
      const amount = Number(
        new CoinPretty(
          currency,
          amountMinDenom === "" ? "0" : amountMinDenom
        ).toCoin().amount
      );
      if (!isNaN(amount)) {
        return await api.getTransferFee(
          sourceChain,
          destChain,
          tokenMinDenom,
          amount
        );
      } else {
        throw new Error("Requested fee amount is not a number.");
      }
    };
    let timeout: NodeJS.Timeout | undefined;

    setIsLoading(true);
    // debounce query on user typing
    timeout = setTimeout(() => {
      queryTransferFee()
        .then((resp) => {
          if (resp.fee) {
            setTransferFee(resp.fee.amount);
          }
        })
        .catch((e) => {
          console.error("useTransferFeeQuery", e);
        })
        .finally(() => setIsLoading(false));
    }, inputDebounceMs);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [
    environment,
    sourceChain,
    destChain,
    tokenMinDenom,
    amountMinDenom,
    currency,
    inputDebounceMs,
  ]);

  return {
    transferFee:
      transferFee !== null ? new CoinPretty(currency, transferFee) : undefined,
    isLoading,
  };
}
