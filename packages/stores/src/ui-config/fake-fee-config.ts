import type { StdFee } from "@cosmjs/amino";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import {
  DefaultGasPriceStep,
  FeeType,
  IFeeConfig,
} from "@osmosis-labs/keplr-hooks";
import { ChainGetter, CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

/**
 * Currencies that can be used for fees.
 */
interface FeeCurrency extends Currency {
  readonly gasPriceStep: {
    low: number;
    average: number;
    high: number;
  };
}

/**
 * FakeFeeConfig is used to set the fee with the high gas price step.
 * Currently, Keplr wallet doesn't support to set the fee manually in the frontend.
 * Keplr wallet just override the fee always in the wallet side.
 * So, setting the exact max amount is not possible.
 * To mitigate this problem, just set the max amount minus high fee setting.
 */
export class FakeFeeConfig implements IFeeConfig {
  @observable
  protected _gas: number;

  @observable
  protected _shouldZero: boolean = false;

  @observable
  chainId: string;

  constructor(
    readonly chainGetter: ChainGetter,
    initialChainId: string,
    gas: number
  ) {
    this._gas = gas;
    this.chainId = initialChainId;

    makeObservable(this);
  }

  get gas(): number {
    return this._gas;
  }

  @action
  setChain(chainId: string) {
    this.chainId = chainId;
  }

  @computed
  get fee(): CoinPretty | undefined {
    const feeCurrency = this.feeCurrency;
    const feePrimitive = this.getFeePrimitive();

    if (!feeCurrency || !feePrimitive) return undefined;

    return new CoinPretty(feeCurrency, new Int(feePrimitive.amount));
  }

  get feeCurrencies(): Currency[] {
    return this.feeCurrency ? [this.feeCurrency] : [];
  }

  get feeCurrency(): Currency | undefined {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.feeCurrencies[0];
  }

  get feeCurrencyWithGas(): FeeCurrency {
    return this.feeCurrency as FeeCurrency;
  }

  feeType: FeeType | undefined;

  get error(): Error | undefined {
    // noop
    return undefined;
  }

  get shouldZero(): boolean {
    return this._shouldZero;
  }

  @action
  setShouldZero(value: boolean) {
    this._shouldZero = value;
  }

  readonly getFeePrimitive = computedFn((): CoinPrimitive | undefined => {
    const feeCurrency = this.feeCurrency;

    if (!feeCurrency) return undefined;

    if (this.shouldZero) {
      return {
        denom: feeCurrency.coinMinimalDenom,
        amount: "0",
      };
    }

    const gasPriceStep =
      this.feeCurrencyWithGas.gasPriceStep ?? DefaultGasPriceStep;
    const feeAmount = new Dec(gasPriceStep.high.toString()).mul(
      new Dec(this.gas)
    );

    return {
      denom: feeCurrency.coinMinimalDenom,
      amount: feeAmount.truncate().toString(),
    };
  });

  getFeeTypePretty(): CoinPretty {
    // noop
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return new CoinPretty(this.feeCurrency!, new Dec(0));
  }

  setFeeType(): void {
    // noop
  }

  toStdFee(): StdFee {
    return {
      gas: this.gas.toString(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      amount: [this.getFeePrimitive()!],
    };
  }

  isManual: boolean = false;
}
