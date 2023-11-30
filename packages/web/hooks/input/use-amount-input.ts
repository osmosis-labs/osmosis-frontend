import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
} from "@osmosis-labs/keplr-hooks";
import { InsufficientBalanceError } from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useCallback, useState } from "react";
import { useMemo } from "react";

import { useStore } from "~/stores";

import { useBalances } from "../queries/cosmos/balances";
import { useCoinFiatValue } from "../use-coin-fiat-value";

/** Manages user input for a currency, with helpers for selecting
 *  the user's currency balance as input. */
export function useAmountInput(currency?: Currency) {
  // query user balance for currency
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { data: balances, isFetched: isBalancesFetched } = useBalances({
    address: account?.address ?? "",
    queryOptions: {
      enabled: Boolean(account?.address),
    },
  });
  const rawCurrencyBalance = balances?.balances.find(
    (bal) => bal.denom === currency?.coinMinimalDenom
  )?.amount;

  // manage amounts, with ability to set fraction of the amount
  // `inputAmount` is the raw string input that includes decimals
  const [inputAmount, _setAmount] = useState("");
  const [fraction, setFraction] = useState<number | null>(null);
  const setAmount = useCallback(
    (amount: string) => {
      // check validity of raw input
      if (!isValidNumericalRawInput(amount)) return;

      if (amount.startsWith(".")) {
        amount = "0" + amount;
      }

      if (fraction != null) {
        setFraction(null);
      }
      _setAmount(amount);
    },
    [fraction]
  );

  /** Amount derived from user input or from a fraction of the user's balance. */
  const amount = useMemo(() => {
    if (currency && isValidNumericalRawInput(inputAmount)) {
      const decimalMultiplication = DecUtils.getTenExponentN(
        currency.coinDecimals
      );
      let amountInt =
        inputAmount === ""
          ? new Int(0)
          : new Dec(inputAmount).mul(decimalMultiplication).truncate();

      if (fraction != null && rawCurrencyBalance) {
        amountInt = new Dec(rawCurrencyBalance)
          .mul(new Dec(fraction))
          .truncate();
      }
      if (amountInt.isZero()) return;
      return new CoinPretty(currency, amountInt);
    }
  }, [currency, inputAmount, rawCurrencyBalance, fraction]);

  const fiatValue = useCoinFiatValue(amount);

  const balance = useMemo(
    () =>
      currency && rawCurrencyBalance
        ? new CoinPretty(currency, rawCurrencyBalance)
        : currency && balances // user has 0 balance
        ? new CoinPretty(currency, 0)
        : undefined,
    [currency, balances, rawCurrencyBalance]
  );

  const error = useMemo(() => {
    if (!amount) return new EmptyAmountError("Empty amount");
    if (!isValidNumericalRawInput(inputAmount))
      return new InvalidNumberAmountError("Invalid number amount");
    if (amount.toDec().isNegative())
      return new NegativeAmountError("Negative amount");
    if (isBalancesFetched && balance && amount.toDec().gt(balance.toDec()))
      return new InsufficientBalanceError("Insufficient balance");
  }, [inputAmount, balance, isBalancesFetched, amount]);

  const reset = useCallback(() => {
    setAmount("");
    setFraction(null);
  }, [setAmount]);

  return {
    inputAmount,
    amount,
    balance,
    fiatValue,
    fraction,
    isEmpty: !Boolean(amount),
    error,
    setAmount,
    setFraction,
    toggleMax: useCallback(
      () => setFraction(fraction === 1 ? null : 1),
      [fraction]
    ),
    toggleHalf: useCallback(
      () => setFraction(fraction === 0.5 ? null : 0.5),
      [fraction]
    ),
    reset,
  };
}

function isValidNumericalRawInput(input: string) {
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
