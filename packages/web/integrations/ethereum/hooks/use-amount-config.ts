import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useCallback, useMemo, useState } from "react";

import { erc20TransferParams, sendParams } from "../tx";
import { SendFn } from "../types";
import { useTxGasEstimate } from "./use-tx-gas-estimate";

/** Amount config for EVM native or ERC20 token, with the option to set to max balance and for `amount` to not exceed the coin's decimal count.
 * Includes gas.
 */
export function useAmountConfig({
  sendFn,
  balance,
  currency,
  gasCurrency,
}: {
  sendFn: SendFn;
  balance?: CoinPretty;
  currency?: Currency;
  gasCurrency?: Currency;
}): {
  amount: string;
  gasCost?: CoinPretty;
  isMax: boolean;
  setAmount: (amount: string) => void;
  toggleIsMax: () => void;
} {
  const [amount, setRawAmount] = useState("");
  const [isMax, setIsMax] = useState(false);

  const evmTxParams: unknown[] | undefined = useMemo(() => {
    if (!currency || !gasCurrency) return;

    // is ERC20 amount
    if (currency.coinMinimalDenom !== gasCurrency.coinMinimalDenom) {
      return erc20TransferParams("0x0", "0x0", "1", "0x0");
    }

    // is native amount
    if (currency.coinMinimalDenom === gasCurrency.coinMinimalDenom) {
      return sendParams("0x0", "0x0", "1");
    }
  }, [currency, gasCurrency]);
  const gasCost = useTxGasEstimate(sendFn, evmTxParams, gasCurrency);

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
    gasCost: gasCost ?? undefined,
    isMax,
    setAmount,
    toggleIsMax,
  };
}
