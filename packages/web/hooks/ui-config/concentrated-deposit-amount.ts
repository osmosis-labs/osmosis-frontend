import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { DefaultGasPriceStep } from "@osmosis-labs/tx";
import {
  AppCurrency,
  CoinPretty,
  Currency,
  Dec,
  DecUtils,
  Int,
} from "@osmosis-labs/unit";
import { action, computed, makeObservable, observable } from "mobx";

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

/** User input for a deposit amount of a single currency. Balances are provided by the owner
 *  via `getRawBalance` (base units), so this holds no query store. Mirrors the semantics of
 *  keplr-hooks `AmountConfig`: a fraction of the balance (1 = max, less `fee` if in the same
 *  currency) takes precedence over the typed amount, and the balance reads as 0 until loaded.
 */
export class ConcentratedDepositAmount {
  @observable.ref
  protected _sendCurrency: AppCurrency;

  @observable
  protected _amount: string = "0";

  @observable
  protected _fraction: number | undefined = undefined;

  @observable.ref
  protected _fee: CoinPretty | undefined = undefined;

  constructor(
    initialSendCurrency: AppCurrency,
    /** Returns the raw balance (base units) of the denom, or undefined if none/not loaded. */
    protected readonly getRawBalance: (
      coinMinimalDenom: string
    ) => string | undefined
  ) {
    this._sendCurrency = initialSendCurrency;

    makeObservable(this);
  }

  get sendCurrency(): AppCurrency {
    return this._sendCurrency;
  }

  @action
  setSendCurrency(currency: AppCurrency) {
    this._sendCurrency = currency;
  }

  /** Fee subtracted from the balance when a fraction (e.g. max) is selected. No-op for other currencies. */
  @action
  setFee(fee: CoinPretty | undefined) {
    this._fee = fee;
  }

  @action
  setAmount(amount: string) {
    if (amount.startsWith(".")) {
      amount = "0" + amount;
    }

    if (this._fraction != null) {
      this._fraction = undefined;
    }
    this._amount = amount;
  }

  @action
  setIsMax(isMax: boolean) {
    this._fraction = isMax ? 1 : undefined;
  }

  @action
  setFraction(value: number | undefined) {
    this._fraction = value;
  }

  get isMax(): boolean {
    return this._fraction === 1;
  }

  get fraction(): number | undefined {
    return this._fraction;
  }

  /** User balance of the send currency. Zero while balances are loading. */
  @computed
  get balance(): CoinPretty {
    return new CoinPretty(
      this._sendCurrency,
      this.getRawBalance(this._sendCurrency.coinMinimalDenom) ?? 0
    );
  }

  /** Amount with decimals, as displayed to the user. */
  @computed
  get amount(): string {
    if (this._fraction != null) {
      const balance = this.balance;
      // `CoinPretty.sub` does nothing if the currencies differ.
      const result = this._fee ? balance.sub(this._fee) : balance;
      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      return result
        .mul(new Dec(this._fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
    }

    return this._amount;
  }

  getAmountPrimitive(): CoinPrimitive {
    const amountStr = this.amount;
    const sendCurrency = this._sendCurrency;

    if (!amountStr) {
      return { denom: sendCurrency.coinMinimalDenom, amount: "0" };
    }

    try {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: new Dec(amountStr)
          .mul(DecUtils.getPrecisionDec(sendCurrency.coinDecimals))
          .truncate()
          .toString(),
      };
    } catch {
      return { denom: sendCurrency.coinMinimalDenom, amount: "0" };
    }
  }

  @computed
  get error(): Error | undefined {
    const amount = this.amount;
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
    if (dec.gt(this.balance.toDec())) {
      return new InsufficientAmountError("Insufficient amount");
    }

    return;
  }
}
