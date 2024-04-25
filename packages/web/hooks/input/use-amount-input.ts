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
import { useCallback, useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";

import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useStore } from "~/stores";

import { useBalances } from "../queries/cosmos/use-balances";

/** Manages user input for a currency, with helpers for selecting
 *  the user’s currency balance as input. Includes support for debounce on input. */
export function useAmountInput({
  currency,
  inputDebounceMs = 500,
  gasAmount,
}: {
  currency: Currency | undefined;
  inputDebounceMs?: number;
  gasAmount?: CoinPretty;
}) {
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
  const [inputAmount, setAmount_] = useState("");
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

      setAmount_(amount);
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

  const maxAmount = useMemo(() => {
    if (!currency) return;

    let maxValue: CoinPretty | undefined = balance;
    if (balance && gasAmount?.denom === currency?.coinDenom && gasAmount) {
      maxValue = balance.sub(gasAmount);
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

      if (fraction === 1 && !isNil(maxAmount)) {
        amountInt = new Int(maxAmount.toCoin().amount);
      }

      if (amountInt.isZero()) return;
      return new CoinPretty(currency, amountInt);
    }
  }, [currency, inputAmount, fraction, rawCurrencyBalance, maxAmount]);

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
      (amount && maxAmount ? amount.toDec().equals(maxAmount.toDec()) : false),
    [amount, fraction, maxAmount]
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

  /**
   * When the `amount` is `undefined` due to the absence of valid input,
   * we should create a CoinPretty object using the currency. This allows
   * us to fetch the price before generating a quote, displaying results
   * faster on slow networks.
   */
  let coinForPrice: CoinPretty | undefined;
  if (!isNil(amount)) {
    coinForPrice = amount;
  } else if (!isNil(currency)) {
    coinForPrice = new CoinPretty(currency, 0);
  }

  const { price } = useCoinPrice(coinForPrice);
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
    if (!isNil(maxAmount) && amount.toDec().gt(maxAmount.toDec())) {
      return new InsufficientBalanceForFeeError("Insufficient balance for fee");
    }
  }, [amount, inputAmount, isBalancesFetched, balance, maxAmount]);

  const reset = useCallback(() => {
    setAmount("");
    setFraction(null);
  }, [setAmount]);

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
    price,
    fraction,
    isEmpty: inputAmountWithFraction === "",
    error,
    setAmount,
    reset,
    setFraction,
    isHalfValue,
    isMaxValue,
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
