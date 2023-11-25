import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useMemo } from "react";

import { queryBalances } from "~/server/queries/cosmos";
import { useStore } from "~/stores";

import { useCoinFiatValue } from "../use-coin-fiat-value";

/** Manages user input for a currency, with helpers for selecting
 *  the user's currency balance as input. */
export function useAmountInput(currency?: Currency) {
  // query user balance for currency
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { data: balances } = useQuery(
    ["queryBalances"],
    () => queryBalances(account!.address!),
    { enabled: Boolean(account?.address) }
  );
  const rawBalance = balances?.balances.find(
    (bal) => bal.denom === currency?.coinMinimalDenom
  )?.amount;

  // manage amounts, with ability to set fraction of the amount
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
      let amountInt = inputAmount === "" ? new Int(0) : new Int(inputAmount);
      if (fraction != null && rawBalance)
        amountInt = new Dec(rawBalance).mul(new Dec(fraction)).truncate();
      return new CoinPretty(currency, amountInt);
    } else {
      return undefined;
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
    setAmount,
    setFraction,
    setMax: useCallback(() => setFraction(1), []),
    setHalf: useCallback(() => setFraction(0.5), []),
  };
}

function isValidNumericalRawInput(input: string) {
  return (
    !isNaN(Number(input)) &&
    Number(input) >= 0 &&
    Number(input) <= Number.MAX_SAFE_INTEGER
  );
}
