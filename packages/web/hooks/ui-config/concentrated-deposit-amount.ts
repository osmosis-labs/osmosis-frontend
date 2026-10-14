import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { DefaultGasPriceStep } from "@osmosis-labs/stores";
import {
  AppCurrency,
  CoinPretty,
  Currency,
  Dec,
  DecUtils,
  Int,
} from "@osmosis-labs/unit";

/** Gas used to create a concentrated liquidity position. */
export const CL_CREATE_POSITION_GAS = 3_000_000;

/** Fee currency that may carry gas price steps (as chain info fee currencies do). */
type FeeCurrency = Currency & {
  gasPriceStep?: { low: number; average: number; high: number };
};

/** Fee for the given gas, priced at the fee currency's high gas price step (falling back to the default step).
 *  Max amounts subtract this since the wallet overrides the fee and the exact one can't be known up front.
 */
export function calcHighGasFee(
  feeCurrency: FeeCurrency | undefined,
  gas: number
): CoinPretty | undefined {
  if (!feeCurrency) return undefined;

  const gasPriceStep = feeCurrency.gasPriceStep ?? DefaultGasPriceStep;
  const feeAmount = new Dec(gasPriceStep.high.toString()).mul(new Dec(gas));

  return new CoinPretty(feeCurrency, new Int(feeAmount.truncate().toString()));
}

/** User input for a deposit amount of a single currency. A fraction of the balance
 *  (1 = max, less `fee` if in the same currency) takes precedence over the typed amount.
 */
export interface DepositInputState {
  amount: string;
  fraction: number | undefined;
}

export const INITIAL_DEPOSIT_INPUT: DepositInputState = {
  amount: "0",
  fraction: undefined,
};

/** Typing sets the amount (prefixing a leading dot) and clears any fraction. */
export function typeDepositAmount(
  state: DepositInputState,
  amount: string
): DepositInputState {
  if (amount.startsWith(".")) {
    amount = "0" + amount;
  }
  if (state.amount === amount && state.fraction === undefined) return state;
  return { amount, fraction: undefined };
}

export function setDepositFraction(
  state: DepositInputState,
  fraction: number | undefined
): DepositInputState {
  if (state.fraction === fraction) return state;
  return { ...state, fraction };
}

/** User balance of the currency. Zero while balances are loading. */
export function getDepositBalance(
  currency: AppCurrency,
  rawBalance: string | undefined
): CoinPretty {
  return new CoinPretty(currency, rawBalance ?? 0);
}

/** Amount with decimals, as displayed to the user. */
export function getDepositAmount({
  state,
  balance,
  fee,
}: {
  state: DepositInputState;
  balance: CoinPretty;
  fee: CoinPretty | undefined;
}): string {
  if (state.fraction != null) {
    // `CoinPretty.sub` does nothing if the currencies differ.
    const result = fee ? balance.sub(fee) : balance;
    if (result.toDec().lte(new Dec(0))) {
      return "0";
    }

    return result
      .mul(new Dec(state.fraction))
      .trim(true)
      .locale(false)
      .hideDenom(true)
      .toString();
  }

  return state.amount;
}

export function getDepositAmountPrimitive(
  currency: AppCurrency,
  amountStr: string
): CoinPrimitive {
  if (!amountStr) {
    return { denom: currency.coinMinimalDenom, amount: "0" };
  }

  try {
    return {
      denom: currency.coinMinimalDenom,
      amount: new Dec(amountStr)
        .mul(DecUtils.getPrecisionDec(currency.coinDecimals))
        .truncate()
        .toString(),
    };
  } catch {
    return { denom: currency.coinMinimalDenom, amount: "0" };
  }
}

export function getDepositAmountError(
  amount: string,
  balance: CoinPretty
): Error | undefined {
  if (amount === "") {
    return new EmptyAmountError("Amount is empty");
  }
  if (Number.isNaN(parseFloat(amount))) {
    return new InvalidNumberAmountError("Invalid form of number");
  }
  let dec;
  try {
    dec = new Dec(amount);
    if (dec.equals(new Dec(0))) {
      return new ZeroAmountError("Amount is zero");
    }
  } catch {
    return new InvalidNumberAmountError("Invalid form of number");
  }
  if (dec.lt(new Dec(0))) {
    return new NegativeAmountError("Amount is negative");
  }
  if (dec.gt(balance.toDec())) {
    return new InsufficientAmountError("Insufficient amount");
  }

  return;
}

/** Snapshot of a deposit input plus stable setters, as exposed by the add CL config. */
export interface ConcentratedDepositAmount {
  readonly sendCurrency: AppCurrency;
  /** User balance of the send currency. Zero while balances are loading. */
  readonly balance: CoinPretty;
  /** Amount with decimals, as displayed to the user. */
  readonly amount: string;
  readonly fraction: number | undefined;
  readonly isMax: boolean;
  readonly error: Error | undefined;
  getAmountPrimitive(): CoinPrimitive;
  setAmount(amount: string): void;
  setIsMax(isMax: boolean): void;
  setFraction(value: number | undefined): void;
}

export function createConcentratedDepositAmount({
  currency,
  rawBalance,
  state,
  fee,
  setAmount,
  setFraction,
}: {
  currency: AppCurrency;
  /** Raw balance (base units) of the denom, or undefined if none/not loaded. */
  rawBalance: string | undefined;
  state: DepositInputState;
  /** Subtracted from the balance when a fraction (e.g. max) is selected. No-op for other currencies. */
  fee: CoinPretty | undefined;
  setAmount: (amount: string) => void;
  setFraction: (fraction: number | undefined) => void;
}): ConcentratedDepositAmount {
  const balance = getDepositBalance(currency, rawBalance);
  const amount = getDepositAmount({ state, balance, fee });

  return {
    sendCurrency: currency,
    balance,
    amount,
    fraction: state.fraction,
    isMax: state.fraction === 1,
    error: getDepositAmountError(amount, balance),
    getAmountPrimitive: () => getDepositAmountPrimitive(currency, amount),
    setAmount,
    setIsMax: (isMax) => setFraction(isMax ? 1 : undefined),
    setFraction,
  };
}
