import type { StdFee } from "@cosmjs/amino";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { CoinPretty } from "@osmosis-labs/unit";

export interface ITxChainSetter {
  chainId: string;
  setChain(chainId: string): void;
}

export interface IFeeConfig extends ITxChainSetter {
  feeType: FeeType | undefined;
  setFeeType(feeType: FeeType | undefined): void;
  feeCurrencies: Currency[];
  feeCurrency: Currency | undefined;
  toStdFee(): StdFee;
  fee: CoinPretty | undefined;
  getFeeTypePretty(feeType: FeeType): CoinPretty;
  getFeePrimitive(): CoinPrimitive | undefined;
  isManual: boolean;
  error: Error | undefined;
}

export interface IAmountConfig extends ITxChainSetter {
  amount: string;
  setAmount(amount: string): void;
  getAmountPrimitive(): CoinPrimitive;
  sendCurrency: AppCurrency;
  setSendCurrency(currency: AppCurrency | undefined): void;
  sendableCurrencies: AppCurrency[];
  sender: string;
  setSender(sender: string): void;

  /**
   * @deprecated Use `setFraction(1)`
   * @param isMax
   */
  setIsMax(isMax: boolean): void;

  /**
   * @deprecated
   */
  toggleIsMax(): void;

  /**
   * @deprecated Use `fraction === 1`
   */
  isMax: boolean;

  fraction: number | undefined;
  setFraction(value: number | undefined): void;

  error: Error | undefined;
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

export type FeeType = "high" | "average" | "low";
