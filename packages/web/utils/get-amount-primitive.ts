import { Currency } from "@keplr-wallet/types";
import { Dec, DecUtils } from "@keplr-wallet/unit";

export declare type CoinPrimitive = {
  denom: string;
  amount: string;
};

export const getAmountPrimitive = (
  sendCurrency: Currency,
  amountStr?: string
): CoinPrimitive => {
  if (!amountStr) {
    return {
      denom: sendCurrency.coinMinimalDenom,
      amount: "0",
    };
  }

  try {
    return {
      denom: sendCurrency.coinMinimalDenom,
      amount: new Dec(amountStr)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(sendCurrency.coinDecimals)
        )
        .truncate()
        .toString(),
    };
  } catch {
    return {
      denom: sendCurrency.coinMinimalDenom,
      amount: "0",
    };
  }
};
