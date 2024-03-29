import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
} from "@osmosis-labs/keplr-hooks";
import { InsufficientBalanceError } from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useCallback, useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";

import { FractionButtonState } from "~/hooks/swap/use-fraction-buttons-state";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useStore } from "~/stores";

import { useCoinFiatValue } from "../queries/assets/use-coin-fiat-value";
import { useBalances } from "../queries/cosmos/use-balances";

/** Manages user input for a currency, with helpers for selecting
 *  the user's currency balance as input. Includes support for debounce on input. */
export function useAmountInput(
  currency: Currency | undefined,
  inputDebounceMs = 500,
  fractionState: FractionButtonState
) {
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
  const setAmount = useCallback(
    (amount: string) => {
      // check validity of raw input
      if (!isValidNumericalRawInput(amount)) return;

      if (amount.startsWith(".")) {
        amount = "0" + amount;
      }

      fractionState.reset();
      _setAmount(amount);
    },
    [fractionState]
  );

  // clear fraction when user changes currency
  // and user has no balance
  useEffect(() => {
    if (isBalancesFetched && !rawCurrencyBalance) fractionState.reset();
  }, [isBalancesFetched, rawCurrencyBalance, currency, fractionState]);

  /** Amount derived from user input or from a fraction of the user's balance. */
  const amount = useMemo(() => {
    if (currency && isValidNumericalRawInput(inputAmount)) {
      const decimalMultiplication = DecUtils.getTenExponentN(
        currency.coinDecimals
      );
      const amountInt = (
        fractionState.value && rawCurrencyBalance
          ? new Dec(rawCurrencyBalance).mul(new Dec(fractionState.value))
          : new Dec(inputAmount === "" ? 0 : inputAmount).mul(
              decimalMultiplication
            )
      ).truncate();

      if (amountInt.isZero()) return;
      return new CoinPretty(currency, amountInt);
    }
  }, [currency, fractionState.value, inputAmount, rawCurrencyBalance]);

  const inputAmountWithFraction = useMemo(
    () =>
      fractionState.value && amount
        ? new IntPretty(amount)
            .inequalitySymbol(false)
            .locale(false)
            .trim(true)
            .toString()
        : inputAmount,
    [fractionState, amount, inputAmount]
  );

  // generate debounced quote from user inputs
  const [debouncedInAmount, setDebounceInAmount] =
    useDebouncedState<CoinPretty | null>(null, inputDebounceMs);
  useEffect(() => {
    setDebounceInAmount(amount ?? null);
  }, [setDebounceInAmount, amount]);

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
    fractionState.reset();
  }, [fractionState, setAmount]);

  return {
    inputAmount: inputAmountWithFraction,
    debouncedInAmount,
    isTyping:
      debouncedInAmount && amount
        ? !amount.toDec().equals(debouncedInAmount.toDec())
        : false,
    amount,
    balance,
    fiatValue,
    isEmpty: inputAmountWithFraction === "",
    error,
    setAmount,
    reset,
  };
}

function isValidNumericalRawInput(input: string) {
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
