import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
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
  const { data: balances } = useBalances({
    address: account?.address ?? "",
    queryOptions: {
      enabled: Boolean(account?.address),
    },
  });
  const rawBalance = balances?.balances.find(
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

  const amount = useMemo(() => {
    if (currency && isValidNumericalRawInput(inputAmount)) {
      const decimalMultiplication = DecUtils.getTenExponentN(
        currency.coinDecimals
      );
      let amountInt =
        inputAmount === ""
          ? new Int(0)
          : new Dec(inputAmount).mul(decimalMultiplication).truncate();

      if (fraction != null && rawBalance) {
        amountInt = new Dec(rawBalance).mul(new Dec(fraction)).truncate();
      }
      if (amountInt.isZero()) return;
      return new CoinPretty(currency, amountInt);
    }
  }, [currency, inputAmount, rawBalance, fraction]);

  const fiatValue = useCoinFiatValue(amount);

  const balance = useMemo(
    () =>
      currency && rawBalance ? new CoinPretty(currency, rawBalance) : undefined,
    [currency, rawBalance]
  );

  return {
    inputAmount,
    amount,
    balance,
    fiatValue,
    fraction,
    isEmpty: !Boolean(amount),
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
  };
}

function isValidNumericalRawInput(input: string) {
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
