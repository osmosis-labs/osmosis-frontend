import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Currency } from "@osmosis-labs/types";
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@osmosis-labs/unit";
import {
  AmountTooSmallError,
  EmptyAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
} from "@osmosis-labs/utils";
import {
  InsufficientBalanceError,
  InsufficientBalanceForFeeError,
  isNil,
  isValidNumericalRawInput,
  normalizeDecimalSeparator,
} from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useWallet } from "~/hooks/use-wallet";
import { api } from "~/utils/trpc";

/** Drops digits past `decimals` fractional places, so an amount never has
 *  more precision than the asset's base unit. Expects an already valid raw
 *  numerical input. */
function truncateToDecimals(input: string, decimals: number): string {
  const dotIndex = input.indexOf(".");
  if (dotIndex === -1) return input;
  const fractionLength = input.length - dotIndex - 1;
  if (fractionLength <= decimals) return input;
  // a 0-decimal asset has no fractional part, so the dot goes too
  return decimals === 0
    ? input.slice(0, dotIndex)
    : input.slice(0, dotIndex + 1 + decimals);
}

/** Manages user input for a currency, with helpers for selecting
 *  the user’s currency balance as input. Includes support for debounce on input.
 *  If provided a gas amount and it is the same as the input currency,
 *  the gas fee will be subtracted if the user is inputting the max amount.
 *  `balanceOverride` replaces the wallet balance (e.g. a staked amount).
 */
export function useAmountInput({
  currency,
  inputDebounceMs = 200,
  gasAmount,
  balanceOverride,
}: {
  currency: Currency | undefined;
  inputDebounceMs?: number;
  gasAmount?: CoinPretty;
  balanceOverride?: {
    /** Base units; undefined while loading. */
    amount: string | undefined;
    isFetched: boolean;
  };
}) {
  // query user balance for currency
  const { address } = useWallet();
  const { data: walletBalances, isFetched: isWalletBalancesFetched } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: address ?? "",
      },
      { enabled: Boolean(address) && !balanceOverride }
    );
  const isBalancesFetched = balanceOverride
    ? balanceOverride.isFetched
    : isWalletBalancesFetched;
  const overrideAmount = balanceOverride?.amount;
  const overrideBalances = useMemo(
    () => [{ denom: currency?.coinMinimalDenom, amount: overrideAmount }],
    [currency?.coinMinimalDenom, overrideAmount]
  );
  const balances = balanceOverride
    ? balanceOverride.isFetched
      ? overrideBalances
      : undefined
    : walletBalances;
  const rawCurrencyBalance = balances?.find(
    (bal) => bal.denom === currency?.coinMinimalDenom
  )?.amount;
  // manage amounts, with ability to set fraction of the amount
  // `inputAmount` is the raw string input that includes decimals
  const [inputAmount, setAmount_] = useState("");
  const [fraction, setFraction] = useState<number | null>(null);

  const setAmount = useCallback(
    (amount: string) => {
      const normalizedAmount = normalizeDecimalSeparator(amount.trim());
      if (normalizedAmount === null) return;
      let updatedAmount = normalizedAmount;
      if (updatedAmount.startsWith(".")) {
        updatedAmount = "0" + updatedAmount;
      }

      // check validity of raw input
      if (!isValidNumericalRawInput(updatedAmount)) return;

      // Any input is cut to the asset's decimals: a digit typed at the end
      // past the limit is ignored, and an insertion drops the last digit.
      if (currency) {
        updatedAmount = truncateToDecimals(
          updatedAmount,
          currency.coinDecimals
        );
      }

      if (fraction != null) {
        setFraction(null);
      }

      setAmount_(updatedAmount);
    },
    [fraction, currency]
  );

  // clear fraction when user changes currency
  // and user has no balance
  const [prevBalanceInputs, setPrevBalanceInputs] = useState({
    isBalancesFetched,
    rawCurrencyBalance,
    currencyDenom: currency?.coinMinimalDenom,
  });
  if (
    prevBalanceInputs.isBalancesFetched !== isBalancesFetched ||
    prevBalanceInputs.rawCurrencyBalance !== rawCurrencyBalance ||
    prevBalanceInputs.currencyDenom !== currency?.coinMinimalDenom
  ) {
    setPrevBalanceInputs({
      isBalancesFetched,
      rawCurrencyBalance,
      currencyDenom: currency?.coinMinimalDenom,
    });
    if (isBalancesFetched && !rawCurrencyBalance) setFraction(null);
  }

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

  const isQuarterValue = useMemo(
    () =>
      fraction === 0.25 ||
      (rawCurrencyBalance && amount
        ? new Dec(amount.toCoin().amount).equals(
            new Dec(rawCurrencyBalance).mul(new Dec(0.25))
          )
        : false),
    [amount, fraction, rawCurrencyBalance]
  );
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
  const isThreeQuartersValue = useMemo(
    () =>
      fraction === 0.75 ||
      (rawCurrencyBalance && amount
        ? new Dec(amount.toCoin().amount).equals(
            new Dec(rawCurrencyBalance).mul(new Dec(0.75))
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
      // a non-zero input that truncates to zero base units (e.g. the asset
      // changed to one with fewer decimals) is not an empty input
      if (
        currency &&
        fraction == null &&
        inputAmount !== "" &&
        isValidNumericalRawInput(inputAmount) &&
        new Dec(inputAmount === "." ? "0" : inputAmount).isPositive()
      ) {
        return new AmountTooSmallError("Amount too small");
      }
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
  }, [
    amount,
    currency,
    fraction,
    inputAmount,
    isBalancesFetched,
    balance,
    maxAmountWithGas,
  ]);

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
    isQuarterValue,
    isHalfValue,
    isThreeQuartersValue,
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
