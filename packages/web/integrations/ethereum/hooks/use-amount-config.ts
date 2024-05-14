import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useCallback, useMemo, useState } from "react";

import { IS_TESTNET } from "~/config";
import { SendFn } from "~/integrations/ethereum//types";
import { useTxGasEstimate } from "~/integrations/ethereum/hooks/use-tx-gas-estimate";
import { erc20TransferParams, sendParams } from "~/integrations/ethereum/tx";

/** Amount config for EVM native or ERC20 token, with the option to set to max balance and for `amount` to not exceed the coin's decimal count.
 * Includes gas.
 */
export function useAmountConfig({
  sendFn,
  balance,
  address,
  gasCurrency,
}: {
  sendFn?: SendFn;
  balance?: CoinPretty;
  address?: string;
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

  const balCurrency = balance?.currency;

  const evmTxParams: unknown[] | undefined = useMemo(() => {
    if (!balCurrency || !address) return;

    // is ERC20 amount, return tx for any ERC20 token transfer tx for gas cost estimation
    if (
      !gasCurrency ||
      balCurrency.coinMinimalDenom !== gasCurrency.coinMinimalDenom
    ) {
      return erc20TransferParams(
        address,
        address,
        "0",
        // USDC ERC20 on Ethereum testnet/mainnet
        IS_TESTNET
          ? "0x254d06f33bDc5b8ee05b2ea472107E300226659A"
          : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      );
    }

    // is native amount
    if (balCurrency.coinMinimalDenom === gasCurrency.coinMinimalDenom) {
      return sendParams(address, address, "1");
    }
  }, [balCurrency, address, gasCurrency]);
  const gasCost = useTxGasEstimate(sendFn, evmTxParams, gasCurrency);

  const setAmount = useCallback(
    (amount: string) => {
      // lead value with 0
      if (amount.startsWith(".")) {
        amount = "0" + amount;
      }

      // maintain max decimals
      if (balCurrency && amount.includes(".")) {
        const parts = amount.split(".");
        if (parts.length === 2) {
          const numDecimals = parts[1].length;
          if (numDecimals > (balCurrency?.coinDecimals ?? 18)) {
            return;
          }
        }
      }

      setIsMax(false);
      setRawAmount(amount);
    },
    [balCurrency]
  );

  const amountLessGasRaw = useMemo(() => {
    if (!gasCurrency || !gasCost || amount === "") return amount;
    const amountDec = new Dec(amount);
    if (amountDec.isZero()) return amount;
    if (isMax && gasCost.toDec().gt(amountDec)) return "0";
    if (isMax && amountDec.gt(gasCost.toDec())) {
      return amountDec.sub(gasCost.toDec()).toString();
    }

    return amount;
  }, [gasCurrency, gasCost, isMax, amount]);

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
