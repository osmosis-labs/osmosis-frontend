import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { InsufficientBalanceForFeeError } from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@osmosis-labs/unit";
import { isNil, mulPrice } from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useDeepMemo } from "~/hooks/use-deep-memo";
import { usePrice } from "~/hooks/use-price";
import { useWallets } from "~/hooks/use-wallets";
import { api } from "~/utils/trpc";

/** Manages user input for a currency, with helpers for selecting
 *  the user’s currency balance as input. Includes support for debounce on input.
 *  If provided a gas amount and it is the same as the input currency,
 *  the gas fee will be subtracted if the user is inputting the max amount.
 */
export function useAmountInput({
  currency,
  inputDebounceMs = 200,
  gasAmount,
}: {
  currency: Currency | undefined;
  inputDebounceMs?: number;
  gasAmount?: CoinPretty;
}) {
  const { currentWallet } = useWallets();
  const { data: balances, isFetched: isBalancesFetched } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: currentWallet?.address ?? "",
      },
      { enabled: Boolean(currentWallet?.address) }
    );

  const rawCurrencyBalance = useMemo(
    () =>
      balances?.find((bal) => bal.denom === currency?.coinMinimalDenom)?.amount,
    [balances, currency?.coinMinimalDenom]
  );

  // manage amounts, with ability to set fraction of the amount
  // `inputAmount` is the raw string input that includes decimals
  const [inputAmount, setAmount_] = useState("");
  const [fraction, setFraction] = useState<number | null>(null);

  const setAmount = useCallback(
    (amount: string) => {
      const updatedAmount = amount.trim();

      if (fraction != null) {
        setFraction(null);
      }

      setAmount_(updatedAmount);
    },
    [fraction, setAmount_]
  );

  // clear fraction when user changes currency
  // and user has no balance
  useEffect(() => {
    if (isBalancesFetched && !rawCurrencyBalance) setFraction(null);
  }, [isBalancesFetched, rawCurrencyBalance, currency]);

  const balance = useMemo(
    () =>
      currency && rawCurrencyBalance
        ? new CoinPretty(currency, rawCurrencyBalance)
        : currency && balances // user has 0 balance
        ? new CoinPretty(currency, 0)
        : undefined,
    [currency, balances, rawCurrencyBalance]
  );

  const maxAmountWithGas = useMemo(() => {
    if (!currency) return;

    let maxValue: CoinPretty | undefined = balance;
    if (
      balance &&
      gasAmount?.currency.coinMinimalDenom === currency?.coinMinimalDenom &&
      gasAmount
    ) {
      const valueWithGas = balance.sub(gasAmount);
      if (valueWithGas.toDec().gte(new Dec(0))) {
        maxValue = valueWithGas;
      } else {
        maxValue = new CoinPretty(currency, 0);
      }
    }

    return maxValue;
  }, [balance, gasAmount, currency]);

  /** Amount derived from user input or from a fraction of the user’s balance. */
  const amount = useDeepMemo(() => {
    if (currency && isValidNumericalRawInput(inputAmount)) {
      let amountInt =
        inputAmount === ""
          ? new Int(0)
          : new Dec(inputAmount)
              .mul(DecUtils.getTenExponentN(currency.coinDecimals))
              .truncate();

      if (fraction != null && rawCurrencyBalance) {
        amountInt = new Dec(rawCurrencyBalance)
          .mul(new Dec(fraction))
          .truncate();
      }

      if (fraction === 1 && !isNil(maxAmountWithGas)) {
        amountInt = new Int(maxAmountWithGas.toCoin().amount);
      }

      if (amountInt.isZero()) return;
      return new CoinPretty(currency, amountInt);
    }
  }, [currency, inputAmount, fraction, rawCurrencyBalance, maxAmountWithGas]);

  const isMaxValue = useMemo(
    () =>
      fraction === 1 ||
      (amount && maxAmountWithGas
        ? amount.toDec().equals(maxAmountWithGas.toDec())
        : false),
    [amount, fraction, maxAmountWithGas]
  );

  const inputAmountWithFraction = useMemo(
    () =>
      fraction != null && amount
        ? new IntPretty(amount)
            .inequalitySymbol(false)
            .locale(false)
            .trim(true)
            .toString()
        : inputAmount,
    [amount, fraction, inputAmount]
  );
  // generate debounced quote from user inputs
  const [debouncedInAmount, setDebounceInAmount] =
    useDebouncedState<CoinPretty | null>(null, inputDebounceMs);
  useEffect(() => {
    setDebounceInAmount(amount ?? null);
  }, [setDebounceInAmount, amount]);

  const { price } = usePrice(currency);
  const fiatValue = useMemo(
    () => mulPrice(amount, price, DEFAULT_VS_CURRENCY),
    [amount, price]
  );

  const error = useMemo(() => {
    if (!amount) {
      return new Error("Empty amount");
    }
    if (!isValidNumericalRawInput(inputAmount)) {
      return new Error("Invalid number amount");
    }
    if (amount.toDec().isNegative()) {
      return new Error("Negative amount");
    }
    if (isBalancesFetched && balance && amount.toDec().gt(balance.toDec())) {
      return new Error("Insufficient balance");
    }
    if (
      !isNil(maxAmountWithGas) &&
      amount.toDec().gt(maxAmountWithGas.toDec())
    ) {
      return new InsufficientBalanceForFeeError("Insufficient balance for fee");
    }
  }, [amount, inputAmount, isBalancesFetched, balance, maxAmountWithGas]);

  const reset = useCallback(() => {
    setAmount("");
    setFraction(null);
  }, [setAmount]);

  const toggleMax = useCallback(
    () => setFraction(fraction === 1 ? null : 1),
    [fraction]
  );

  const toggleHalf = useCallback(
    () => setFraction(fraction === 0.5 ? null : 0.5),
    [fraction]
  );

  return useMemo(
    () => ({
      inputAmount: inputAmountWithFraction,
      debouncedInAmount,
      isTyping: debouncedInAmount?.toString() !== amount?.toString(),
      amount,
      balance,
      fiatValue,
      price,
      fraction,
      isEmpty: inputAmountWithFraction === "",
      error,
      isMaxValue,
      setAmount,
      reset,
      setFraction,
      toggleMax,
      toggleHalf,
    }),
    [
      inputAmountWithFraction,
      debouncedInAmount,
      amount,
      balance,
      fiatValue,
      price,
      fraction,
      error,
      isMaxValue,
      setAmount,
      reset,
      toggleMax,
      toggleHalf,
    ]
  );
}

export function isValidNumericalRawInput(input: string) {
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
