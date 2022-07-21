import { useState, useEffect } from "react";
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import { CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { Environment } from "@axelar-network/axelarjs-sdk";

/** Fetches a new Transfer fee quote when either chain, the amount, or the currency changes.
 *  `amountMinDenom` is from user input, assumes `=== ""` for no input, and therefore no query.
 */
export function useTransferFeeQuery(
  sourceChain: string,
  destChain: string,
  tokenMinDenom: string,
  amountMinDenom: string,
  currency: AppCurrency,
  environment = Environment.MAINNET
): { transferFee?: CoinPretty; isLoading: boolean } {
  const [transferFee, setTransferFee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryTransferFee = async () => {
      const api = new AxelarQueryAPI({ environment });
      const amount = Number(
        new CoinPretty(currency, amountMinDenom).toCoin().amount
      );
      if (!isNaN(amount)) {
        return await api.getTransferFee(
          sourceChain,
          destChain,
          tokenMinDenom,
          amount
        );
      }
      return null;
    };
    if (amountMinDenom !== "") {
      setIsLoading(true);
      queryTransferFee()
        .then((resp) => {
          console.log({ resp });
          setTransferFee(resp?.fee.amount || null);
          setIsLoading(false);
        })
        .catch((e) => console.error("useTransferFeeQuery", e));
    }
  }, [
    environment,
    sourceChain,
    destChain,
    tokenMinDenom,
    amountMinDenom,
    currency,
  ]);

  return {
    transferFee:
      transferFee !== null && !isLoading
        ? new CoinPretty(currency, amountMinDenom)
        : undefined,
    isLoading,
  };
}
