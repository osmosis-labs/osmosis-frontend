import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useCallback, useState } from "react";

/** Amount config for any token, with the option to set to max balance and for `amount` to not exceed the coin's decimal count.
 *  Not required to be a cosmos-queryable token.
 */
export function useGeneralAmountConfig({
  balance,
  currency,
  gasCost,
}: {
  balance?: CoinPretty;
  currency?: Currency;
  gasCost?: CoinPretty;
}): {
  amount: string;
  isMax: boolean;
  setAmount: (amount: string) => void;
  toggleIsMax: () => void;
} {
  const [amount, setRawAmount] = useState("");
  const [isMax, setIsMax] = useState(false);

  const setAmount = useCallback((amount: string) => {
    // lead value with 0
    if (amount.startsWith(".")) {
      amount = "0" + amount;
    }

    // maintain max decimals
    if ((balance || currency) && amount.includes(".")) {
      const parts = amount.split(".");
      if (parts.length === 2) {
        const numDecimals = parts[1].length;
        if (
          numDecimals >
          (balance?.currency.coinDecimals ?? currency?.coinDecimals ?? 18)
        ) {
          return;
        }
      }
    }

    setRawAmount(amount);
  }, []);

  const amountLessGasRaw =
    gasCost &&
    amount !== "" &&
    balance &&
    new Dec(amount).gt(balance.sub(gasCost).toDec())
      ? new CoinPretty(currency ?? balance!.currency, amount.replace(".", ""))
          .sub(gasCost)
          .hideDenom(true)
          .locale(false)
          .trim(true)
          .toString()
      : amount;

  const toggleIsMax = useCallback(() => {
    if (isMax) {
      setAmount("0");
      setIsMax(false);
    } else {
      setAmount(
        balance?.hideDenom(true).locale(false).trim(true).toString() ?? "0"
      );
      setIsMax(true);
    }
  }, [isMax, balance, setAmount]);

  return {
    amount: amountLessGasRaw,
    isMax,
    setAmount,
    toggleIsMax,
  };
}
