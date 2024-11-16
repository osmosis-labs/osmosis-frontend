import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
} from "@osmosis-labs/keplr-hooks";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import {
  InsufficientBalanceError,
  InsufficientBalanceForFeeError,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useStore } from "~/stores";
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
  // query user balance for currency
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { data: balances, isFetched: isBalancesFetched } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: account?.address ?? "",
      },
      { enabled: Boolean(account?.address) }
    );
  const rawCurrencyBalance = balances?.find(
    (bal) => bal.denom === currency?.coinMinimalDenom
  )?.amount;
  // manage amounts, with ability to set fraction of the amount
  // `inputAmount` is the raw string input that includes decimals
  const [inputAmount, setAmount_] = useState("");
  const [fraction, setFraction] = useState<number | null>(null);

  const setAmount = useCallback(
    (amount: string) => {
      let updatedAmount = amount.trim();
      if (updatedAmount.startsWith(".")) {
        updatedAmount = "0" + updatedAmount;
      }

      // check validity of raw input
      if (!isValidNumericalRawInput(updatedAmount)) return;

      if (fraction != null) {
        setFraction(null);
      }

      setAmount_(updatedAmount);
    },
    [fraction]
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
  const amount = useMemo(() => {
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

  const isHalfValue = useMemo(
    () =>
      fraction === 0.5 ||
      (rawCurrencyBalance && amount
        ? new Dec(amount.toCoin().amount).equals(
            new Dec(rawCurrencyBalance).mul(new Dec(0.5))
          )
        : false),
    [amount, fraction, rawCurrencyBalance]
  );
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
      return new EmptyAmountError("Empty amount");
    }
    if (!isValidNumericalRawInput(inputAmount)) {
      return new InvalidNumberAmountError("Invalid number amount");
    }
    if (amount.toDec().isNegative()) {
      return new NegativeAmountError("Negative amount");
    }
    if (isBalancesFetched && balance && amount.toDec().gt(balance.toDec())) {
      return new InsufficientBalanceError("Insufficient balance");
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

  return {
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
    isHalfValue,
    isMaxValue,
    setAmount,
    reset,
    setFraction,
    toggleMax: useCallback(
      () => setFraction(fraction === 1 ? null : 1),
      [fraction]
    ),
    toggleHalf: useCallback(
      () => setFraction(fraction === 0.5 ? null : 0.5),
      [fraction]
    ),
  };
}

export function isValidNumericalRawInput(input: string) {
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
